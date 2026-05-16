<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TaskElectricFieldSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Ensure electric-field topic exists
        $topic = DB::table('topics')->where('slug', 'electric-field')->first();
        if (! $topic) {
            // Nothing to link to; keep it no-op instead of crashing.
            return;
        }

        $taskExplanation = 'Шартты мұқият оқып, формула(лар)ды дұрыс таңдаңыз. Шамаларды SI жүйесіне келтіріп, есептеуді ретімен көрсетіңіз.';

        $tasks = [
            'T-04' => [
                'title_kz' => 'Нүктелік заряд тудыратын электр өрісінің кернеулігін табу',
                'difficulty' => 'basic',
                'points' => 10,
                'content' => [
                    'statement' => 'Вакуумде орналасқан нүктелік зарядтың шамасы q = +5 мкКл. Осы зарядтан 0,2 м қашықтықтағы нүктедегі электр өрісінің кернеулігін табыңдар.',
                    'given' => [
                        'q = +5 мкКл = 5 · 10^-6 Кл',
                        'r = 0,2 м',
                        'k = 9 · 10^9 Н·м^2/Кл^2',
                    ],
                    'given_latex' => [
                        'q = +5\\,\\mu\\text{Кл} = 5\\cdot 10^{-6}\\,\\text{Кл}',
                        'r = 0{,}2\\,\\text{м}',
                        'k = 9\\cdot 10^{9}\\,\\text{Н}\\cdot\\text{м}^{2}/\\text{Кл}^{2}',
                    ],
                    'formula' => 'E = k * |q| / r^2',
                    'formula_latex' => 'E = k \\frac{|q|}{r^2}',
                    'expected_answer' => ['type' => 'numeric', 'value' => 1125000.0, 'tolerance' => 5],
                    'answer_display' => 'E = 1,125 · 10^6 Н/Кл',
                    'solution_steps' => [
                        'Формула: E = k·|q|/r^2.',
                        'Берілгендерді қоямыз: E = 9·10^9 · (5·10^-6) / 0,2^2.',
                        'Қашықтықтың квадратын табамыз: 0,2^2 = 0,04.',
                        'Алымын есептейміз: 9·10^9 · 5·10^-6 = 45·10^3 = 45000.',
                        'Соңында: E = 45000 / 0,04 = 1 125 000 Н/Кл.',
                    ],
                ],
            ],
            'T-05' => [
                'title_kz' => 'Электр өрісіндегі зарядқа әсер ететін күшті анықтау',
                'difficulty' => 'intermediate',
                'points' => 15,
                'content' => [
                    'statement' => 'Біртекті электр өрісінің кернеулігі E = 3000 Н/Кл. Осы өріске шамасы q = 4 мкКл болатын оң заряд орналастырылды. Зарядқа әсер ететін электр күшін табыңдар.',
                    'given' => [
                        'E = 3000 Н/Кл',
                        'q = 4 мкКл = 4 · 10^-6 Кл',
                    ],
                    'given_latex' => [
                        'E = 3000\\,\\text{Н}/\\text{Кл}',
                        'q = 4\\,\\mu\\text{Кл} = 4\\cdot 10^{-6}\\,\\text{Кл}',
                    ],
                    'formula' => 'F = q * E',
                    'formula_latex' => 'F = qE',
                    'expected_answer' => ['type' => 'numeric', 'value' => 0.012, 'tolerance' => 0.0005],
                    'answer_display' => 'F = 0,012 Н',
                    'solution_steps' => [
                        'Формула: F = qE.',
                        'q мәнін SI жүйесіне келтіреміз: 4 мкКл = 4·10^-6 Кл.',
                        'Берілгендерді қоямыз: F = 4·10^-6 · 3000.',
                        '3000 = 3·10^3, сонда: F = 4·10^-6 · 3·10^3 = 12·10^-3 Н.',
                        'Демек: F = 0,012 Н.',
                    ],
                ],
            ],
            'T-06' => [
                'title_kz' => 'Бірнеше заряд тудыратын қорытқы электр өрісін есептеу',
                'difficulty' => 'advanced',
                'points' => 20,
                'content' => [
                    'statement' => 'Бір түзудің бойында екі оң заряд орналасқан: q1 = +3 мкКл және q2 = +6 мкКл. Олардың арақашықтығы 0,6 м. Осы екі зарядтың дәл ортасындағы A нүктедегі қорытқы электр өрісінің кернеулігін табыңдар. (q1 — 0,3 м — A — 0,3 м — q2)',
                    'given' => [
                        'q1 = +3 мкКл = 3 · 10^-6 Кл',
                        'q2 = +6 мкКл = 6 · 10^-6 Кл',
                        'r1 = 0,3 м',
                        'r2 = 0,3 м',
                        'k = 9 · 10^9 Н·м^2/Кл^2',
                    ],
                    'given_latex' => [
                        'q_1 = +3\\,\\mu\\text{Кл} = 3\\cdot 10^{-6}\\,\\text{Кл}',
                        'q_2 = +6\\,\\mu\\text{Кл} = 6\\cdot 10^{-6}\\,\\text{Кл}',
                        'r_1 = 0{,}3\\,\\text{м}',
                        'r_2 = 0{,}3\\,\\text{м}',
                        'k = 9\\cdot 10^{9}\\,\\text{Н}\\cdot\\text{м}^{2}/\\text{Кл}^{2}',
                    ],
                    'formula' => 'E_net = E2 - E1',
                    'formula_latex' => 'E_{\\text{қорытқы}} = E_2 - E_1',
                    'expected_answer' => ['type' => 'numeric', 'value' => 300000.0, 'tolerance' => 200],
                    'answer_display' => 'Eқорытқы = 3 · 10^5 Н/Кл, бағыты солға қарай',
                    'solution_steps' => [
                        'A нүктесі екі зарядтың дәл ортасында, сондықтан r1 = r2 = 0,3 м.',
                        'Әр заряд тудыратын өріс: E = k·|q|/r^2.',
                        'E1 = 9·10^9 · (3·10^-6) / 0,3^2 = 27000 / 0,09 = 300000 Н/Кл (A нүктесінде оңға қарай).',
                        'E2 = 9·10^9 · (6·10^-6) / 0,3^2 = 54000 / 0,09 = 600000 Н/Кл (A нүктесінде солға қарай).',
                        'Өрістер қарама-қарсы бағытталғандықтан: Eқорытқы = E2 − E1 = 600000 − 300000 = 300000 Н/Кл.',
                        'Үлкен өріс q2 жағынан, сондықтан қорытқы өріс бағыты солға қарай.',
                    ],
                ],
            ],
        ];

        foreach ($tasks as $code => $spec) {
            $existing = DB::table('tasks')->where('code', $code)->first();
            $taskId = $existing?->id ?: (string) Str::uuid();

            $taskRow = [
                'task_type' => 'numeric',
                'code' => $code,
                'title_kz' => $spec['title_kz'],
                'instruction' => $spec['title_kz'],
                'explanation' => $taskExplanation,
                'difficulty' => $spec['difficulty'],
                'grade_level' => null,
                'estimated_minutes' => 8,
                'points' => $spec['points'],
                'is_published' => true,
                'content_json' => json_encode($spec['content'], JSON_UNESCAPED_UNICODE),
                'metadata' => json_encode(['topic_slug' => 'electric-field'], JSON_UNESCAPED_UNICODE),
                'published_at' => $now,
                'updated_at' => $now,
            ];

            if ($existing) {
                DB::table('tasks')->where('id', $taskId)->update($taskRow);
            } else {
                DB::table('tasks')->insert([
                    'id' => $taskId,
                    ...$taskRow,
                    'created_at' => $now,
                ]);
            }

            DB::table('task_topic_links')->where('task_id', $taskId)->delete();
            DB::table('task_topic_links')->insert([
                'id' => (string) Str::uuid(),
                'task_id' => $taskId,
                'topic_id' => $topic->id,
                'relation_type' => 'primary',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}

