<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function subjects(): JsonResponse
    {
        return response()->json([
            'data' => DB::table('subjects')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    }

    public function topics(Request $request): JsonResponse
    {
        $query = DB::table('topics')
            ->join('subjects', 'subjects.id', '=', 'topics.subject_id')
            ->select('topics.*', 'subjects.code as subject_code', 'subjects.name_kz as subject_name')
            ->where('topics.is_published', true)
            ->orderBy('topics.sort_order');

        if ($request->filled('subject')) {
            $query->where('subjects.code', $request->string('subject'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function theories(Request $request): JsonResponse
    {
        $query = DB::table('theories')
            ->join('topics', 'topics.id', '=', 'theories.topic_id')
            ->select('theories.*', 'topics.slug as topic_slug', 'topics.title_kz as topic_title')
            ->where('theories.is_published', true)
            ->orderBy('theories.code');

        if ($request->filled('topic')) {
            $query->where('topics.slug', $request->string('topic'));
        }

        return response()->json([
            'data' => $query->get()->map(fn ($theory) => $this->decodeJsonFields($theory)),
        ]);
    }

    public function theory(string $slug): JsonResponse
    {
        $theory = DB::table('theories')
            ->join('topics', 'topics.id', '=', 'theories.topic_id')
            ->select('theories.*', 'topics.slug as topic_slug', 'topics.title_kz as topic_title')
            ->where('theories.slug', $slug)
            ->where('theories.is_published', true)
            ->first();

        abort_if(! $theory, 404, 'Theory not found.');

        $blocks = DB::table('theory_blocks')
            ->where('theory_id', $theory->id)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($block) => $this->decodeJsonFields($block));

        $formulae = DB::table('theory_formulae')
            ->where('theory_id', $theory->id)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($formula) => $this->decodeJsonFields($formula));

        return response()->json([
            'data' => [
                ...get_object_vars($this->decodeJsonFields($theory)),
                'blocks' => $blocks,
                'formulae' => $formulae,
            ],
        ]);
    }

    public function tasks(Request $request): JsonResponse
    {
        $query = DB::table('tasks')
            ->leftJoin('task_topic_links', 'task_topic_links.task_id', '=', 'tasks.id')
            ->leftJoin('topics', 'topics.id', '=', 'task_topic_links.topic_id')
            ->select('tasks.*', 'topics.slug as topic_slug', 'topics.title_kz as topic_title')
            ->where('tasks.is_published', true)
            ->orderBy('tasks.code');

        if ($request->filled('topic')) {
            $query->where('topics.slug', $request->string('topic'));
        }

        return response()->json([
            'data' => $query->get()->map(fn ($task) => $this->decodeJsonFields($task)),
        ]);
    }

    public function labs(Request $request): JsonResponse
    {
        $query = DB::table('labs')
            ->join('topics', 'topics.id', '=', 'labs.topic_id')
            ->select('labs.*', 'topics.slug as topic_slug', 'topics.title_kz as topic_title')
            ->where('labs.is_published', true)
            ->orderBy('labs.slug');

        if ($request->filled('topic')) {
            $query->where('topics.slug', $request->string('topic'));
        }

        return response()->json([
            'data' => $query->get()->map(fn ($lab) => $this->decodeJsonFields($lab)),
        ]);
    }

    private function decodeJsonFields(object $row): object
    {
        foreach (['metadata', 'content_json', 'config', 'content_json', 'variables'] as $field) {
            if (isset($row->{$field}) && is_string($row->{$field})) {
                $row->{$field} = json_decode($row->{$field}, true) ?: null;
            }
        }

        return $row;
    }
}
