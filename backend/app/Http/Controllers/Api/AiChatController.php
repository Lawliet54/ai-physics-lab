<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function reply(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = mb_strtolower($data['message']);
        $answer = $this->matchKnowledgeBase($message);

        return response()->json([
            'data' => [
                'role' => 'assistant',
                'answer' => $answer,
                'source' => 'local-physics-kb',
            ],
        ]);
    }

    private function matchKnowledgeBase(string $message): string
    {
        $items = [
            ['keys' => ['ом', 'ohm', 'кернеу', 'ток', 'кедергі'], 'answer' => 'Ом заңы: I = U / R. Ток кернеуге тура, кедергіге кері пропорционал. Мысалы, U = 12 В және R = 4 Ом болса, I = 3 А.'],
            ['keys' => ['кулон', 'coulomb', 'заряд'], 'answer' => 'Кулон заңы: F = k|q₁q₂| / r². Бірдей таңбалы зарядтар тебіледі, әртүрлі таңбалы зарядтар тартылады. Қашықтық екі есе артса, күш төрт есе азаяды.'],
            ['keys' => ['өріс', 'кернеулік', 'потенциал'], 'answer' => 'Электр өрісі зарядтарға әсер ететін кеңістікті сипаттайды. Кернеулік E = F / q, ал нүктелік заряд үшін E = kQ / r².'],
            ['keys' => ['конденсатор', 'сыйымдылық'], 'answer' => 'Конденсатор заряд жинақтайды. Сыйымдылық C = Q / U, жазық конденсатор үшін C = εε₀S / d.'],
            ['keys' => ['магнит', 'ампер', 'лоренц', 'индукция'], 'answer' => 'Магнетизмде ток пен қозғалыстағы зарядтар өріс тудырады. Ампер күші F = BIl sin α, Лоренц күші F = qvB sin α.'],
        ];

        foreach ($items as $item) {
            foreach ($item['keys'] as $key) {
                if (str_contains($message, $key)) {
                    return $item['answer'];
                }
            }
        }

        return 'Бұл сұрақ бойынша әзірге қысқа жергілікті база жауап береді. Ом заңы, Кулон заңы, электр өрісі, конденсаторлар немесе магнетизм тақырыбын сұрап көріңіз.';
    }
}
