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

        $roles = [
            'student' => (string) Str::uuid(),
            'teacher' => (string) Str::uuid(),
            'admin' => (string) Str::uuid(),
        ];

        foreach ($roles as $key => $id) {
            DB::table('roles')->insert([
                'id' => $id,
                'role_key' => $key,
                'name' => ucfirst($key),
                'description' => "Platform {$key} role",
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $adminId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $adminId,
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
            'settings' => json_encode(['theme' => 'lab']),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('user_roles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $adminId,
            'role_id' => $roles['admin'],
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $teacherId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $teacherId,
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
            'settings' => json_encode(['theme' => 'lab']),
            'created_by' => $adminId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('user_roles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $teacherId,
            'role_id' => $roles['teacher'],
            'assigned_by' => $adminId,
            'created_at' => $now,
            'updated_at' => $now,
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
                'grade_level' => 10,
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

        $tasks = [
            ['T-01', 'coulomb-law', 'Кулон заңы бойынша күшті есептеу', 'Екі нүктелік заряд арасындағы электростатикалық күшті анықтаңыз.', 'basic', 10],
            ['T-02', 'electric-field', 'Электр өрісінің кернеулігін есептеу', 'Берілген зарядтан белгілі қашықтықтағы электр өрісінің кернеулігін табыңыз.', 'basic', 10],
            ['T-03', 'capacitors', 'Конденсатор сыйымдылығын анықтау', 'Жазық конденсатордың сыйымдылығын есептеңіз.', 'intermediate', 15],
            ['T-04', 'ohms-law', 'Тізбек бөлігіндегі кернеу құлауы', 'Ом заңын қолданып ток пен кернеуді табыңыз.', 'basic', 10],
            ['T-05', 'ohms-law', 'Параллель жалғанған резисторлар', 'Параллель тармақтардағы жалпы кедергіні және токты есептеңіз.', 'intermediate', 15],
            ['T-06', 'electric-power', 'Электр тогының жұмысы мен қуаты', 'Берілген уақыт ішіндегі жұмыс пен қуатты есептеңіз.', 'intermediate', 15],
            ['T-07', 'ampere-force', 'Магнит өрісіндегі ток өткізгіш', 'Ампер күшінің шамасын анықтаңыз.', 'intermediate', 20],
            ['T-08', 'lorentz-force', 'Лоренц күші және заряд қозғалысы', 'Магнит өрісіндегі зарядқа әсер ететін күшті табыңыз.', 'advanced', 25],
            ['T-09', 'electromagnetic-induction', 'Индукция ЭҚК есептеу', 'Магнит ағыны өзгергенде пайда болатын ЭҚК-ні есептеңіз.', 'advanced', 25],
        ];

        foreach ($tasks as [$code, $theorySlug, $title, $instruction, $difficulty, $points]) {
            $topicId = DB::table('theories')->where('slug', $theorySlug)->value('topic_id');
            $taskId = (string) Str::uuid();

            DB::table('tasks')->insert([
                'id' => $taskId,
                'task_type' => 'numeric',
                'code' => $code,
                'title_kz' => $title,
                'instruction' => $instruction,
                'explanation' => 'Формуланы таңдап, шамаларды SI жүйесіне келтіріңіз, содан кейін есептеңіз.',
                'difficulty' => $difficulty,
                'grade_level' => 10,
                'estimated_minutes' => 6,
                'points' => $points,
                'is_published' => true,
                'content_json' => json_encode(['status' => 'idle']),
                'metadata' => json_encode(['theory_slug' => $theorySlug]),
                'created_by' => $teacherId,
                'updated_by' => $teacherId,
                'published_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('task_topic_links')->insert([
                'id' => (string) Str::uuid(),
                'task_id' => $taskId,
                'topic_id' => $topicId,
                'relation_type' => 'primary',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('theory_task_links')->insert([
                'id' => (string) Str::uuid(),
                'theory_id' => $theoryIds[$theorySlug],
                'task_id' => $taskId,
                'relation_type' => 'practice',
                'sort_order' => 1,
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
