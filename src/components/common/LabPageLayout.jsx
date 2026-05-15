import { ArrowLeft, BookOpen, Clock3, FlaskConical, Lightbulb, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import FormulaView from "../formula/FormulaView";

export function Panel({ title, icon: Icon, children, accent = "#7c3aed", className = "" }) {
  return (
    <section className={`app-panel rounded-[28px] border border-violet-200 bg-white shadow-[0_14px_32px_rgba(76,29,149,0.07)] ${className}`}>
      <div className="app-panel-header flex items-center gap-3 border-b border-violet-100 px-5 py-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: `${accent}15`, color: accent }}
        >
          {Icon ? <Icon size={14} /> : <BookOpen size={14} />}
        </div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="app-panel-content p-5">{children}</div>
    </section>
  );
}

export function RangeControl({ label, valueLabel, min, max, step = 1, value, onChange }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-violet-100 accent-violet-600"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </label>
  );
}

export function StatPill({ label, value, accent = "#7c3aed" }) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-0.5 text-base font-black md:text-lg" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

export function HintList({ items, accent = "#7c3aed" }) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <span
            className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: accent }}
          />
          <p className="text-sm leading-6 text-slate-600 max-[480px]:text-[13px] max-[480px]:leading-5">{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function LabPageLayout({
  topic,
  title,
  subtitle,
  formula,
  formulaContent,
  theoryId,
  difficulty,
  duration,
  accent = "#7c3aed",
  children,
  sidebar,
  includeDefaultHint = true,
  headerAction = null,
}) {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <div className="border-b border-violet-200 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.18),_transparent_56%),linear-gradient(180deg,#faf7ff_0%,#f1eeff_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-6 max-[480px]:px-4 max-[480px]:py-5 lg:px-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/labs"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white/75 px-3.5 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 max-[480px]:text-[13px]"
            >
              <ArrowLeft size={15} />
              Зертханалар тізіміне оралу
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700">
              <FlaskConical size={14} />
              {topic}
            </span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {difficulty}
            </span>
            {duration ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                <Clock3 size={12} />
                {duration}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-[2rem] font-black leading-[0.92] tracking-[-0.03em] text-slate-950 max-[480px]:text-[2.1rem] md:text-[3.1rem]">{title}</h1>
              <p className="mt-2.5 max-w-2xl text-[13px] leading-6 text-slate-600 max-[480px]:text-[12.5px] max-[480px]:leading-5 md:text-[15px]">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 max-[480px]:w-full">
              {headerAction ?? (theoryId ? (
                <Link
                  to={`/theory/${theoryId}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-violet-300 bg-white/88 px-4 py-2.5 text-sm font-bold text-violet-700 shadow-[0_10px_22px_rgba(124,58,237,0.08)] transition hover:border-violet-400 hover:bg-violet-50 max-[480px]:flex-1 max-[480px]:justify-center"
                >
                  <BookOpen size={16} />
                  Теория
                </Link>
              ) : null)}

              <div className="rounded-2xl bg-transparent p-0 max-[480px]:flex-1">
              <div
                className="rounded-2xl border px-4 py-2 text-base font-black tracking-[0.03em] max-[480px]:w-full max-[480px]:px-3.5 max-[480px]:py-2"
                style={{ color: accent, borderColor: `${accent}55`, background: `${accent}10` }}
              >
                {formulaContent ?? <FormulaView formula={formula} className="text-[1rem] md:text-[1.1rem]" accent={accent} />}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 max-[480px]:px-4 max-[480px]:py-5 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_340px]">
          <div className="space-y-4">{children}</div>
          <div className="space-y-4">
            {includeDefaultHint ? (
              <Panel title="Түсіну үшін" icon={Lightbulb} accent={accent} className="[&>div:first-child]:px-4 [&>div:first-child]:py-3 [&>div:last-child]:p-3">
                <p className="text-[13px] leading-6 text-slate-600">
                  Параметрлерді өзгертіп көріңіз. Қашықтықты, зарядты немесе басқа мәндерді өзгерткенде,
                  күштің қалай өзгеретінін бірден көресіз.
                </p>
              </Panel>
            ) : null}
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ControlPanel({ children, accent = "#7c3aed", className = "" }) {
  return (
    <Panel title="Басқару панелі" icon={SlidersHorizontal} accent={accent} className={className}>
      <div className="space-y-4 max-[480px]:space-y-3.5">{children}</div>
    </Panel>
  );
}
