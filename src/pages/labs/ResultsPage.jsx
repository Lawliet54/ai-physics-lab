import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, BarChart3, Calendar, CheckCircle2, ChevronDown, Clock, FlaskConical, Layers, TrendingUp } from "lucide-react";
import { apiRequest } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

const weeklyActivity = [
  { day: "Дс", completed_count: 0, teacher_score: 0 },
  { day: "Сс", completed_count: 0, teacher_score: 0 },
  { day: "Ср", completed_count: 0, teacher_score: 0 },
  { day: "Бс", completed_count: 0, teacher_score: 0 },
  { day: "Жм", completed_count: 0, teacher_score: 0 },
  { day: "Сб", completed_count: 0, teacher_score: 0 },
  { day: "Жк", completed_count: 0, teacher_score: 0 },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div
      className="app-card app-card-hover p-4"
      style={{
        "--app-card-accent": color,
        "--app-card-accent-soft": `${color}66`,
        "--app-card-glow": `${color}22`,
      }}
    >
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
      <p className="mt-1.5 text-[2.6rem] font-black tracking-[-0.03em] text-slate-950">{value}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-violet-200 bg-white/95 px-4 py-3 shadow-[0_16px_30px_rgba(76,29,149,0.12)] backdrop-blur">
      <p className="text-sm font-bold text-violet-700">{label}</p>
      <p className="mt-2 text-sm text-slate-700">Орындалған тапсырма: <strong className="text-violet-700">{payload[0]?.value}</strong></p>
      {payload[1] && payload[1].value > 0 && (
        <p className="mt-1 text-sm text-slate-700">Мұғалім қойған балл: <strong className="text-emerald-600">{payload[1]?.value}</strong></p>
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
  const { user } = useAuth();
  const [chartType, setChartType] = useState("experiments");
  const [taskSummary, setTaskSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await apiRequest("/me/task-summary");
        if (!cancelled) setTaskSummary(data);
      } catch {
        if (!cancelled) setTaskSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const completed = taskSummary?.completed_tasks ?? 0;
  const activityData = (taskSummary?.daily_activity?.length ? taskSummary.daily_activity : weeklyActivity).map((item) => ({
    day: item.label || item.day,
    completed_count: item.completed_count ?? 0,
    teacher_score: item.teacher_score ?? 0,
  }));
  const totalActivity = activityData.reduce((sum, item) => sum + item.completed_count, 0);
  const recentAttempts = taskSummary?.recent_attempts || [];

  return (
    <div className="min-h-screen bg-[#f4f1ff] text-slate-900">
      <div className="border-b border-violet-200 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.18),_transparent_55%),linear-gradient(180deg,#faf7ff_0%,#f1eeff_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-7 max-[480px]:px-4 max-[480px]:py-6">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 size={18} className="text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Нәтижелер</span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-slate-950 md:text-[3.2rem]">Менің прогресім</h1>
              <p className="mt-3 text-sm text-slate-600">Электр және магнетизм бойынша тапсырмалар прогресі мен мұғалім бағалары</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white/75 px-4 py-2.5 text-sm text-slate-600">
              <Calendar size={14} />
              Соңғы 7 күн
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f7ff]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 max-[480px]:px-4 max-[480px]:py-5">
        <section className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          <StatCard
            icon={Layers}
            label="Барлық тапсырма"
            value={taskSummary ? taskSummary.total_tasks : loading ? "..." : "—"}
            sub="Тапсырмалар"
            color="#7c3aed"
          />
          <StatCard
            icon={CheckCircle2}
            label="Аяқталды"
            value={taskSummary ? taskSummary.completed_tasks : loading ? "..." : "—"}
            sub="Тапсырма"
            color="#10b981"
          />
          <StatCard
            icon={Clock}
            label="Орындалуда"
            value={taskSummary ? taskSummary.in_progress_tasks : loading ? "..." : "—"}
            sub="Тапсырма"
            color="#f59e0b"
          />
          <StatCard
            icon={Award}
            label="Жиналған ұпай"
            value={taskSummary ? `${taskSummary.earned_points} / ${taskSummary.max_points}` : loading ? "..." : "—"}
            sub="Тапсырмалар"
            color="#a78bfa"
          />
        </section>

        <section
          className="app-card p-5 max-[480px]:p-4"
          style={{ "--app-card-accent": "#8b5cf6" }}
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-black tracking-[-0.02em] text-slate-950">Белсенділік Диаграммасы</h2>
              <p className="mt-1.5 text-sm text-slate-500">Соңғы 7 күндегі тәжірибе белсенділігі</p>
            </div>
            <div className="inline-flex rounded-2xl border border-violet-200 bg-violet-50 p-1">
              {[
                { key: "completed_count", label: "Тапсырмалар", color: "#7c3aed" },
                { key: "teacher_score", label: "Мұғалім бағасы", color: "#10b981" },
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
              <BarChart data={activityData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="4 6" stroke="#ddd6fe" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
                <Bar dataKey={chartType} radius={[8, 8, 0, 0]}>
                  {activityData.map((entry, index) => {
                    const value = entry[chartType];
                    const baseColor = chartType === "completed_count" ? "#7c3aed" : "#10b981";
                    return <Cell key={index} fill={value === 0 ? "#ede9fe" : baseColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-violet-500" /> Орындалған тапсырма бар күн</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-violet-200" /> Белсенділік жоқ күн</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-cyan-500" /> Ағымдағы апта</span>
          </div>
        </section>

        <section
          className="app-card overflow-hidden"
          style={{ "--app-card-accent": "#8b5cf6" }}
        >
          <div className="flex flex-col gap-3 border-b border-violet-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between max-[480px]:px-4">
            <div>
              <h2 className="text-[2rem] font-black tracking-[-0.02em] text-slate-950">Тапсырма тарихы</h2>
              <p className="mt-1.5 text-sm text-slate-500">Соңғы жіберілген жауаптар, мәртебе және мұғалім бағалары</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-300/45 bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              <FlaskConical size={15} />
              {recentAttempts.length} әрекет
            </div>
          </div>

          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 border-b border-violet-100 bg-violet-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 lg:grid">
            {["Тапсырма", "Күні", "Тақырып", "Баға", "Күйі"].map((header, index) => (
              <span key={header} className="inline-flex items-center gap-2">
                {header}
                {index === 0 && <ChevronDown size={12} />}
              </span>
            ))}
          </div>

          <div className="divide-y divide-violet-100">
            {recentAttempts.map((lab, index) => (
              <div key={lab.id} className={`px-5 py-3.5 transition hover:bg-violet-50 max-[480px]:px-4 ${index % 2 === 1 ? "bg-violet-50/60" : ""}`}>
                <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] lg:items-center">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${lab.status === "completed" ? "bg-emerald-400" : lab.status === "in_progress" ? "bg-amber-400" : "bg-slate-600"}`} />
                    <span className="text-sm font-semibold text-slate-800">{lab.task_code} · {lab.task_title}</span>
                  </div>
                  <div className="text-sm text-slate-500">{lab.submitted_at ? new Date(lab.submitted_at).toLocaleDateString() : new Date(lab.created_at).toLocaleDateString()}</div>
                  <div className="inline-flex items-center gap-2 text-sm text-slate-500"><Clock size={12} /> {lab.topic_title || "—"}</div>
                  <div><ScoreBar score={lab.reviewed_at ? Number(lab.score || 0) * 10 : 0} /></div>
                  <div><StatusBadge status={lab.status === "in_progress" ? "in-progress" : lab.status} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 border-t border-violet-100 bg-violet-50 px-5 py-3.5 text-sm max-[480px]:px-4">
            {[
              { label: "Аяқталған", value: completed, color: "#10b981" },
              { label: "Орындалуда", value: taskSummary?.in_progress_tasks ?? 0, color: "#f59e0b" },
              { label: "Тексерілген", value: recentAttempts.filter((item) => item.reviewed_at).length, color: "#64748b" },
              { label: "Күндік белсенділік", value: totalActivity, color: "#a78bfa" },
            ].map((item) => (
              <div key={item.label} className="inline-flex items-center gap-2">
                <span className="text-slate-500">{item.label}:</span>
                <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="app-card p-5 max-[480px]:p-4"
          style={{ "--app-card-accent": "#f59e0b" }}
        >
          <div className="mb-3 flex items-center gap-3">
            <Award size={18} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Жетістіктер</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { emoji: "⚡", label: "Алғашқы тәжірибе", earned: true, desc: "Бірінші зертхана аяқталды" },
              { emoji: "🎯", label: "Үздік нәтиже", earned: true, desc: "95% балл алынды" },
              { emoji: "🔬", label: "Зерттеуші", earned: true, desc: "5 тәжірибе аяқталды" },
              { emoji: "🏆", label: "Физик", earned: false, desc: "15 тәжірибені аяқта" },
            ].map((achievement) => (
              <div
                key={achievement.label}
                className={`app-card ${achievement.earned ? "app-card-hover" : "opacity-70"} p-4 transition`}
                style={{
                  "--app-card-accent": achievement.earned ? "#8b5cf6" : "#94a3b8",
                  "--app-card-accent-soft": achievement.earned ? "rgba(139,92,246,0.45)" : "rgba(148,163,184,0.45)",
                  "--app-card-glow": achievement.earned ? "rgba(139,92,246,0.14)" : "rgba(148,163,184,0.10)",
                  background: achievement.earned ? "#f5f3ff" : "#f8fafc",
                }}
              >
                <div className="text-3xl">{achievement.emoji}</div>
                <p className={`mt-3 text-sm font-bold ${achievement.earned ? "text-slate-800" : "text-slate-500"}`}>{achievement.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
