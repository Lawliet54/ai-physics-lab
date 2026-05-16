<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TaskProgressController extends Controller
{
    public function myTasks(Request $request): JsonResponse
    {
        $user = $request->user();

        $tasks = DB::table('tasks')
            ->leftJoin('task_topic_links', 'task_topic_links.task_id', '=', 'tasks.id')
            ->leftJoin('topics', 'topics.id', '=', 'task_topic_links.topic_id')
            ->leftJoin('progress_records as pr', function ($join) use ($user) {
                $join->on('pr.task_id', '=', 'tasks.id')
                    ->where('pr.user_id', '=', $user->id)
                    ->where('pr.progress_type', '=', 'task');
            })
            ->select(
                'tasks.id',
                'tasks.code',
                'tasks.title_kz',
                'tasks.instruction',
                'tasks.difficulty',
                'tasks.points',
                'topics.slug as topic_slug',
                'topics.title_kz as topic_title',
                DB::raw("COALESCE(pr.status, 'pending') as my_status")
            )
            ->where('tasks.is_published', true)
            ->orderBy('tasks.code')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function showTask(Request $request, string $taskCode): JsonResponse
    {
        $user = $request->user();

        $task = $this->findTaskByCode($taskCode);
        abort_if(! $task, 404, 'Task not found.');

        $content = $this->decodeJson($task->content_json);
        $progress = $this->findProgressRecord($user->id, $task->id);
        $attempt = $this->findLatestAttempt($user->id, $task->id);
        $snapshot = $this->decodeJson($attempt?->response_snapshot);
        $metadata = $this->decodeJson($progress?->metadata);

        $isSolved = ($progress?->status === 'completed') || (bool) ($attempt?->is_correct);

        return response()->json([
            'data' => [
                'id' => $task->id,
                'code' => $task->code,
                'title_kz' => $task->title_kz,
                'topic_title' => $task->topic_title,
                'difficulty' => $task->difficulty,
                'points' => $task->points,
                'status' => $progress?->status ?? 'pending',
                'statement' => $content['statement'] ?? $task->instruction,
                'given' => $content['given'] ?? [],
                'given_latex' => $content['given_latex'] ?? [],
                'formula' => $content['formula'] ?? null,
                'formula_latex' => $content['formula_latex'] ?? null,
                'draft_answer' => $snapshot['answer'] ?? $metadata['draft_answer'] ?? '',
                'draft_work' => $snapshot['work'] ?? $metadata['draft_work'] ?? '',
                'is_correct' => $isSolved,
                'show_solution' => $isSolved,
                'solution_steps' => $isSolved ? ($content['solution_steps'] ?? []) : [],
                'answer_display' => $isSolved ? ($content['answer_display'] ?? null) : null,
                'teacher_score' => $attempt?->reviewed_at ? $attempt->score : null,
                'teacher_feedback' => $attempt?->reviewed_at ? $attempt->feedback_summary : null,
                'last_feedback' => $snapshot['last_feedback'] ?? null,
            ],
        ]);
    }

    public function saveDraft(Request $request, string $taskId): JsonResponse
    {
        $user = $request->user();
        $task = $this->findTaskById($taskId);
        abort_if(! $task, 404, 'Task not found.');

        $payload = $request->validate([
            'answer' => ['nullable', 'string'],
            'work' => ['nullable', 'string'],
        ]);

        $now = now();
        $progress = $this->upsertProgressRecord($user->id, $task, 'in_progress', [
            'draft_answer' => $payload['answer'] ?? '',
            'draft_work' => $payload['work'] ?? '',
            'last_saved_at' => $now->toIso8601String(),
        ], 35);

        $attempt = $this->upsertAttempt($user->id, $task->id, [
            'status' => $progress->status === 'completed' ? 'completed' : 'in_progress',
            'started_at' => $progress->started_at ?? $now,
            'response_snapshot' => [
                'answer' => $payload['answer'] ?? '',
                'work' => $payload['work'] ?? '',
                'last_feedback' => null,
            ],
        ]);

        return response()->json([
            'data' => [
                'ok' => true,
                'attempt_id' => $attempt->id,
                'saved_at' => $now->toIso8601String(),
            ],
        ]);
    }

    public function checkAnswer(Request $request, string $taskId): JsonResponse
    {
        $user = $request->user();
        $task = $this->findTaskById($taskId);
        abort_if(! $task, 404, 'Task not found.');

        $payload = $request->validate([
            'answer' => ['required', 'string'],
            'work' => ['nullable', 'string'],
        ]);

        $content = $this->decodeJson($task->content_json);
        $expected = $content['expected_answer'] ?? [];
        $parsedAnswer = $this->parseNumericValue($payload['answer']);

        $correct = false;
        $feedback = 'Қате. Есептеуді қайта тексеріп көріңіз.';

        if (($expected['type'] ?? null) === 'numeric' && $parsedAnswer !== null) {
            $target = (float) ($expected['value'] ?? 0);
            $tolerance = (float) ($expected['tolerance'] ?? 0.001);
            $correct = abs($parsedAnswer - $target) <= $tolerance;
        }

        if ($correct) {
            $feedback = 'Дұрыс. Енді толық шешу жолын қарап, өз шешіміңізбен салыстыра аласыз.';
        }

        $now = now();
        $progress = $this->upsertProgressRecord($user->id, $task, $correct ? 'completed' : 'in_progress', [
            'draft_answer' => $payload['answer'],
            'draft_work' => $payload['work'] ?? '',
            'checked_at' => $now->toIso8601String(),
            'last_feedback' => $feedback,
            'is_correct' => $correct,
        ], $correct ? 100 : 45);

        $attempt = $this->upsertAttempt($user->id, $task->id, [
            'status' => $correct ? 'completed' : 'in_progress',
            'started_at' => $progress->started_at ?? $now,
            'submitted_at' => $correct ? $now : null,
            'is_correct' => $correct,
            'max_score' => 10,
            'response_snapshot' => [
                'answer' => $payload['answer'],
                'work' => $payload['work'] ?? '',
                'last_feedback' => $feedback,
            ],
        ]);

        return response()->json([
            'data' => [
                'correct' => $correct,
                'message' => $feedback,
                'show_solution' => $correct,
                'answer_display' => $correct ? ($content['answer_display'] ?? null) : null,
                'solution_steps' => $correct ? ($content['solution_steps'] ?? []) : [],
                'attempt_id' => $attempt->id,
            ],
        ]);
    }

    public function mySummary(Request $request): JsonResponse
    {
        $user = $request->user();
        $totalTasks = DB::table('tasks')->where('is_published', true)->count();

        $progressRows = DB::table('progress_records')
            ->where('user_id', $user->id)
            ->where('progress_type', 'task')
            ->get();

        $completed = $progressRows->where('status', 'completed')->count();
        $inProgress = $progressRows->where('status', 'in_progress')->count();

        $earnedPoints = (int) DB::table('tasks')
            ->join('progress_records', 'progress_records.task_id', '=', 'tasks.id')
            ->where('progress_records.user_id', $user->id)
            ->where('progress_records.progress_type', 'task')
            ->where('progress_records.status', 'completed')
            ->sum('tasks.points');

        $maxPoints = (int) DB::table('tasks')->where('is_published', true)->sum('points');

        $recentAttempts = DB::table('task_attempts')
            ->join('tasks', 'tasks.id', '=', 'task_attempts.task_id')
            ->leftJoin('task_topic_links', 'task_topic_links.task_id', '=', 'tasks.id')
            ->leftJoin('topics', 'topics.id', '=', 'task_topic_links.topic_id')
            ->select(
                'task_attempts.id',
                'task_attempts.status',
                'task_attempts.score',
                'task_attempts.reviewed_at',
                'task_attempts.submitted_at',
                'task_attempts.created_at',
                'task_attempts.response_snapshot',
                'tasks.code as task_code',
                'tasks.title_kz as task_title',
                'topics.title_kz as topic_title'
            )
            ->where('task_attempts.user_id', $user->id)
            ->orderByDesc('task_attempts.updated_at')
            ->limit(12)
            ->get()
            ->map(function ($attempt) {
                $attempt->response_snapshot = $this->decodeJson($attempt->response_snapshot);
                return $attempt;
            });

        $dailyActivity = $this->buildDailyActivity($user->id);

        return response()->json([
            'data' => [
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completed,
                'in_progress_tasks' => $inProgress,
                'earned_points' => $earnedPoints,
                'max_points' => $maxPoints,
                'daily_activity' => $dailyActivity,
                'recent_attempts' => $recentAttempts,
            ],
        ]);
    }

    public function teacherStats(Request $request): JsonResponse
    {
        $students = DB::table('users')
            ->join('user_roles', 'user_roles.user_id', '=', 'users.id')
            ->join('roles', 'roles.id', '=', 'user_roles.role_id')
            ->where('roles.role_key', 'student')
            ->select('users.id', 'users.display_name', 'users.username')
            ->orderBy('users.display_name')
            ->get();

        $rows = [];
        foreach ($students as $student) {
            $progress = DB::table('progress_records')
                ->where('user_id', $student->id)
                ->where('progress_type', 'task')
                ->get();

            $attempts = DB::table('task_attempts')
                ->join('tasks', 'tasks.id', '=', 'task_attempts.task_id')
                ->leftJoin('task_topic_links', 'task_topic_links.task_id', '=', 'tasks.id')
                ->leftJoin('topics', 'topics.id', '=', 'task_topic_links.topic_id')
                ->select(
                    'task_attempts.id',
                    'task_attempts.status',
                    'task_attempts.score',
                    'task_attempts.reviewed_at',
                    'task_attempts.feedback_summary',
                    'task_attempts.response_snapshot',
                    'task_attempts.created_at',
                    'tasks.code as task_code',
                    'tasks.title_kz as task_title',
                    'topics.title_kz as topic_title'
                )
                ->where('task_attempts.user_id', $student->id)
                ->orderByDesc('task_attempts.updated_at')
                ->get()
                ->unique('task_code')
                ->values()
                ->map(function ($attempt) {
                    $attempt->response_snapshot = $this->decodeJson($attempt->response_snapshot);
                    return $attempt;
                });

            $rows[] = [
                'user_id' => $student->id,
                'display_name' => $student->display_name,
                'username' => $student->username,
                'completed_tasks' => $progress->where('status', 'completed')->count(),
                'in_progress_tasks' => $progress->where('status', 'in_progress')->count(),
                'earned_points' => (int) DB::table('tasks')
                    ->join('progress_records', 'progress_records.task_id', '=', 'tasks.id')
                    ->where('progress_records.user_id', $student->id)
                    ->where('progress_records.progress_type', 'task')
                    ->where('progress_records.status', 'completed')
                    ->sum('tasks.points'),
                'attempts' => $attempts,
            ];
        }

        return response()->json(['data' => $rows]);
    }

    public function reviewAttempt(Request $request, string $attemptId): JsonResponse
    {
        $teacher = $request->user();
        $payload = $request->validate([
            'score' => ['required', 'integer', 'min:1', 'max:10'],
            'feedback' => ['nullable', 'string'],
        ]);

        $attempt = DB::table('task_attempts')->where('id', $attemptId)->first();
        abort_if(! $attempt, 404, 'Attempt not found.');

        DB::table('task_attempts')->where('id', $attemptId)->update([
            'score' => $payload['score'],
            'max_score' => 10,
            'reviewed_at' => now(),
            'feedback_summary' => $payload['feedback'] ?? null,
            'evaluator_user_id' => $teacher->id,
            'updated_at' => now(),
        ]);

        DB::table('progress_records')
            ->where('user_id', $attempt->user_id)
            ->where('task_id', $attempt->task_id)
            ->where('progress_type', 'task')
            ->update([
                'score' => $payload['score'],
                'updated_at' => now(),
            ]);

        return response()->json(['data' => ['ok' => true]]);
    }

    private function findTaskById(string $taskId): ?object
    {
        return DB::table('tasks')->where('id', $taskId)->first();
    }

    private function findTaskByCode(string $taskCode): ?object
    {
        return DB::table('tasks')
            ->leftJoin('task_topic_links', 'task_topic_links.task_id', '=', 'tasks.id')
            ->leftJoin('topics', 'topics.id', '=', 'task_topic_links.topic_id')
            ->select('tasks.*', 'topics.title_kz as topic_title')
            ->where('tasks.code', $taskCode)
            ->first();
    }

    private function findProgressRecord(string $userId, string $taskId): ?object
    {
        return DB::table('progress_records')
            ->where('user_id', $userId)
            ->where('task_id', $taskId)
            ->where('progress_type', 'task')
            ->first();
    }

    private function findLatestAttempt(string $userId, string $taskId): ?object
    {
        return DB::table('task_attempts')
            ->where('user_id', $userId)
            ->where('task_id', $taskId)
            ->orderByDesc('updated_at')
            ->first();
    }

    private function upsertProgressRecord(string $userId, object $task, string $status, array $metadata, int $progressPercent): object
    {
        $now = now();
        $topicId = DB::table('task_topic_links')->where('task_id', $task->id)->value('topic_id');
        $subjectId = DB::table('topics')->where('id', $topicId)->value('subject_id');
        $existing = $this->findProgressRecord($userId, $task->id);

        if ($existing) {
            $currentMetadata = $this->decodeJson($existing->metadata);
            DB::table('progress_records')->where('id', $existing->id)->update([
                'status' => $status === 'in_progress' && $existing->status === 'completed' ? 'completed' : $status,
                'progress_percent' => $status === 'in_progress' && $existing->status === 'completed' ? 100 : $progressPercent,
                'started_at' => $existing->started_at ?: $now,
                'completed_at' => $status === 'completed' ? ($existing->completed_at ?: $now) : $existing->completed_at,
                'metadata' => json_encode([...$currentMetadata, ...$metadata], JSON_UNESCAPED_UNICODE),
                'updated_at' => $now,
            ]);

            return (object) [
                ...get_object_vars($existing),
                'status' => $status === 'in_progress' && $existing->status === 'completed' ? 'completed' : $status,
                'started_at' => $existing->started_at ?: $now,
            ];
        }

        $record = [
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'subject_id' => $subjectId,
            'topic_id' => $topicId,
            'theory_id' => null,
            'lab_id' => null,
            'task_id' => $task->id,
            'progress_type' => 'task',
            'status' => $status,
            'progress_percent' => $progressPercent,
            'score' => null,
            'started_at' => $status !== 'pending' ? $now : null,
            'completed_at' => $status === 'completed' ? $now : null,
            'metadata' => json_encode($metadata, JSON_UNESCAPED_UNICODE),
            'created_at' => $now,
            'updated_at' => $now,
        ];

        DB::table('progress_records')->insert($record);

        return (object) $record;
    }

    private function upsertAttempt(string $userId, string $taskId, array $changes): object
    {
        $now = now();
        $attempt = $this->findLatestAttempt($userId, $taskId);
        $snapshot = json_encode($changes['response_snapshot'] ?? [], JSON_UNESCAPED_UNICODE);

        if ($attempt && ! $attempt->reviewed_at) {
            DB::table('task_attempts')->where('id', $attempt->id)->update([
                'status' => $changes['status'] ?? $attempt->status,
                'started_at' => $changes['started_at'] ?? $attempt->started_at ?? $now,
                'submitted_at' => $changes['submitted_at'] ?? $attempt->submitted_at,
                'is_correct' => $changes['is_correct'] ?? $attempt->is_correct,
                'max_score' => $changes['max_score'] ?? $attempt->max_score ?? 10,
                'response_snapshot' => $snapshot,
                'updated_at' => $now,
            ]);

            return (object) [
                ...get_object_vars($attempt),
                'status' => $changes['status'] ?? $attempt->status,
                'response_snapshot' => $snapshot,
            ];
        }

        $attemptNumber = ((int) DB::table('task_attempts')
            ->where('user_id', $userId)
            ->where('task_id', $taskId)
            ->max('attempt_number')) + 1;

        $newAttempt = [
            'id' => (string) Str::uuid(),
            'task_id' => $taskId,
            'task_variant_id' => null,
            'user_id' => $userId,
            'class_id' => null,
            'status' => $changes['status'] ?? 'in_progress',
            'attempt_number' => max($attemptNumber, 1),
            'started_at' => $changes['started_at'] ?? $now,
            'submitted_at' => $changes['submitted_at'] ?? null,
            'reviewed_at' => null,
            'duration_seconds' => null,
            'score' => null,
            'max_score' => $changes['max_score'] ?? 10,
            'is_correct' => $changes['is_correct'] ?? null,
            'used_hint' => false,
            'source_lab_attempt_id' => null,
            'response_snapshot' => $snapshot,
            'feedback_summary' => null,
            'evaluator_user_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        DB::table('task_attempts')->insert($newAttempt);

        return (object) $newAttempt;
    }

    private function buildDailyActivity(string $userId): array
    {
        $days = collect(range(6, 0))->map(function ($offset) {
            $date = now()->subDays($offset);

            return [
                'date' => $date->toDateString(),
                'label' => $date->locale('kk')->translatedFormat('D'),
                'completed_count' => 0,
                'teacher_score' => 0,
            ];
        })->keyBy('date');

        $attempts = DB::table('task_attempts')
            ->where('user_id', $userId)
            ->whereNotNull('submitted_at')
            ->get();

        foreach ($attempts as $attempt) {
            $date = substr((string) $attempt->submitted_at, 0, 10);
            if (! $days->has($date)) {
                continue;
            }

            $day = $days[$date];
            $day['completed_count'] += 1;
            $day['teacher_score'] += (int) ($attempt->score ?? 0);
            $days[$date] = $day;
        }

        return $days->values()->all();
    }

    private function decodeJson(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (! is_string($value) || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function parseNumericValue(string $raw): ?float
    {
        $value = trim($raw);
        if ($value === '') {
            return null;
        }

        // Accept user input like:
        // "0,4625", "0.4625", "0,4625 Н", "F = 0,4625N", "0,4625Н"
        // Extract the first numeric token and ignore units/extra text.
        if (! preg_match('/[-+]?\d+(?:[.,]\d+)?(?:[eE][-+]?\d+)?/u', $value, $matches)) {
            return null;
        }

        $token = $matches[0];
        $token = str_replace(',', '.', $token);

        if (! is_numeric($token)) {
            return null;
        }

        return (float) $token;
    }
}
