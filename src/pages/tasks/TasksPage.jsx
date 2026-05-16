import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Play,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { getTheoryById } from "../../data/theoryData";
import { apiRequest } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

const statusToUi = (status) => {
  if (status === "completed") return "done";
  if (status === "in_progress") return "progress";
  return "idle";
};

const difficultyUi = (difficulty) => {
  const map = {
    basic: "Базалық",
    intermediate: "Орташа",
    advanced: "Күрделі",
  };
  return map[difficulty] || "Базалық";
};

const normalizeTask = (row) => ({
  id: row.code,
  dbId: row.id,
  title: row.title_kz,
  summary: row.instruction || row.title_kz,
  topic: row.topic_title || row.topic || "Тапсырмалар",
  topicSlug: row.topic_slug || null,
  difficulty: row.difficulty ? difficultyUi(row.difficulty) : row.difficulty || "Базалық",
  points: row.points ?? 0,
  status: row.my_status ? statusToUi(row.my_status) : row.status || "idle",
});

const DIFF_META = {
  "Базалық": { dot: "#22c55e", bg: "rgba(34,197,94,0.12)", text: "#4ade80", label: "Базалық" },
  "Орташа": { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#fbbf24", label: "Орташа" },
  "Күрделі": { dot: "#ef4444", bg: "rgba(239,68,68,0.12)", text: "#f87171", label: "Күрделі" },
};

const TOPIC_COLORS = {
  "Кулон заңы": { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  "Электр өрісі": { bg: "rgba(139,92,246,0.15)", text: "#c4b5fd" },
  "Конденсаторлар": { bg: "rgba(6,182,212,0.12)", text: "#67e8f9" },
  "Тізбектер": { bg: "rgba(99,102,241,0.15)", text: "#a5b4fc" },
  "Энергия көздері": { bg: "rgba(234,179,8,0.12)", text: "#fde047" },
  "Қуат": { bg: "rgba(249,115,22,0.12)", text: "#fb923c" },
  "Магнетизм": { bg: "rgba(236,72,153,0.12)", text: "#f9a8d4" },
  "Индукция": { bg: "rgba(16,185,129,0.12)", text: "#6ee7b7" },
  "Генераторлар": { bg: "rgba(168,85,247,0.12)", text: "#d8b4fe" },
};

function StatusBtn({ status, onClick }) {
  const cfg = {
    idle: { label: "Орындау", bg: "#1e3a5f", border: "#3b82f6", text: "#93c5fd", icon: <Play size={13} style={{ flexShrink: 0 }} /> },
    progress: { label: "Жалғастыру", bg: "#3d2a04", border: "#f59e0b", text: "#fcd34d", icon: <Clock size={13} style={{ flexShrink: 0 }} /> },
    done: { label: "Аяқталды", bg: "#052e16", border: "#22c55e", text: "#86efac", icon: <CheckCircle size={13} style={{ flexShrink: 0 }} /> },
  }[status];

  return (
    <button
      onClick={onClick}
      className="status-btn"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 12.5,
        fontWeight: 700,
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        color: cfg.text,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.filter = "brightness(1.2)";
        event.currentTarget.style.transform = "scale(1.04)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.filter = "brightness(1)";
        event.currentTarget.style.transform = "scale(1)";
      }}
    >
      {cfg.icon}
      {cfg.label}
    </button>
  );
}

function TaskCard({ task, idx, onCycle }) {
  const [hovered, setHovered] = useState(false);
  const diff = DIFF_META[task.difficulty];
  const topicC = TOPIC_COLORS[task.topic] || { bg: "rgba(99,102,241,0.15)", text: "#a5b4fc" };
  const glowColor = { idle: "#3b82f6", progress: "#f59e0b", done: "#22c55e" }[task.status];

  return (
    <div
      className="task-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        border: `1.5px solid ${hovered ? glowColor : "rgba(167,139,250,0.28)"}`,
        borderRadius: 16,
        padding: "20px 20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "default",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px rgba(76,29,149,0.12), 0 0 20px ${glowColor}22` : "0 10px 26px rgba(76,29,149,0.08)",
        transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
        animation: "fadeUp 0.4s ease both",
        animationDelay: `${idx * 45}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
          opacity: hovered ? 1 : 0.3,
          transition: "opacity 0.3s",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono','Courier New',monospace",
            fontSize: 11.5,
            fontWeight: 700,
            color: "#6366f1",
            letterSpacing: "0.05em",
            background: "#eef2ff",
            padding: "3px 9px",
            borderRadius: 6,
          }}
        >
          #{task.id}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>
          <Award size={13} color="#fbbf24" />
          {task.points} ұпай
        </span>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.5, transition: "color 0.2s" }}>
        {task.title}
      </h3>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: topicC.bg, color: topicC.text }}>
          {task.topic}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: diff.bg, color: diff.text }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: diff.dot, display: "inline-block", flexShrink: 0 }} />
          {diff.label}
        </span>
      </div>

      <div style={{ height: 1, background: "rgba(167,139,250,0.18)", margin: "2px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusBtn status={task.status} onClick={() => onCycle(task.id)} />
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#eef2ff",
            border: "1px solid rgba(167,139,250,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.35s ease",
            transform: hovered ? "rotate(15deg)" : "rotate(0deg)",
          }}
        >
          <Zap size={15} color="#818cf8" />
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ done, total }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const pct = total ? done / total : 0;

  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={radius} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="4" />
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke="url(#rg)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.6s ease" }}
      />
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <text x="26" y="30" textAnchor="middle" fill="#c4b5fd" style={{ fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export default function TasksPage() {
  const { theoryId } = useParams();
  const navigate = useNavigate();
  const currentTheory = theoryId ? getTheoryById(theoryId) : null;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("Барлығы");
  const [diffFilter, setDiffFilter] = useState("Барлығы");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = user ? await apiRequest("/me/tasks") : await apiRequest("/tasks");
        const list = (data || []).map((row) => normalizeTask(row));
        if (!cancelled) setTasks(list);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const cycleStatus = async (id) => {
    navigate(`/tasks/${id}`);
  };

  const done = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "progress").length;
  const totalPts = tasks.reduce((acc, task) => acc + task.points, 0);
  const earnedPts = tasks.filter((task) => task.status === "done").reduce((acc, task) => acc + task.points, 0);

  const topics = useMemo(() => ["Барлығы", ...Array.from(new Set(tasks.map((task) => task.topic)))], [tasks]);
  const diffs = ["Барлығы", "Базалық", "Орташа", "Күрделі"];

  const visible = tasks.filter((task) => {
    const okTopic =
      filter === "Барлығы" ||
      task.topic === filter;
    const okDiff = diffFilter === "Барлығы" || task.difficulty === diffFilter;
    return okTopic && okDiff;
  });

  return (
    <div style={{ background: "#f4f1ff", minHeight: "100vh", fontFamily: "'Exo 2',sans-serif", color: "#0f172a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#f4f1ff; }
        ::-webkit-scrollbar-thumb { background:#2d2b55; border-radius:3px; }
        .chip { padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600;
          cursor:pointer; border:1.5px solid transparent; transition:all 0.18s ease;
          font-family:inherit; white-space:nowrap; }
        .chip.on { background:#6366f1; color:#fff; border-color:#6366f1; }
        .chip.off { background:#ffffff; color:#64748b; border-color:rgba(167,139,250,0.28); }
        .chip.off:hover { border-color:#6366f1; color:#4f46e5; }
        .stat-card { background:#ffffff;
          border:1px solid rgba(167,139,250,0.22); border-radius:14px; padding:14px 16px;
          display:flex; align-items:center; gap:14px; flex:1; min-width:160px; }
        @media (max-width: 480px) {
          .tasks-hero {
            padding: 28px 16px 24px !important;
          }
          .tasks-title {
            font-size: 26px !important;
            line-height: 1.12 !important;
          }
          .tasks-progress {
            width: 100%;
            justify-content: space-between;
            padding: 12px 14px !important;
          }
          .stat-card {
            min-width: calc(50% - 6px) !important;
            padding: 14px !important;
            gap: 10px !important;
          }
          .tasks-filter-bar {
            position: static !important;
            padding: 12px 16px !important;
          }
          .tasks-filter-inner {
            align-items: stretch !important;
          }
          .tasks-filter-group {
            flex-wrap: nowrap !important;
            margin-inline: -16px;
            overflow-x: auto;
            padding: 0 16px 4px;
            scrollbar-width: none;
          }
          .tasks-filter-group::-webkit-scrollbar {
            display: none;
          }
          .chip {
            min-height: 44px;
            flex: 0 0 auto;
            padding: 8px 14px;
          }
          .tasks-count {
            margin-left: 0 !important;
            width: 100%;
            text-align: right;
          }
          .tasks-content {
            padding: 20px 16px 36px !important;
          }
          .theory-task-banner {
            align-items: stretch !important;
            flex-direction: column;
          }
          .task-card {
            padding: 18px !important;
            transform: none !important;
          }
          .status-btn {
            min-height: 44px;
            padding: 9px 14px !important;
          }
        }
      `}</style>

      <div className="tasks-hero" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg,#faf7ff 0%,#f1eeff 100%)", borderBottom: "1px solid rgba(167,139,250,0.24)", padding: "44px 32px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            items={
              currentTheory
                ? [
                    { label: "Теория", to: "/theory" },
                    { label: currentTheory.title, to: `/theory/${currentTheory.id}` },
                    { label: "Тапсырмалар" },
                  ]
                : [{ label: "Тапсырмалар" }]
            }
          />

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 className="tasks-title" style={{ fontSize: 34, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em", background: "linear-gradient(135deg,#0f172a 30%,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {currentTheory ? `${currentTheory.title} тапсырмалары` : "Тапсырмалар жинағы"}
              </h1>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0, fontWeight: 400 }}>
                {currentTheory ? "Осы теориялық бөлімге байланысты есептер мен тексеру тапсырмалары" : "Электр және магнетизм бөлімдері бойынша есептер"}
              </p>
            </div>

            <div className="tasks-progress" style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.78)", border: "1px solid rgba(167,139,250,0.24)", borderRadius: 14, padding: "12px 20px" }}>
              <ProgressRing done={done} total={tasks.length} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#6366f1", fontWeight: 600, letterSpacing: "0.05em" }}>ОРЫНДАЛҒАНЫ</p>
                <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                  {done} <span style={{ color: "#64748b", fontWeight: 400, fontSize: 16 }}>/ {tasks.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            {[
              { icon: <Target size={18} color="#818cf8" />, label: "Барлық тапсырма", val: tasks.length, accent: "#6366f1" },
              { icon: <Clock size={18} color="#fbbf24" />, label: "Орындалуда", val: inProgress, accent: "#f59e0b" },
              { icon: <CheckCircle size={18} color="#4ade80" />, label: "Аяқталды", val: done, accent: "#22c55e" },
              { icon: <Star size={18} color="#fb923c" />, label: "Жиналған ұпай", val: `${earnedPts} / ${totalPts}`, accent: "#f97316" },
            ].map((item, index) => (
              <div key={index} className="stat-card" style={{ borderColor: `${item.accent}22` }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tasks-filter-bar" style={{ background: "rgba(248,247,255,0.95)", borderBottom: "1px solid rgba(167,139,250,0.16)", padding: "14px 32px", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div className="tasks-filter-inner" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Filter size={14} color="#6366f1" style={{ flexShrink: 0 }} />
          <div className="tasks-filter-group" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {topics.map((topic) => (
              <button key={topic} className={`chip ${filter === topic ? "on" : "off"}`} onClick={() => setFilter(topic)}>
                {topic}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: "rgba(167,139,250,0.24)", margin: "0 6px" }} />
          <div className="tasks-filter-group" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {diffs.map((diff) => (
              <button key={diff} className={`chip ${diffFilter === diff ? "on" : "off"}`} onClick={() => setDiffFilter(diff)}>
                {diff}
              </button>
            ))}
          </div>
          <div className="tasks-count" style={{ marginLeft: "auto", color: "#64748b", fontSize: 12.5 }}>
            <span style={{ color: "#818cf8", fontWeight: 700 }}>{visible.length}</span> / {tasks.length} тапсырма
          </div>
        </div>
      </div>

      <div style={{ background: "#f8f7ff" }}>
      <div className="tasks-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 32px 36px" }}>
        {currentTheory && (
          <div className="theory-task-banner" style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid rgba(167,139,250,0.18)", background: "#ffffff", borderRadius: 16, padding: "12px 16px", boxShadow: "0 10px 24px rgba(76,29,149,0.06)" }}>
            <div>
              <p style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: 14 }}>{currentTheory.title} бойынша тапсырмалар</p>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12.5 }}>Теориядан кейін білімді бекіту үшін ұсынылған есептер жинағы</p>
            </div>
            <Link to={`/theory/${currentTheory.id}`} style={{ color: "#7c3aed", fontSize: 12.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
              Теорияға оралу
            </Link>
          </div>
        )}

        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4b5563" }}>
            <Layers size={40} color="#1e1b4b" style={{ margin: "0 auto 14px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#6b7280" }}>Тапсырмалар табылмады</p>
            <p style={{ fontSize: 13 }}>Фильтрді өзгертіп көріңіз</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {visible.map((task, index) => (
              <TaskCard key={task.id} task={task} idx={index} onCycle={cycleStatus} />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
