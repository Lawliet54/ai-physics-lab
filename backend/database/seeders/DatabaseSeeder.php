<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Idempotent seed: upsert roles/users by stable keys (role_key, username).
        $roles = [];
        foreach (['student', 'teacher', 'admin'] as $key) {
            $existingRole = DB::table('roles')->where('role_key', $key)->first();
            $roleId = $existingRole?->id ?: (string) Str::uuid();
            $roleRow = [
                'role_key' => $key,
                'name' => ucfirst($key),
                'description' => "Platform {$key} role",
                'updated_at' => $now,
            ];

            if ($existingRole) {
                DB::table('roles')->where('id', $roleId)->update($roleRow);
            } else {
                DB::table('roles')->insert([
                    'id' => $roleId,
                    ...$roleRow,
                    'created_at' => $now,
                ]);
            }

            $roles[$key] = $roleId;
        }

        $adminId = (string) (DB::table('users')->where('username', 'admin')->value('id') ?: Str::uuid());
        $adminRow = [
            'name' => 'Platform Admin',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin12345'),
            'first_name' => 'Platform',
            'last_name' => 'Admin',
            'display_name' => 'Platform Admin',
            'preferred_locale' => 'kk',
            'is_active' => true,
            'must_change_password' => false,
            'password_changed_at' => $now,
            'settings' => json_encode(['theme' => 'lab'], JSON_UNESCAPED_UNICODE),
            'updated_at' => $now,
        ];
        if (DB::table('users')->where('id', $adminId)->exists()) {
            DB::table('users')->where('id', $adminId)->update($adminRow);
        } else {
            DB::table('users')->insert(['id' => $adminId, ...$adminRow, 'created_at' => $now]);
        }

        $teacherId = (string) (DB::table('users')->where('username', 'teacher')->value('id') ?: Str::uuid());
        $teacherRow = [
            'name' => 'AI Physics Teacher',
            'username' => 'teacher',
            'email' => 'teacher@example.com',
            'password' => Hash::make('teacher12345'),
            'first_name' => 'AI',
            'last_name' => 'Teacher',
            'display_name' => 'AI Physics Teacher',
            'preferred_locale' => 'kk',
            'is_active' => true,
            'must_change_password' => true,
            'settings' => json_encode(['theme' => 'lab'], JSON_UNESCAPED_UNICODE),
            'created_by' => $adminId,
            'updated_at' => $now,
        ];
        if (DB::table('users')->where('id', $teacherId)->exists()) {
            DB::table('users')->where('id', $teacherId)->update($teacherRow);
        } else {
            DB::table('users')->insert(['id' => $teacherId, ...$teacherRow, 'created_at' => $now]);
        }

        $studentId = (string) (DB::table('users')->where('username', 'student')->value('id') ?: Str::uuid());
        $studentRow = [
            'name' => 'Demo Student',
            'username' => 'student',
            'email' => 'student@example.com',
            'password' => Hash::make('student12345'),
            'first_name' => 'Demo',
            'last_name' => 'Student',
            'display_name' => 'Demo Student',
            'preferred_locale' => 'kk',
            'is_active' => true,
            'must_change_password' => false,
            'settings' => json_encode(['theme' => 'lab'], JSON_UNESCAPED_UNICODE),
            'created_by' => $teacherId,
            'updated_at' => $now,
        ];
        if (DB::table('users')->where('id', $studentId)->exists()) {
            DB::table('users')->where('id', $studentId)->update($studentRow);
        } else {
            DB::table('users')->insert(['id' => $studentId, ...$studentRow, 'created_at' => $now]);
        }

        // Ensure roles are attached (idempotent).
        DB::table('user_roles')->whereIn('user_id', [$adminId, $teacherId, $studentId])->delete();
        DB::table('user_roles')->insert([
            [
                'id' => (string) Str::uuid(),
                'user_id' => $adminId,
                'role_id' => $roles['admin'],
                'assigned_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $teacherId,
                'role_id' => $roles['teacher'],
                'assigned_by' => $adminId,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $studentId,
                'role_id' => $roles['student'],
                'assigned_by' => $teacherId,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $subjectId = (string) Str::uuid();
        DB::table('subjects')->insert([
            'id' => $subjectId,
            'code' => 'physics-electricity',
            'name_kz' => 'Электр және магнетизм',
            'name_ru' => 'Электричество и магнетизм',
            'name_en' => 'Electricity and Magnetism',
            'description' => 'Электростатика, тізбектер, магнетизм және индукция бойынша интерактивті курс.',
            'grade_from' => 7,
            'grade_to' => 11,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $topics = [
            ['slug' => 'electrostatics', 'title' => 'Электростатика', 'difficulty' => 'basic', 'sort' => 1],
            ['slug' => 'circuits', 'title' => 'Тізбектер', 'difficulty' => 'basic', 'sort' => 2],
            ['slug' => 'magnetism', 'title' => 'Магнетизм', 'difficulty' => 'intermediate', 'sort' => 3],
            ['slug' => 'induction', 'title' => 'Индукция', 'difficulty' => 'advanced', 'sort' => 4],

            // Lesson-level topics for the Tasks page filters (15 topics requested).
            ['slug' => 'coulombs-law', 'title' => 'Кулон заңы', 'difficulty' => 'basic', 'sort' => 10],
            ['slug' => 'electric-field', 'title' => 'Электр өрісі', 'difficulty' => 'basic', 'sort' => 11],
            ['slug' => 'electric-potential', 'title' => 'Электр потенциалы', 'difficulty' => 'basic', 'sort' => 12],
            ['slug' => 'capacitance', 'title' => 'Конденсатор сыйымдылығы', 'difficulty' => 'basic', 'sort' => 13],
            ['slug' => 'ohms-law', 'title' => 'Ом заңы', 'difficulty' => 'basic', 'sort' => 14],
            ['slug' => 'series-parallel', 'title' => 'Тізбектей және параллель жалғау', 'difficulty' => 'basic', 'sort' => 15],
            ['slug' => 'emf-internal-resistance', 'title' => 'Ток көзінің ЭҚК-і және ішкі кедергісі', 'difficulty' => 'intermediate', 'sort' => 16],
            ['slug' => 'full-circuit-ohms-law', 'title' => 'Толық тізбек үшін Ом заңы', 'difficulty' => 'intermediate', 'sort' => 17],
            ['slug' => 'electric-work-power', 'title' => 'Электр тогының жұмысы мен қуаты', 'difficulty' => 'intermediate', 'sort' => 18],
            ['slug' => 'magnetic-field', 'title' => 'Магнит өрісі', 'difficulty' => 'intermediate', 'sort' => 19],
            ['slug' => 'ampere-force', 'title' => 'Ампер күші', 'difficulty' => 'intermediate', 'sort' => 20],
            ['slug' => 'lorentz-force', 'title' => 'Лоренц күші', 'difficulty' => 'advanced', 'sort' => 21],
            ['slug' => 'electromagnetic-induction', 'title' => 'Электромагниттік индукция', 'difficulty' => 'advanced', 'sort' => 22],
            ['slug' => 'lenz-law', 'title' => 'Ленц ережесі', 'difficulty' => 'advanced', 'sort' => 23],
            ['slug' => 'electric-generator', 'title' => 'Электр генераторы', 'difficulty' => 'advanced', 'sort' => 24],
        ];

        $topicIds = [];
        foreach ($topics as $topic) {
            $topicIds[$topic['slug']] = (string) Str::uuid();
            DB::table('topics')->insert([
                'id' => $topicIds[$topic['slug']],
                'subject_id' => $subjectId,
                'slug' => $topic['slug'],
                'title_kz' => $topic['title'],
                'summary' => "{$topic['title']} бөлімі бойынша негізгі теория, есептер және виртуалды тәжірибелер.",
                'difficulty' => $topic['difficulty'],
                'grade_level' => null,
                'sort_order' => $topic['sort'],
                'is_published' => true,
                'metadata' => json_encode(['accent' => $topic['slug']]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $theories = [
            ['TH-01', 'electric-charge', 'electrostatics', 'Электр заряды', 'q = ne', 'Элементар заряд ұғымы, зарядтың сақталу заңы және зарядталған денелердің қасиеттері.', 'basic'],
            ['TH-02', 'coulomb-law', 'electrostatics', 'Кулон заңы', 'F = k|q₁q₂| / r²', 'Екі нүктелік заряд арасындағы электростатикалық өзара әрекеттесу күшін сипаттайтын заң.', 'intermediate'],
            ['TH-03', 'electric-field', 'electrostatics', 'Электр өрісі', 'E = F / q = kQ / r²', 'Электр өрісінің кернеулігі, өріс сызықтары және суперпозиция принципі.', 'intermediate'],
            ['TH-04', 'electric-potential', 'electrostatics', 'Электр потенциалы', 'φ = W / q = kQ / r', 'Потенциал және потенциалдар айырмасы, эквипотенциалды беттер мен жұмыс байланысы.', 'intermediate'],
            ['TH-05', 'capacitors', 'electrostatics', 'Конденсаторлар', 'C = Q / U = εε₀S / d', 'Электр сыйымдылығы, жазық конденсатор, диэлектриктер мен энергия жинақтау.', 'intermediate'],
            ['TH-06', 'ohms-law', 'circuits', 'Ом заңы', 'I = U / R', 'Тізбек бөлігі үшін Ом заңы, кедергі ұғымы және вольт-амперлік сипаттама.', 'basic'],
            ['TH-07', 'kirchhoff-laws', 'circuits', 'Кирхгоф ережелері', 'ΣI = 0; ΣU = Σε', 'Тізбек торабындағы токтар мен ілмектегі кернеулер үшін Кирхгоф ережелері.', 'advanced'],
            ['TH-08', 'electric-power', 'circuits', 'Ток жұмысы мен қуаты', 'P = UI = I²R = U² / R', 'Электр тогының атқаратын жұмысы, қуаты және Джоуль-Ленц заңы.', 'intermediate'],
            ['TH-09', 'magnetic-field', 'magnetism', 'Магнит өрісі', 'B = μ₀I / 2πr', 'Тогы бар өткізгіш тудыратын магнит өрісі, индукция векторы және магнит ағыны.', 'intermediate'],
            ['TH-10', 'ampere-force', 'magnetism', 'Ампер күші', 'F = BIl sin α', 'Магнит өрісіндегі токты өткізгішке әсер ететін күш.', 'intermediate'],
            ['TH-11', 'lorentz-force', 'magnetism', 'Лоренц күші', 'F = qvB sin α', 'Магнит өрісінде қозғалатын зарядқа әсер ететін Лоренц күші.', 'advanced'],
            ['TH-12', 'electromagnetic-induction', 'induction', 'Электромагниттік индукция', 'ε = −ΔΦ / Δt', 'Фарадей заңы, индукциялық ЭҚК, Ленц ережесі және өздік индукция.', 'advanced'],
        ];

        $theoryIds = [];
        foreach ($theories as [$code, $slug, $topic, $title, $formula, $intro, $difficulty]) {
            $theoryId = (string) Str::uuid();
            $theoryIds[$slug] = $theoryId;
            DB::table('theories')->insert([
                'id' => $theoryId,
                'topic_id' => $topicIds[$topic],
                'slug' => $slug,
                'code' => $code,
                'title_kz' => $title,
                'intro_text' => $intro,
                'formula' => $formula,
                'estimated_minutes' => 8,
                'difficulty' => $difficulty,
                'is_published' => true,
                'metadata' => json_encode(['frontend_id' => $slug]),
                'published_at' => $now,
                'created_by' => $adminId,
                'updated_by' => $teacherId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach (['Негізгі ұғым', 'Формула мағынасы', 'Практикалық қолданылуы'] as $index => $heading) {
                DB::table('theory_blocks')->insert([
                    'id' => (string) Str::uuid(),
                    'theory_id' => $theoryId,
                    'block_type' => 'paragraph',
                    'title_kz' => $heading,
                    'content' => $index === 0 ? $intro : "{$title} тақырыбын есеп шығаруда және виртуалды тәжірибеде қолдануға болады.",
                    'content_json' => json_encode([]),
                    'sort_order' => $index + 1,
                    'metadata' => json_encode([]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        $taskSpecs = [
            // 1. Кулон заңы
            ['coulombs-law', 'basic', 'Екі зарядтың өзара әсерлесу күшін табу'],
            ['coulombs-law', 'intermediate', 'Қашықтық өзгергенде Кулон күшінің қалай өзгеретінін анықтау'],
            ['coulombs-law', 'advanced', 'Бір түзудің бойында орналасқан үш зарядқа әсер ететін қорытқы күшті есептеу'],

            // 2. Электр өрісі
            ['electric-field', 'basic', 'Нүктелік заряд тудыратын электр өрісінің кернеулігін табу'],
            ['electric-field', 'intermediate', 'Электр өрісіндегі зарядқа әсер ететін күшті анықтау'],
            ['electric-field', 'advanced', 'Бірнеше заряд тудыратын қорытқы электр өрісін есептеу'],

            // 3. Электр потенциалы
            ['electric-potential', 'basic', 'Нүктелік зарядтың электр потенциалын табу'],
            ['electric-potential', 'intermediate', 'Потенциалдар айырымы арқылы зарядтың энергиясын есептеу'],
            ['electric-potential', 'advanced', 'Бірнеше заряд тудыратын қорытқы потенциалды анықтау'],

            // 4. Конденсатор сыйымдылығы
            ['capacitance', 'basic', 'Конденсатордың сыйымдылығын заряд пен кернеу арқылы табу'],
            ['capacitance', 'intermediate', 'Жазық конденсатор сыйымдылығының пластина ауданы мен арақашықтыққа тәуелділігін анықтау'],
            ['capacitance', 'advanced', 'Конденсаторда жиналған энергияны және электр өрісінің жұмысын есептеу'],

            // 5. Ом заңы
            ['ohms-law', 'basic', 'Ток күшін кернеу мен кедергі арқылы есептеу'],
            ['ohms-law', 'intermediate', 'Электр тізбегіндегі белгісіз кедергіні табу'],
            ['ohms-law', 'advanced', 'Кедергі өзгергенде ток күші мен кернеудің өзгерісін талдау'],

            // 6. Тізбектей және параллель жалғау
            ['series-parallel', 'basic', 'Тізбектей жалғанған резисторлардың жалпы кедергісін табу'],
            ['series-parallel', 'intermediate', 'Параллель жалғанған резисторлардың жалпы кедергісін есептеу'],
            ['series-parallel', 'advanced', 'Аралас жалғанған электр тізбегінің жалпы кедергісін анықтау'],

            // 7. Ток көзінің ЭҚК-і және ішкі кедергісі
            ['emf-internal-resistance', 'basic', 'Ток көзінің ЭҚК-і мен кернеуінің айырмашылығын түсіндіру'],
            ['emf-internal-resistance', 'intermediate', 'Ішкі кедергісі бар ток көзінің қысқыштарындағы кернеуді табу'],
            ['emf-internal-resistance', 'advanced', 'Ішкі кедергіні тәжірибелік мәліметтер арқылы анықтау'],

            // 8. Толық тізбек үшін Ом заңы
            ['full-circuit-ohms-law', 'basic', 'Толық тізбектегі ток күшін есептеу'],
            ['full-circuit-ohms-law', 'intermediate', 'Сыртқы және ішкі кедергілердің ток күшіне әсерін анықтау'],
            ['full-circuit-ohms-law', 'advanced', 'Толық тізбекте пайдалы қуат пен шығын қуатты салыстыру'],

            // 9. Электр тогының жұмысы мен қуаты
            ['electric-work-power', 'basic', 'Электр тогының жұмысын есептеу'],
            ['electric-work-power', 'intermediate', 'Электр құрылғысының қуатын ток күші мен кернеу арқылы табу'],
            ['electric-work-power', 'advanced', 'Электр энергиясының шығынын және құрылғының тиімділігін есептеу'],

            // 10. Магнит өрісі
            ['magnetic-field', 'basic', 'Магнит өрісінің бағытын күш сызықтары арқылы анықтау'],
            ['magnetic-field', 'intermediate', 'Тогы бар өткізгіштің айналасындағы магнит өрісін сипаттау'],
            ['magnetic-field', 'advanced', 'Бірнеше өткізгіш тудыратын магнит өрістерінің өзара әсерін талдау'],

            // 11. Ампер күші
            ['ampere-force', 'basic', 'Магнит өрісіндегі тогы бар өткізгішке әсер ететін күшті табу'],
            ['ampere-force', 'intermediate', 'Ампер күшінің бағытын сол қол ережесі арқылы анықтау'],
            ['ampere-force', 'advanced', 'Магнит өрісіндегі өткізгіштің тепе-теңдік жағдайын есептеу'],

            // 12. Лоренц күші
            ['lorentz-force', 'basic', 'Магнит өрісінде қозғалған зарядқа әсер ететін Лоренц күшін табу'],
            ['lorentz-force', 'intermediate', 'Лоренц күшінің бағытын анықтау'],
            ['lorentz-force', 'advanced', 'Зарядталған бөлшектің магнит өрісіндегі шеңбер бойымен қозғалысын есептеу'],

            // 13. Электромагниттік индукция
            ['electromagnetic-induction', 'basic', 'Магнит ағыны өзгергенде индукциялық токтың пайда болуын түсіндіру'],
            ['electromagnetic-induction', 'intermediate', 'Индукция ЭҚК-ін магнит ағынының өзгерісі арқылы есептеу'],
            ['electromagnetic-induction', 'advanced', 'Катушкадағы индукциялық токтың шамасы мен бағытын анықтау'],

            // 14. Ленц ережесі
            ['lenz-law', 'basic', 'Ленц ережесі бойынша индукциялық токтың бағытын анықтау'],
            ['lenz-law', 'intermediate', 'Магнит катушкаға жақындағанда пайда болатын ток бағытын түсіндіру'],
            ['lenz-law', 'advanced', 'Ленц ережесін энергияның сақталу заңымен байланыстырып талдау'],

            // 15. Электр генераторы
            ['electric-generator', 'basic', 'Электр генераторының жұмыс істеу принципін түсіндіру'],
            ['electric-generator', 'intermediate', 'Генераторда индукция ЭҚК-інің пайда болуын сипаттау'],
            ['electric-generator', 'advanced', 'Айнымалы ток генераторындағы ЭҚК-тің уақыт бойынша өзгерісін талдау'],
        ];

        $pointsMap = ['basic' => 10, 'intermediate' => 15, 'advanced' => 20];
        $taskExplanation = 'Шартты мұқият оқып, формула(лар)ды дұрыс таңдаңыз. Шамаларды SI жүйесіне келтіріп, есептеуді ретімен көрсетіңіз.';
        $detailedTaskContent = [
            'T-01' => [
                'statement' => 'Вакуумде бір-бірінен 0,3 м қашықтықта орналасқан екі нүктелік заряд берілген. Бірінші заряд q1 = 2 мкКл, екінші заряд q2 = 4 мкКл. Осы екі зарядтың бір-біріне әсер ететін электр күшін табыңдар.',
                'given' => [
                    'q1 = 2 мкКл = 2 · 10^-6 Кл',
                    'q2 = 4 мкКл = 4 · 10^-6 Кл',
                    'r = 0,3 м',
                    'k = 9 · 10^9 Н·м^2/Кл^2',
                ],
                'given_latex' => [
                    'q_1 = 2\\,\\mu\\text{Кл} = 2\\cdot 10^{-6}\\,\\text{Кл}',
                    'q_2 = 4\\,\\mu\\text{Кл} = 4\\cdot 10^{-6}\\,\\text{Кл}',
                    'r = 0{,}3\\,\\text{м}',
                    'k = 9\\cdot 10^{9}\\,\\text{Н}\\cdot\\text{м}^{2}/\\text{Кл}^{2}',
                ],
                'formula' => 'F = k * |q1*q2| / r^2',
                'formula_latex' => 'F = k \\frac{|q_1 q_2|}{r^2}',
                'expected_answer' => ['type' => 'numeric', 'value' => 0.8, 'tolerance' => 0.001],
                'answer_display' => 'F = 0,8 Н',
                'solution_steps' => [
                    'Зарядтарды формулаға қоямыз: F = 9 · 10^9 · ((2 · 10^-6 · 4 · 10^-6) / 0,3^2).',
                    'Зарядтарды көбейтеміз: 2 · 10^-6 · 4 · 10^-6 = 8 · 10^-12.',
                    'Қашықтықтың квадратын табамыз: 0,3^2 = 0,09.',
                    'Есептейміз: 9 · 10^9 · 8 · 10^-12 = 0,072.',
                    'Соңында F = 0,072 / 0,09 = 0,8 Н.',
                ],
            ],
            'T-02' => [
                'statement' => 'Екі заряд бір-бірінен 0,2 м қашықтықта орналасқанда, олардың арасындағы электрлік әсерлесу күші 12 Н болды. Егер зарядтардың арақашықтығы 2 есе артса, Кулон күші қалай өзгереді және жаңа күш нешеге тең болады?',
                'given' => [
                    'F1 = 12 Н',
                    'r2 = 2r1',
                ],
                'given_latex' => [
                    'F_1 = 12\\,\\text{Н}',
                    'r_2 = 2r_1',
                ],
                'formula' => 'F2 = F1 / 2^2',
                'formula_latex' => 'F_2 = \\frac{F_1}{2^2}',
                'expected_answer' => ['type' => 'numeric', 'value' => 3.0, 'tolerance' => 0.001],
                'answer_display' => 'F2 = 3 Н',
                'solution_steps' => [
                    'Кулон күші қашықтықтың квадратына кері пропорционал: F ~ 1/r^2.',
                    'Арақашықтық 2 есе артса, күш 2^2 = 4 есе азаяды.',
                    'Сонда F2 = 12 / 4 = 3 Н.',
                    'Демек, жаңа күш 3 Н болады және ол 4 есе кемиді.',
                ],
            ],
            'T-03' => [
                'statement' => 'Бір түзудің бойында үш заряд орналасқан: q1 = +4 мкКл, q2 = +2 мкКл, q3 = +3 мкКл. q1 мен q2 арасындағы қашықтық 0,3 м, ал q2 мен q3 арасындағы қашықтық 0,4 м. q2 зарядына әсер ететін қорытқы күшті табыңдар.',
                'given' => [
                    'q1 = +4 мкКл = 4 · 10^-6 Кл',
                    'q2 = +2 мкКл = 2 · 10^-6 Кл',
                    'q3 = +3 мкКл = 3 · 10^-6 Кл',
                    'r12 = 0,3 м',
                    'r23 = 0,4 м',
                    'k = 9 · 10^9 Н·м^2/Кл^2',
                ],
                'given_latex' => [
                    'q_1 = +4\\,\\mu\\text{Кл} = 4\\cdot 10^{-6}\\,\\text{Кл}',
                    'q_2 = +2\\,\\mu\\text{Кл} = 2\\cdot 10^{-6}\\,\\text{Кл}',
                    'q_3 = +3\\,\\mu\\text{Кл} = 3\\cdot 10^{-6}\\,\\text{Кл}',
                    'r_{12} = 0{,}3\\,\\text{м}',
                    'r_{23} = 0{,}4\\,\\text{м}',
                    'k = 9\\cdot 10^{9}\\,\\text{Н}\\cdot\\text{м}^{2}/\\text{Кл}^{2}',
                ],
                'formula' => 'F_net = F12 - F32',
                'formula_latex' => 'F_{\\text{қорытқы}} = F_{12} - F_{32}',
                'expected_answer' => ['type' => 'numeric', 'value' => 0.4625, 'tolerance' => 0.001],
                'answer_display' => 'Fқорытқы = 0,4625 Н, бағыты оңға қарай',
                'solution_steps' => [
                    'Алдымен q1 зарядынан q2-ге әсер ететін күшті табамыз: F12 = 9 · 10^9 · ((4 · 10^-6 · 2 · 10^-6) / 0,3^2) = 0,8 Н.',
                    'Бұл күш q2 зарядын оңға қарай итереді, себебі q1 мен q2 екеуі де оң зарядталған.',
                    'Енді q3 зарядынан q2-ге әсер ететін күшті табамыз: F32 = 9 · 10^9 · ((3 · 10^-6 · 2 · 10^-6) / 0,4^2) = 0,3375 Н.',
                    'Бұл күш q2 зарядын солға қарай итереді.',
                    'Күштер қарама-қарсы бағытталғандықтан, қорытқы күш F_net = 0,8 - 0,3375 = 0,4625 Н.',
                    'Үлкен күш оңға бағытталғандықтан, қорытқы күш те оңға қарай бағытталады.',
                ],
            ],
            'T-04' => [
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
            'T-05' => [
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
            'T-06' => [
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
        ];

        foreach ($taskSpecs as $index => [$topicSlug, $difficulty, $title]) {
            $code = 'T-' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
            $content = $detailedTaskContent[$code] ?? ['status' => 'idle'];

            $existingTask = DB::table('tasks')->where('code', $code)->first();
            $taskId = $existingTask?->id ?: (string) Str::uuid();

            $taskRow = [
                'task_type' => 'numeric',
                'code' => $code,
                'title_kz' => $title,
                'instruction' => $title,
                'explanation' => $taskExplanation,
                'difficulty' => $difficulty,
                'grade_level' => null,
                'estimated_minutes' => 8,
                'points' => $pointsMap[$difficulty] ?? 10,
                'is_published' => true,
                'content_json' => json_encode($content, JSON_UNESCAPED_UNICODE),
                'metadata' => json_encode(['topic_slug' => $topicSlug], JSON_UNESCAPED_UNICODE),
                'updated_by' => $teacherId,
                'published_at' => $now,
                'updated_at' => $now,
            ];

            if ($existingTask) {
                DB::table('tasks')->where('id', $taskId)->update($taskRow);
            } else {
                DB::table('tasks')->insert([
                    'id' => $taskId,
                    ...$taskRow,
                    'created_by' => $teacherId,
                    'created_at' => $now,
                ]);
            }

            DB::table('task_topic_links')->where('task_id', $taskId)->delete();
            DB::table('task_topic_links')->insert([
                'id' => (string) Str::uuid(),
                'task_id' => $taskId,
                'topic_id' => $topicIds[$topicSlug],
                'relation_type' => 'primary',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $labs = [
            ['coulombs-law-lab', 'electrostatics', 'Кулон заңы виртуалды зертханасы', 'coulombs_law'],
            ['electric-field-sandbox', 'electrostatics', 'Электр өрісі sandbox', 'electric_field'],
            ['ohms-law-lab', 'circuits', 'Ом заңы зертханасы', 'ohms_law'],
            ['series-parallel-lab', 'circuits', 'Тізбектей және параллель тізбек', 'series_parallel'],
            ['capacitance-lab', 'electrostatics', 'Конденсатор сыйымдылығы зертханасы', 'capacitance'],
        ];

        foreach ($labs as [$slug, $topic, $title, $type]) {
            DB::table('labs')->insert([
                'id' => (string) Str::uuid(),
                'topic_id' => $topicIds[$topic],
                'slug' => $slug,
                'title_kz' => $title,
                'description' => "{$title}: параметрлерді өзгертіп, физикалық байланысты бақылаңыз.",
                'difficulty' => 'intermediate',
                'estimated_minutes' => 12,
                'simulation_type' => $type,
                'config' => json_encode(['mode' => 'interactive']),
                'is_published' => true,
                'version' => 1,
                'created_by' => $teacherId,
                'updated_by' => $teacherId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
