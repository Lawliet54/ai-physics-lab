import { ArrowLeft, BookOpen, Clock3, FlaskConical, Lightbulb, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

export function Panel({ title, icon: Icon, children, accent = "#7c3aed", className = "" }) {
  return (
    <section className={`rounded-[28px] border border-violet-200 bg-white shadow-[0_18px_42px_rgba(76,29,149,0.08)] ${className}`}>
      <div className="flex items-center gap-3 border-b border-violet-100 px-5 py-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-2xl"
          style={{ background: `${accent}15`, color: accent }}
        >
          {Icon ? <Icon size={14} /> : <BookOpen size={14} />}
        </div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
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
      <div className="mt-0.5 text-lg font-black" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

export function HintList({ items, accent = "#7c3aed" }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <span
            className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: accent }}
          />
          <p className="text-sm leading-6 text-slate-600">{item}</p>
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
      <div className="border-b border-violet-500/12 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.14),_transparent_56%),linear-gradient(180deg,#17142b_0%,#11101f_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/labs"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/18 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:border-violet-300/28 hover:bg-violet-500/15"
            >
              <ArrowLeft size={15} />
              Зертханалар тізіміне оралу
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/16 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-violet-200">
              <FlaskConical size={14} />
              {topic}
            </span>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300">
              {difficulty}
            </span>
            {duration ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300">
                <Clock3 size={12} />
                {duration}
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-[2rem] font-black leading-[0.92] tracking-[-0.03em] text-white md:text-[3.4rem]">{title}</h1>
              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-400 md:text-[15px]">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
              {headerAction}

              <div className="rounded-2xl bg-transparent">
              <div
                className="rounded-2xl border px-4 py-2.5 text-base font-black tracking-[0.03em]"
                style={{ color: accent, borderColor: `${accent}44`, background: `${accent}14` }}
              >
                {formulaContent ?? formula}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div className="space-y-6">{children}</div>
          <div className="space-y-6">
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
      <div className="space-y-5">{children}</div>
    </Panel>
  );
}
