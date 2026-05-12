import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Magnet,
  Activity,
  Radio,
  Cpu,
  GitMerge,
  Battery,
  Circle,
  Gauge,
  Wind,
  Navigation,
  Repeat,
  RotateCcw,
  Settings,
  ChevronRight,
  FlaskConical,
  Search,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";

const experiments = [
  {
    id: 1,
    title: "Кулон заңын тәжірибелік модельдеу",
    topic: "Электростатика",
    icon: Zap,
    difficulty: "Базалық",
    duration: "20 мин",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorText: "#92400e",
  },
  {
    id: 2,
    title: "Электр өрісінің кернеулігін визуализациялау",
    topic: "Электр өрісі",
    icon: Activity,
    difficulty: "Орташа",
    duration: "25 мин",
    color: "#8b5cf6",
    colorBg: "#ede9fe",
    colorText: "#4c1d95",
  },
  {
    id: 3,
    title: "Электр потенциалының өзгерісін зерттеу",
    topic: "Потенциал",
    icon: Gauge,
    difficulty: "Орташа",
    duration: "30 мин",
    color: "#06b6d4",
    colorBg: "#cffafe",
    colorText: "#164e63",
  },
  {
    id: 4,
    title: "Конденсатор сыйымдылығының тәуелділігін анықтау",
    topic: "Конденсаторлар",
    icon: Cpu,
    difficulty: "Орташа",
    duration: "35 мин",
    color: "#10b981",
    colorBg: "#d1fae5",
    colorText: "#064e3b",
  },
  {
    id: 5,
    title: "Тізбек бөлігі үшін Ом заңын тәжірибелік зерттеу",
    topic: "Тізбектер",
    icon: Radio,
    difficulty: "Базалық",
    duration: "20 мин",
    color: "#f43f5e",
    colorBg: "#ffe4e6",
    colorText: "#881337",
  },
  {
    id: 6,
    title: "Өткізгіштерді тізбектей және параллель жалғауды модельдеу",
    topic: "Тізбектер",
    icon: GitMerge,
    difficulty: "Базалық",
    duration: "25 мин",
    color: "#f97316",
    colorBg: "#ffedd5",
    colorText: "#7c2d12",
  },
  {
    id: 7,
    title: "Ток көзінің ЭҚК мен ішкі кедергінің ток күшіне әсерін зерттеу",
    topic: "Энергия көздері",
    icon: Battery,
    difficulty: "Күрделі",
    duration: "40 мин",
    color: "#6366f1",
    colorBg: "#e0e7ff",
    colorText: "#312e81",
  },
  {
    id: 8,
    title: "Толық тізбек үшін Ом заңын зерттеу",
    topic: "Тізбектер",
    icon: Circle,
    difficulty: "Орташа",
    duration: "30 мин",
    color: "#14b8a6",
    colorBg: "#ccfbf1",
    colorText: "#134e4a",
  },
  {
    id: 9,
    title: "Электр тогының жұмысы мен қуатын анықтау",
    topic: "Қуат",
    icon: Zap,
    difficulty: "Орташа",
    duration: "25 мин",
    color: "#eab308",
    colorBg: "#fef9c3",
    colorText: "#713f12",
  },
  {
    id: 10,
    title: "Тогы бар өткізгіштің магнит өрісін бақылау",
    topic: "Магнетизм",
    icon: Magnet,
    difficulty: "Орташа",
    duration: "30 мин",
    color: "#ec4899",
    colorBg: "#fce7f3",
    colorText: "#831843",
  },
  {
    id: 11,
    title: "Ампер күшінің әрекетін зерттеу",
    topic: "Магнетизм",
    icon: Wind,
    difficulty: "Орташа",
    duration: "35 мин",
    color: "#8b5cf6",
    colorBg: "#ede9fe",
    colorText: "#4c1d95",
  },
  {
    id: 12,
    title: "Лоренц күшінің қозғалысқа әсерін модельдеу",
    topic: "Магнетизм",
    icon: Navigation,
    difficulty: "Күрделі",
    duration: "40 мин",
    color: "#06b6d4",
    colorBg: "#cffafe",
    colorText: "#164e63",
  },
  {
    id: 13,
    title: "Электромагниттік индукция құбылысын зерттеу",
    topic: "Индукция",
    icon: Repeat,
    difficulty: "Күрделі",
    duration: "45 мин",
    color: "#10b981",
    colorBg: "#d1fae5",
    colorText: "#064e3b",
  },
  {
    id: 14,
    title: "Ленц ережесін тәжірибелік анықтау",
    topic: "Индукция",
    icon: RotateCcw,
    difficulty: "Күрделі",
    duration: "40 мин",
    color: "#f43f5e",
    colorBg: "#ffe4e6",
    colorText: "#881337",
  },
  {
    id: 15,
    title: "Электр генераторының жұмыс принципін модельдеу",
    topic: "Генераторлар",
    icon: Settings,
    difficulty: "Күрделі",
    duration: "50 мин",
    color: "#6366f1",
    colorBg: "#e0e7ff",
    colorText: "#312e81",
  },
];

const difficultyColors = {
  "Базалық": { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  "Орташа":  { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
  "Күрделі": { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
};

const topics = ["Барлығы", ...Array.from(new Set(experiments.map(e => e.topic)))];

export default function VirtualLabList({
  onOpenExperiment = () => {},
  onBackHome = () => {},
}) {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Барлығы");
  const [selectedDiff, setSelectedDiff] = useState("Барлығы");
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  const handleBackHome = () => {
    onBackHome();
    navigate("/");
  };

  const handleOpenExperiment = (exp) => {
    onOpenExperiment(exp);

    const routeMap = {
      1: "/labs/coulombs-law",
      2: "/labs/electric-field",
      3: "/labs/electric-potential",
      4: "/labs/capacitance",
      5: "/labs/ohms-law",
      6: "/labs/series-parallel",
      8: "/labs/ohms-law",
    };

    if (routeMap[exp.id]) {
      navigate(routeMap[exp.id]);
    }
  };

  const filtered = experiments.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchTopic = selectedTopic === "Барлығы" || e.topic === selectedTopic;
    const matchDiff = selectedDiff === "Барлығы" || e.difficulty === selectedDiff;
    return matchSearch && matchTopic && matchDiff;
  });

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif", background: "#f8f7ff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&display=swap');

        .exp-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #ede9fe;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1), border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .exp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--card-color);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .exp-card:hover::before { transform: scaleX(1); }
        .exp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(109,40,217,0.10);
          border-color: var(--card-color);
        }
        .go-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 0;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Exo 2', sans-serif;
        }
        .go-btn:hover { filter: brightness(1.05); transform: scale(1.02); }
        .filter-chip {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.18s ease;
          white-space: nowrap;
          font-family: 'Exo 2', sans-serif;
        }
        .filter-chip.active {
          background: #7c3aed;
          color: #fff;
          border-color: #7c3aed;
        }
        .filter-chip:not(.active) {
          background: #fff;
          color: #6b7280;
          border-color: #e5e7eb;
        }
        .filter-chip:not(.active):hover {
          border-color: #7c3aed;
          color: #7c3aed;
        }
        .search-input {
          font-family: 'Exo 2', sans-serif;
          font-size: 13.5px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px 10px 40px;
          outline: none;
          transition: border 0.2s;
          width: 260px;
          background: #fff;
          color: #111;
        }
        .search-input:focus { border-color: #7c3aed; }
        .number-badge {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .grid-area { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 580px) {
          .grid-area { grid-template-columns: 1fr !important; }
          .search-input { width: 100%; }
          .filters-row { flex-wrap: wrap; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1b2e 0%, #12111f 100%)",
        padding: "40px 32px 32px",
        borderBottom: "1px solid #2d2b4e",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <button
            onClick={handleBackHome}
            style={{
              marginBottom: 18,
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #4c1d95",
              background: "rgba(124,58,237,0.12)",
              color: "#c4b5fd",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Басты бетке оралу
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <FlaskConical size={20} color="#a78bfa" />
            <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Виртуалды зертхана
            </span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Тәжірибелер тізімі
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0, fontWeight: 400 }}>
            Электр және магнетизм бойынша {experiments.length} интерактивті тәжірибе
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ede9fe", padding: "14px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input
              className="search-input"
              placeholder="Тәжірибе іздеу..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: 1, height: 28, background: "#e5e7eb", margin: "0 4px" }} />

          {/* Topic filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }} className="filters-row">
            <SlidersHorizontal size={14} color="#9ca3af" />
            {topics.map(t => (
              <button
                key={t}
                className={`filter-chip ${selectedTopic === t ? "active" : ""}`}
                onClick={() => setSelectedTopic(t)}
              >{t}</button>
            ))}
          </div>

          <div style={{ width: 1, height: 28, background: "#e5e7eb", margin: "0 4px" }} />

          {/* Difficulty filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Барлығы", "Базалық", "Орташа", "Күрделі"].map(d => (
              <button
                key={d}
                className={`filter-chip ${selectedDiff === d ? "active" : ""}`}
                onClick={() => setSelectedDiff(d)}
              >{d}</button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 13 }}>
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>{filtered.length}</span> / {experiments.length}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
            <BookOpen size={40} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>Тәжірибелер табылмады</p>
            <p style={{ fontSize: 13 }}>Іздеу сұрауын өзгертіп көріңіз</p>
          </div>
        ) : (
          <div
            className="grid-area"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {filtered.map((exp, idx) => {
              const Icon = exp.icon;
              const diff = difficultyColors[exp.difficulty];
              return (
                <div
                  key={exp.id}
                  className="exp-card"
                  style={{ "--card-color": exp.color, animationDelay: `${idx * 40}ms` }}
                  onMouseEnter={() => setHoveredId(exp.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Top row: number + icon */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div
                      className="number-badge"
                      style={{ background: exp.colorBg, color: exp.colorText }}
                    >
                      {String(exp.id).padStart(2, "0")}
                    </div>
                    <div style={{
                      width: 46, height: 46,
                      borderRadius: 12,
                      background: exp.colorBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "transform 0.3s ease",
                      transform: hoveredId === exp.id ? "rotate(8deg) scale(1.1)" : "rotate(0) scale(1)",
                    }}>
                      <Icon size={22} color={exp.color} />
                    </div>
                  </div>

                  {/* Topic tag */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: exp.color,
                      background: exp.colorBg,
                      padding: "2px 9px",
                      borderRadius: 6,
                      letterSpacing: "0.03em",
                    }}>
                      {exp.topic}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1.5,
                    flexGrow: 1,
                  }}>
                    {exp.title}
                  </h3>

                  {/* Meta: difficulty + duration */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 11.5, fontWeight: 600,
                      background: diff.bg, color: diff.text,
                      padding: "3px 9px", borderRadius: 20,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: diff.dot, display: "inline-block" }} />
                      {exp.difficulty}
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      ⏱ {exp.duration}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    className="go-btn"
                    onClick={() => handleOpenExperiment(exp)}
                    style={{
                      background: hoveredId === exp.id ? exp.color : exp.colorBg,
                      color: hoveredId === exp.id ? "#fff" : exp.colorText,
                    }}
                  >
                    Тәжірибеге өту
                    <ChevronRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
