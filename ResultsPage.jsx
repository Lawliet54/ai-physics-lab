import { useState } from "react";
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, BarChart3, Calendar, CheckCircle2, ChevronDown, Clock, FlaskConical, TrendingUp } from "lucide-react";

const weeklyActivity = [
  { day: "Дс", experiments: 2, score: 85 },
  { day: "Сс", experiments: 1, score: 92 },
  { day: "Ср", experiments: 3, score: 78 },
  { day: "Бс", experiments: 0, score: 0 },
  { day: "Жм", experiments: 2, score: 88 },
  { day: "Сб", experiments: 4, score: 95 },
  { day: "Жк", experiments: 1, score: 80 },
];

const labResults = [
  { id: 1, name: "Ом заңын тәжірибелік зерттеу", date: "2025-01-10", score: 92, time: "22 мин", status: "completed" },
  { id: 2, name: "Кулон заңын модельдеу", date: "2025-01-11", score: 87, time: "28 мин", status: "completed" },
  { id: 3, name: "Электр өрісін визуализациялау", date: "2025-01-12", score: 95, time: "31 мин", status: "completed" },
  { id: 4, name: "Конденсатор сыйымдылығы", date: "2025-01-13", score: 74, time: "38 мин", status: "completed" },
  { id: 5, name: "Өткізгіштерді тізбектей жалғау", date: "2025-01-14", score: 88, time: "25 мин", status: "completed" },
  { id: 6, name: "Ток көзінің ЭҚК зерттеу", date: "2025-01-15", score: 0, time: "—", status: "in-progress" },
  { id: 7, name: "Магнит өрісін бақылау", date: "2025-01-15", score: 0, time: "—", status: "in-progress" },
  { id: 8, name: "Лоренц күшінің әрекеті", date: "—", score: 0, time: "—", status: "pending" },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-violet-200 bg-white p-5 shadow-[0_16px_38px_rgba(76,29,149,0.08)]">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl" style={{ background: `${color}22` }} />
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: `${color}33`, background: `${color}18` }}>
          <Icon size={18} color={color} />
        </div>
        <span className="rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: `${color}22`, background: `${color}14`, color }}>
          {sub}
        </span>
      </div>
      <p className="text-[13px] font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-[3rem] font-black tracking-[-0.03em] text-slate-950">{value}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-violet-200 bg-white/95 px-4 py-3 shadow-[0_16px_30px_rgba(76,29,149,0.12)] backdrop-blur">
      <p className="text-sm font-bold text-violet-700">{label}</p>
      <p className="mt-2 text-sm text-slate-700">Тәжірибе: <strong className="text-violet-700">{payload[0]?.value}</strong></p>
      {payload[1] && payload[1].value > 0 && (
        <p className="mt-1 text-sm text-slate-700">Орт. балл: <strong className="text-emerald-600">{payload[1]?.value}%</strong></p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: "Аяқталды", bg: "bg-emerald-500/12", color: "text-emerald-300", dot: "bg-emerald-400" },
    "in-progress": { label: "Орындалуда", bg: "bg-amber-500/12", color: "text-amber-300", dot: "bg-amber-400" },
    pending: { label: "Күтілуде", bg: "bg-slate-500/12", color: "text-slate-400", dot: "bg-slate-500" },
  };
  const item = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${item.bg} ${item.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function ScoreBar({ score }) {
  if (!score) return <span className="text-sm text-slate-600">—</span>;
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-violet-950/70">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="font-mono text-sm font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function ResultsPage() {
  const [chartType, setChartType] = useState("experiments");

  const completed = labResults.filter((item) => item.status === "completed").length;
  const totalTime = 22 + 28 + 31 + 38 + 25;
  const avgScore = Math.round(labResults.filter((item) => item.score > 0).reduce((sum, item) => sum + item.score, 0) / completed);
  const totalActivity = weeklyActivity.reduce((sum, item) => sum + item.experiments, 0);

  return (
    <div className="min-h-screen bg-[#0a0918] text-slate-100">
      <div className="border-b border-violet-500/12 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.14),_transparent_55%),linear-gradient(180deg,#17142b_0%,#11101f_100%)]">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 size={18} className="text-violet-300" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Нәтижелер</span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-white md:text-[3.2rem]">Менің прогресім</h1>
              <p className="mt-3 text-sm text-slate-500">Электр және магнетизм бойынша зертхана тәжірибелері · 2025 жыл</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400">
              <Calendar size={14} />
              Соңғы 7 күн
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f7ff]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-8 py-7">
        <section className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
          <StatCard icon={CheckCircle2} label="Аяқталған тәжірибелер" value={completed} sub={`/ ${labResults.length}`} color="#10b981" />
          <StatCard icon={Award} label="Орташа балл" value={`${avgScore}%`} sub="үздік" color="#a78bfa" />
          <StatCard icon={Clock} label="Жалпы уақыт" value={`${totalTime}м`} sub="осы апта" color="#f59e0b" />
          <StatCard icon={TrendingUp} label="Апталық белсенділік" value={totalActivity} sub="тәжірибе" color="#06b6d4" />
        </section>

        <section className="rounded-[26px] border border-violet-200 bg-white p-6 shadow-[0_20px_44px_rgba(76,29,149,0.08)]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-black tracking-[-0.02em] text-slate-950">Белсенділік Диаграммасы</h2>
              <p className="mt-1.5 text-sm text-slate-500">Соңғы 7 күндегі тәжірибе белсенділігі</p>
            </div>
            <div className="inline-flex rounded-2xl border border-violet-200 bg-violet-50 p-1">
              {[
                { key: "experiments", label: "Тәжірибелер", color: "#7c3aed" },
                { key: "score", label: "Балл", color: "#10b981" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setChartType(tab.key)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                    chartType === tab.key ? "text-violet-950" : "text-slate-500 hover:text-slate-700"
                  }`}
                  style={{
                    background: chartType === tab.key ? `${tab.color}26` : "transparent",
                    border: chartType === tab.key ? `1px solid ${tab.color}` : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ top: 10, right: 6, left: -18, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="4 6" stroke="#ddd6fe" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
                <Bar dataKey={chartType} radius={[8, 8, 0, 0]}>
                  {weeklyActivity.map((entry, index) => {
                    const value = entry[chartType];
                    const baseColor = chartType === "experiments" ? "#7c3aed" : "#10b981";
                    return <Cell key={index} fill={value === 0 ? "#ede9fe" : `${baseColor}${chartType === "experiments" ? "" : ""}`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-violet-500" /> Белсенді күн</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-violet-200" /> Белсенділік жоқ</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-cyan-500" /> Бүгін</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-[26px] border border-violet-200 bg-white shadow-[0_20px_44px_rgba(76,29,149,0.08)]">
          <div className="flex flex-col gap-4 border-b border-violet-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-black tracking-[-0.02em] text-slate-950">Зертхана Тарихы</h2>
              <p className="mt-1.5 text-sm text-slate-500">Барлық тәжірибелер мен нәтижелер</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-400/14 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200">
              <FlaskConical size={15} />
              {labResults.length} тәжірибе
            </div>
          </div>

          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 border-b border-violet-100 bg-violet-50 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 lg:grid">
            {["Тәжірибе аты", "Күні", "Уақыт", "Нәтиже", "Күйі"].map((header, index) => (
              <span key={header} className="inline-flex items-center gap-2">
                {header}
                {index === 0 && <ChevronDown size={12} />}
              </span>
            ))}
          </div>

          <div className="divide-y divide-violet-100">
            {labResults.map((lab, index) => (
              <div key={lab.id} className={`px-6 py-4 transition hover:bg-violet-50 ${index % 2 === 1 ? "bg-violet-50/60" : ""}`}>
                <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] lg:items-center">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${lab.status === "completed" ? "bg-emerald-400" : lab.status === "in-progress" ? "bg-amber-400" : "bg-slate-600"}`} />
                    <span className="text-sm font-semibold text-slate-800">{lab.name}</span>
                  </div>
                  <div className="text-sm text-slate-500">{lab.date}</div>
                  <div className="inline-flex items-center gap-2 text-sm text-slate-500"><Clock size={12} /> {lab.time}</div>
                  <div><ScoreBar score={lab.score} /></div>
                  <div><StatusBadge status={lab.status} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 border-t border-violet-100 bg-violet-50 px-6 py-4 text-sm">
            {[
              { label: "Аяқталған", value: completed, color: "#10b981" },
              { label: "Орындалуда", value: labResults.filter((item) => item.status === "in-progress").length, color: "#f59e0b" },
              { label: "Күтілуде", value: labResults.filter((item) => item.status === "pending").length, color: "#64748b" },
              { label: "Орт. балл", value: `${avgScore}%`, color: "#a78bfa" },
            ].map((item) => (
              <div key={item.label} className="inline-flex items-center gap-2">
                <span className="text-slate-500">{item.label}:</span>
                <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-violet-200 bg-white p-6 shadow-[0_20px_44px_rgba(76,29,149,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <Award size={18} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Жетістіктер</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { emoji: "⚡", label: "Алғашқы тәжірибе", earned: true, desc: "Бірінші зертхана аяқталды" },
              { emoji: "🎯", label: "Үздік нәтиже", earned: true, desc: "95% балл алынды" },
              { emoji: "🔬", label: "Зерттеуші", earned: true, desc: "5 тәжірибе аяқталды" },
              { emoji: "🏆", label: "Физик", earned: false, desc: "15 тәжірибені аяқта" },
            ].map((achievement) => (
              <div
                key={achievement.label}
                className={`rounded-2xl border p-4 transition ${achievement.earned ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-slate-50 opacity-70"}`}
              >
                <div className="text-3xl">{achievement.emoji}</div>
                <p className={`mt-3 text-sm font-bold ${achievement.earned ? "text-slate-800" : "text-slate-500"}`}>{achievement.label}</p>
                <p className="mt-1 text-sm text-slate-500">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
