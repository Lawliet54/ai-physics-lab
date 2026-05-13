import { ArrowRight, BookOpen, ClipboardList, Orbit, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import FormulaView from "./FormulaView";
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
    <div className="min-h-screen bg-[#f4f1ff] text-slate-900">
      <div className="border-b border-violet-200 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.2),_transparent_55%),linear-gradient(180deg,#faf7ff_0%,#f1eeff_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-8 max-[480px]:px-4 max-[480px]:py-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Теория", to: "/theory" },
              { label: theory.title },
            ]}
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/45 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                <Orbit size={14} />
                Теория модулі
              </div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-slate-950 md:text-5xl">
                {theory.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
                {theory.description}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-white/75 p-4 shadow-[0_16px_36px_rgba(76,29,149,0.08)] backdrop-blur max-[480px]:w-full">
              <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Формула
              </div>
              <FormulaView formula={theory.formula} className="text-2xl md:text-[2rem]" accent="#0f172a" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-6 py-7 max-[480px]:px-4 max-[480px]:py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-4">
          {theory.content.map((section, index) => (
            <section
              key={section.heading}
              className="rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,#ffffff,#f7f4ff)] p-5 shadow-[0_14px_30px_rgba(76,29,149,0.07)] max-[480px]:rounded-2xl max-[480px]:p-4"
            >
              <div className="mb-2.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/45 bg-violet-100 text-sm font-bold text-violet-700">
                  {index + 1}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
              </div>
              <p className="text-sm leading-6 text-slate-700 max-[480px]:text-[13px] max-[480px]:leading-5">{section.text}</p>
            </section>
          ))}

          <section className="rounded-3xl border border-violet-200 bg-[linear-gradient(135deg,rgba(167,139,250,0.18),rgba(191,219,254,0.28))] p-5 shadow-[0_16px_34px_rgba(76,29,149,0.07)] max-[480px]:rounded-2xl max-[480px]:p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900">Теорияны меңгердіңіз бе? Енді біліміңізді тексеріңіз!</p>
                <p className="mt-2 text-sm leading-6 text-slate-700 max-[480px]:text-[13px] max-[480px]:leading-5">
                  Осы бөліммен байланысты есептерді орындап, формулаларды тәжірибелік жағдайда қолданып көріңіз.
                </p>
                <Link
                  to={`/theory/${theory.id}/tasks`}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_26px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(99,102,241,0.36)]"
                >
                  Тапсырмаларды орындау
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,#ffffff,#f7f4ff)] p-5 shadow-[0_14px_30px_rgba(76,29,149,0.07)] max-[480px]:rounded-2xl max-[480px]:p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Модуль ақпараты</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                <span className="text-slate-700">Тақырып</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${topicStyle.bg} ${topicStyle.text}`}>
                  {theory.topic}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                <span className="text-slate-700">Күрделілік</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complexity.bg} ${complexity.text}`}>
                  {theory.complexity}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                <span className="text-slate-700">Бөлім саны</span>
                <span className="font-semibold text-slate-900">{theory.sections}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,#ffffff,#f7f4ff)] p-5 shadow-[0_14px_30px_rgba(76,29,149,0.07)] max-[480px]:rounded-2xl max-[480px]:p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <ClipboardList size={14} />
              Келесі қадам
            </div>
            <p className="text-sm leading-6 text-slate-700 max-[480px]:text-[13px] max-[480px]:leading-5">
              Бұл теорияны бекіту үшін тақырыпқа байланысты тапсырмаларға өтіңіз немесе тізімге қайта оралыңыз.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                to={`/theory/${theory.id}/tasks`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-300/45 bg-violet-100 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:border-violet-400 hover:bg-violet-200/70"
              >
                <ClipboardList size={16} />
                Тапсырмаларға өту
              </Link>
              <Link
                to="/theory"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-violet-300 hover:bg-violet-50"
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
