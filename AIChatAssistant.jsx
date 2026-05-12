import { useEffect, useRef, useState } from "react";
import { Atom, Bot, RotateCcw, Send, Sparkles, User, Zap } from "lucide-react";

const KB = [
  {
    keys: ["ом", "ohm", "кернеу", "ток", "кедергі", "резистор"],
    answer: `**Ом заңы** — электр тізбегінің іргелі заңы.

**Формула:** I = V / R

- **I** — ток күші (Ампер, А)
- **V** — кернеу (Вольт, В)
- **R** — кедергі (Ом, Ω)

**Мысал:** Егер V = 12 В, R = 4 Ом болса:
I = 12 / 4 = **3 А**

**Маңызды:** Ток кернеуге тура, кедергіге кері пропорционал. Кедергі артса — ток азаяды.`,
  },
  {
    keys: ["кулон", "coulomb", "заряд", "электростатик", "тебілу", "тартылу"],
    answer: `**Кулон заңы** — электростатиканың негізгі заңы.

**Формула:** F = k · |q₁ · q₂| / r²

- **F** — өзара әрекет күші (Ньютон, Н)
- **k** = 8.99 × 10⁹ Н·м²/Кл² — Кулон тұрақтысы
- **q₁, q₂** — зарядтар мөлшері (Кулон, Кл)
- **r** — арадағы қашықтық (метр, м)

**Ережелер:**
- Бірдей таңбалы зарядтар → **тебіседі** ↔
- Әр түрлі таңбалы зарядтар → **тартылады** ↕

Қашықтықты 2 есе арттырсаңыз, күш **4 есе** азаяды!`,
  },
  {
    keys: ["магнит", "магнетизм", "ампер", "лоренц", "индукция"],
    answer: `**Магнетизм** — физиканың маңызды бөлімі.

**Ампер күші:** F = B · I · L · sin(α)
- **B** — магнит өрісінің индукциясы (Тесла, Тл)
- **I** — ток күші (А)
- **L** — өткізгіш ұзындығы (м)

**Лоренц күші:** F = q · v · B · sin(α)
- **q** — заряд мөлшері (Кл)
- **v** — бөлшек жылдамдығы (м/с)

**Ленц ережесі:** Индукцияланған ток оны тудырған өзгеріске қарсы бағытталады.`,
  },
  {
    keys: ["электр өрісі", "кернеулік", "потенциал"],
    answer: `**Электр өрісі** — зарядтардың өзара әрекет ортасы.

**Кернеулік:** E = F / q = k · Q / r²
(В/м немесе Н/Кл)

**Потенциал:** φ = k · Q / r
(Вольт, В)

**Байланыс:** E = -dφ/dr
(Өріс кернеулігі потенциалдың кеңістіктік туындысы)

**Суперпозиция принципі:** Бірнеше зарядтың жалпы өрісі жеке өрістердің векторлық қосындысы.`,
  },
  {
    keys: ["конденсатор", "сыйымдылық"],
    answer: `**Конденсатор** — электр зарядын жинақтайтын құрылғы.

**Сыйымдылық:** C = Q / U = ε₀ · ε · S / d

- **C** — сыйымдылық (Фарад, Ф)
- **Q** — заряд (Кл)
- **U** — кернеу (В)
- **S** — пластина ауданы (м²)
- **d** — пластиналар арасындағы қашықтық (м)

**Энергия:** W = C·U² / 2

**Тізбектей жалғанғанда:** 1/C = 1/C₁ + 1/C₂ + ...
**Параллель жалғанғанда:** C = C₁ + C₂ + ...`,
  },
  {
    keys: ["қуат", "жұмыс", "энергия", "ватт"],
    answer: `**Электр қуаты мен жұмысы**

**Қуат:** P = U · I = I² · R = U² / R
- Бірлігі: Ватт (Вт)

**Жұмыс:** A = P · t = U · I · t
- Бірлігі: Джоуль (Дж) немесе кВт·сағ

**Мысал:** 100 Вт шам 10 сағат жұмыс жасаса:
A = 100 × 10 × 3600 = **3 600 000 Дж = 1 кВт·сағ**

**Джоуль–Ленц заңы:** Q = I² · R · t
(өткізгіштегі жылу бөлінуі)`,
  },
  {
    keys: ["генератор", "электромагниттік", "фарадей"],
    answer: `**Электромагниттік индукция** — Фарадей заңы

**ЭМИ ЭҚК:** ε = -dΦ/dt = -N · dΦ/dt

- **Φ** — магнит ағыны (Вебер, Вб)
- **N** — орам саны
- **ε** — ЭҚК (Вольт, В)

**Магнит ағыны:** Φ = B · S · cos(α)

**Генератор принципі:** Тұйық контурдың магнит өрісінде айналуы айнымалы ток тудырады.

ε = N · B · S · ω · sin(ωt)
мұндағы ω — айналу бұрыштық жылдамдығы.`,
  },
  {
    keys: ["толық тізбек", "эқк", "ішкі кедергі"],
    answer: `**Толық тізбек үшін Ом заңы**

**Формула:** I = ε / (R + r)

- **ε** — ЭҚК (электр қозғаушы күш), В
- **R** — сыртқы кедергі, Ом
- **r** — ішкі кедергі, Ом
- **I** — ток күші, А

**Клемма кернеуі:** U = ε - I·r

**Қысқа тұйықталу тогы:** I_кт = ε / r
(R = 0 болғандағы максимал ток — өте қауіпті!)

Ішкі кедергі артқан сайын (ескі батарея) клемма кернеуі азаяды.`,
  },
];

const SUGGESTIONS = [
  "Ом заңын түсіндір",
  "Кулон заңы дегеніміз не?",
  "Конденсатор қалай жұмыс істейді?",
  "Электромагниттік индукция",
  "Электр қуатын есептеу",
  "Толық тізбек үшін Ом заңы",
];

function findAnswer(text) {
  const lower = text.toLowerCase();
  for (const item of KB) {
    if (item.keys.some((key) => lower.includes(key))) return item.answer;
  }
  return null;
}

function MessageText({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-[13.5px] leading-7 text-slate-700">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-2" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={index}>
            {parts.map((part, partIndex) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={partIndex} className="font-bold text-violet-700">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={partIndex}>{part}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-2 w-2 rounded-full bg-violet-300"
          style={{ animation: `pulse 1.2s ease-in-out ${dot * 0.15}s infinite` }}
        />
      ))}
    </div>
  );
}

export default function AIChatAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "assistant",
      text: `Сәлем! Мен **AI Physics көмекшісімін** 🤖⚡

Электр және магнетизм бойынша кез-келген сұрағыңызды қоюға болады. Мен сізге:
- Формулалар мен заңдарды түсіндіремін
- Есептер шығаруға көмектесемін
- Тәжірибелерді талдаймын

Қандай тақырыпты зерттегіңіз келеді?`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = (text) => {
    const userText = (text || input).trim();
    if (!userText || thinking) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", text: userText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    const delay = 800 + Math.random() * 900;
    setTimeout(() => {
      const answer = findAnswer(userText);
      const aiText =
        answer ||
        `Кешіріңіз, **"${userText}"** тақырыбы бойынша нақты ақпарат таба алмадым.

Мына тақырыптар бойынша жақсы жауап бере аламын:
- Ом заңы (I = V/R)
- Кулон заңы (F = k·q₁q₂/r²)
- Конденсаторлар мен сыйымдылық
- Магнетизм және Лоренц күші
- Электромагниттік индукция
- Электр қуаты мен жұмысы

Сол тақырыптардың бірін сұраңызшы! 😊`;

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: aiText, time: new Date() },
      ]);
      setThinking(false);
    }, delay);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 0,
        role: "assistant",
        text: "Чат тазаланды. Жаңа сұрақ қойыңыз! ⚡",
        time: new Date(),
      },
    ]);
  };

  const formatTime = (date) => date.toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0918] text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; font-family: 'Exo 2', sans-serif; }
        @keyframes pulse {
          0%, 100% { transform: translateY(0); opacity: .55; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-fade { animation: fadeUp .35s ease both; }
      `}</style>

      <header className="border-b border-violet-500/12 bg-[linear-gradient(180deg,#18152c_0%,#11101f_100%)]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-[0_0_24px_rgba(124,58,237,0.35)]">
              <Bot size={21} className="text-white" />
              <span className="absolute bottom-1.5 left-1.5 h-3 w-3 rounded-full border-2 border-[#18152c] bg-emerald-400" />
            </div>
            <div>
              <h1 className="text-[1.7rem] font-black tracking-[-0.02em] text-white">AI Физика Көмекшісі</h1>
              <p className="mt-1 text-[13px] font-semibold text-emerald-400">● Желіде · Жауапқа дайын</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 md:flex">
              <Atom size={15} />
              Электр & Магнетизм
            </div>
            <button
              onClick={clearChat}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-violet-400/20 hover:bg-violet-500/8 hover:text-slate-200"
            >
              <RotateCcw size={15} />
              Тазалау
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-[#f8f7ff]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-8">
        <div className="flex-1 overflow-y-auto py-7">
          <div className="mx-auto flex w-full max-w-7xl gap-4">
            <div className="hidden shrink-0 lg:block">
              <div className="sticky top-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-600 shadow-[0_10px_24px_rgba(76,29,149,0.12)]">
                <Bot size={18} />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-fade flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(124,58,237,0.35)]">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[820px] rounded-[24px] border px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.24)] ${
                      msg.role === "assistant"
                        ? "border-violet-200 bg-white"
                        : "border-indigo-200 bg-indigo-50/80"
                    }`}
                  >
                    <MessageText text={msg.text} />
                    <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-slate-400">
                      <span className="font-mono">{formatTime(msg.time)}</span>
                      {msg.role === "assistant" && (
                        <span className="inline-flex items-center gap-1 text-violet-400">
                          <Sparkles size={10} />
                          AI
                        </span>
                      )}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-white text-slate-500">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {thinking && (
                <div className="message-fade flex gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(124,58,237,0.35)]">
                    <Bot size={18} />
                  </div>
                    <div className="rounded-[24px] border border-violet-200 bg-white px-5 py-4 shadow-[0_18px_36px_rgba(76,29,149,0.12)]">
                    <div className="flex items-center gap-3">
                      <ThinkingDots />
                      <span className="text-sm text-slate-500">Жауап дайындалуда...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {messages.length <= 1 && (
          <section className="border-t border-violet-100 py-5">
            <div className="mx-auto max-w-7xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">Жылдам сұрақтар</p>
              <div className="flex flex-wrap gap-2.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                  >
                    <Zap size={13} />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <footer className="border-t border-violet-100 py-3">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[24px] border border-violet-200 bg-white p-3 shadow-[0_16px_40px_rgba(76,29,149,0.08)]">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Физика сұрағыңызды жазыңыз... (Enter — жіберу)"
                  rows={1}
                  className="max-h-24 min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || thinking}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                    input.trim() && !thinking
                      ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(124,58,237,0.35)] hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">Shift+Enter — жол ауыстыру · Enter — жіберу</p>
          </div>
        </footer>
      </div>
      </main>
    </div>
  );
}
