import { ArrowRight, BookOpen, ClipboardList, Orbit, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import { getTheoryById, THEORY_COMPLEXITY_META, THEORY_TOPIC_STYLES } from "./theoryData";

export default function TheoryDetailPage() {
  const { theoryId } = useParams();
  const theory = getTheoryById(theoryId);

  if (!theory) {
    return <Navigate to="/theory" replace />;
  }

  const complexity = THEORY_COMPLEXITY_META[theory.complexity];
  const topicStyle = THEORY_TOPIC_STYLES[theory.topic] || THEORY_TOPIC_STYLES["Тізбектер"];

  return (
    <div className="min-h-screen bg-[#0a0918] text-slate-100">
      <div className="border-b border-violet-500/15 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_55%),linear-gradient(180deg,#100f24_0%,#0a0918_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Теория", to: "/theory" },
              { label: theory.title },
            ]}
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                <Orbit size={14} />
                Теория модулі
              </div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-white md:text-5xl">
                {theory.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                {theory.description}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-400/15 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Формула
              </div>
              <div className="font-mono text-2xl font-bold text-violet-200">{theory.formula}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-6">
          {theory.content.map((section, index) => (
            <section
              key={section.heading}
              className="rounded-3xl border border-violet-500/15 bg-[linear-gradient(180deg,rgba(20,18,40,0.98),rgba(12,10,26,0.98))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-sm font-bold text-violet-200">
                  {index + 1}
                </div>
                <h2 className="text-lg font-bold text-white">{section.heading}</h2>
              </div>
              <p className="text-sm leading-7 text-slate-300">{section.text}</p>
            </section>
          ))}

          <section className="rounded-3xl border border-violet-400/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(14,165,233,0.08))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-white">Теорияны меңгердіңіз бе? Енді біліміңізді тексеріңіз!</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Осы бөліммен байланысты есептерді орындап, формулаларды тәжірибелік жағдайда қолданып көріңіз.
                </p>
                <Link
                  to={`/theory/${theory.id}/tasks`}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_30px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(99,102,241,0.42)]"
                >
                  Тапсырмаларды орындау
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-violet-500/15 bg-[linear-gradient(180deg,rgba(20,18,40,0.98),rgba(12,10,26,0.98))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Модуль ақпараты</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <span className="text-slate-400">Тақырып</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${topicStyle.bg} ${topicStyle.text}`}>
                  {theory.topic}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <span className="text-slate-400">Күрделілік</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complexity.bg} ${complexity.text}`}>
                  {theory.complexity}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <span className="text-slate-400">Бөлім саны</span>
                <span className="font-semibold text-violet-200">{theory.sections}</span>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Прогресс</span>
                  <span className="font-semibold text-violet-200">{theory.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-950/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500"
                    style={{ width: `${theory.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-violet-500/15 bg-[linear-gradient(180deg,rgba(20,18,40,0.98),rgba(12,10,26,0.98))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <ClipboardList size={14} />
              Келесі қадам
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Бұл теорияны бекіту үшін тақырыпқа байланысты тапсырмаларға өтіңіз немесе тізімге қайта оралыңыз.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                to={`/theory/${theory.id}/tasks`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300/35 hover:bg-violet-500/15"
              >
                <ClipboardList size={16} />
                Тапсырмаларға өту
              </Link>
              <Link
                to="/theory"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/15 hover:bg-white/8"
              >
                <BookOpen size={16} />
                Теория тізіміне оралу
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
