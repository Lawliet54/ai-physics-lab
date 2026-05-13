import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Atom, BookOpen, Bot, ChevronRight, Lightbulb, Magnet, Play, Waves, Zap } from "lucide-react";

const cards = [
  {
    icon: Zap,
    accent: "from-violet-500 to-fuchsia-500",
    surface: "bg-violet-500/10",
    iconColor: "text-violet-300",
    title: "Электр өрісі",
    desc: "Электр зарядтарының өзара әрекеттесуін зерттеп, өріс сызықтарын динамикалық түрде бақылаңыз.",
  },
  {
    icon: Magnet,
    accent: "from-indigo-500 to-sky-500",
    surface: "bg-indigo-500/10",
    iconColor: "text-indigo-300",
    title: "Магнит өрісі",
    desc: "Тұрақты магниттер мен ток тудыратын өрістердің бағыты мен күшін салыстырыңыз.",
  },
  {
    icon: Waves,
    accent: "from-cyan-500 to-teal-500",
    surface: "bg-cyan-500/10",
    iconColor: "text-cyan-300",
    title: "Электромагниттік толқындар",
    desc: "Жарық пен радиотолқындардың табиғатын және таралу заңдылықтарын визуалды меңгеріңіз.",
  },
  {
    icon: Atom,
    accent: "from-pink-500 to-rose-500",
    surface: "bg-pink-500/10",
    iconColor: "text-pink-300",
    title: "Атом физикасы",
    desc: "Атом құрылысы мен ядролық процестерді интуитивті анимациялар арқылы түсініңіз.",
  },
  {
    icon: Lightbulb,
    accent: "from-amber-500 to-orange-500",
    surface: "bg-amber-500/10",
    iconColor: "text-amber-300",
    title: "Электр тізбектері",
    desc: "Тізбектер жинап, кернеу мен токты өлшеп, Ом заңын тәжірибе арқылы тексеріңіз.",
  },
];

function PhysicsVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full border border-violet-500/20" style={{ animation: "spin 22s linear infinite" }} />
        <div className="absolute h-64 w-64 rounded-full border border-indigo-500/20" style={{ animation: "spin 14s linear infinite reverse" }} />
        <div className="absolute h-44 w-44 rounded-full border border-violet-300/25" style={{ animation: "spin 9s linear infinite" }} />
      </div>

      <svg viewBox="0 0 300 300" className="relative z-10 h-72 w-72" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="heroCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
          </radialGradient>
          <filter id="heroGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <ellipse cx="150" cy="150" rx="120" ry="45" fill="none" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.4" />
        <ellipse cx="150" cy="150" rx="120" ry="45" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.35" transform="rotate(60 150 150)" />
        <ellipse cx="150" cy="150" rx="120" ry="45" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.35" transform="rotate(120 150 150)" />

        <circle cx="150" cy="150" r="34" fill="url(#heroCoreGlow)" />
        <circle cx="150" cy="150" r="14" fill="#8b5cf6" opacity="0.95" />
        <circle cx="150" cy="150" r="7" fill="#ddd6fe" />

        <circle cx="270" cy="150" r="5" fill="#c4b5fd" filter="url(#heroGlow)">
          <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="270" cy="150" r="5" fill="#818cf8" filter="url(#heroGlow)">
          <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="6s" repeatCount="indefinite" additive="sum" />
        </circle>

        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + 22 * Math.cos(rad);
          const y1 = 150 + 22 * Math.sin(rad);
          const x2 = 150 + 58 * Math.cos(rad);
          const y2 = 150 + 58 * Math.sin(rad);
          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 3" />;
        })}

        <path d="M 62 84 L 50 114 L 66 106 L 48 140" stroke="#fbbf24" strokeWidth="2" fill="none" strokeOpacity="0.75" strokeLinecap="round" />
        <path d="M 238 84 L 250 114 L 234 106 L 252 140" stroke="#fbbf24" strokeWidth="2" fill="none" strokeOpacity="0.75" strokeLinecap="round" />
      </svg>

      <div className="absolute right-2 top-2 rounded-2xl border border-violet-400/20 bg-violet-500/12 px-4 py-2 font-mono text-xs font-semibold text-violet-200">
        E = mc²
      </div>
      <div className="absolute bottom-4 left-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/12 px-4 py-2 font-mono text-xs font-semibold text-indigo-200">
        F = qE
      </div>
      <div className="absolute right-4 top-1/3 rounded-2xl border border-violet-400/20 bg-violet-500/12 px-4 py-2 font-mono text-xs font-semibold text-violet-200">
        B = μ₀H
      </div>
    </div>
  );
}

export default function AIPhysicsLab({ onNavigate = () => {}, embedded = false }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");

  const routeMap = {
    home: "/",
    theory: "/theory",
    lab: "/labs",
    tasks: "/tasks",
    results: "/results",
    ai: "/ai",
    labs: "/labs",
    ohms: "/labs/ohms-law",
  };

  const goTo = (target) => {
    const route = routeMap[target];
    if (route) {
      navigate(route);
      return;
    }
    onNavigate(target);
  };

  const handleNavChange = (id) => {
    setActiveNav(id);
    if (id === "lab") {
      goTo("labs");
      return;
    }
    goTo(id);
  };

  return (
    <div className={`${embedded ? "min-h-screen" : "flex h-screen overflow-hidden"} bg-[#0a0918]`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'Exo 2', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <main className={`${embedded ? "min-h-screen w-full overflow-y-auto" : "flex-1 overflow-y-auto"} text-slate-100`}>
        <section className="relative overflow-hidden border-b border-violet-500/10 bg-[radial-gradient(circle_at_75%_50%,rgba(76,29,149,0.34),transparent_32%),linear-gradient(135deg,#050914_0%,#090d1d_55%,#080916_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative mx-auto grid min-h-[78vh] max-w-7xl gap-10 px-8 py-16 max-[480px]:min-h-0 max-[480px]:gap-7 max-[480px]:px-4 max-[480px]:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.04em] text-white max-[480px]:text-[3.25rem] md:text-7xl xl:text-[6.5rem]">
                AI-Physics
                <span className="mt-2 block bg-gradient-to-r from-violet-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                  lab
                </span>
              </h1>

              <p className="mt-6 text-2xl font-medium uppercase tracking-[0.22em] text-indigo-300 max-[480px]:text-sm max-[480px]:tracking-[0.16em]">Электр және магнетизм</p>

              <div className="mt-10 flex flex-wrap gap-4 max-[480px]:mt-7 max-[480px]:flex-col">
                <button
                  onClick={() => goTo("labs")}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-7 py-4 text-base font-bold text-white shadow-[0_18px_34px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 max-[480px]:w-full"
                >
                  <Play size={18} fill="white" />
                  Зертхананы бастау
                </button>
                <button
                  onClick={() => handleNavChange("theory")}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-violet-400/20 bg-transparent px-7 py-4 text-base font-semibold text-violet-200 transition hover:bg-violet-500/10 max-[480px]:w-full"
                >
                  <BookOpen size={18} />
                  Теорияны оқу
                </button>
              </div>

              <div className="mt-12 flex flex-wrap gap-10 max-[480px]:mt-8 max-[480px]:grid max-[480px]:grid-cols-3 max-[480px]:gap-3">
                {[
                  { value: "24+", label: "Тәжірибе" },
                  { value: "6", label: "Бөлім" },
                  { value: "AI", label: "Нұсқаулық" },
                ].map((item) => (
                  <div key={item.label} className="max-[480px]:rounded-2xl max-[480px]:border max-[480px]:border-violet-400/15 max-[480px]:bg-white/5 max-[480px]:p-3 max-[480px]:text-center">
                    <p className="text-4xl font-black text-white max-[480px]:text-2xl">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-500 max-[480px]:text-[11px]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden h-full min-h-[540px] items-center justify-center lg:flex" style={{ animation: "float 6s ease-in-out infinite" }}>
              <div className="absolute inset-10 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.85), rgba(79,70,229,0.2), transparent)" }} />
              <PhysicsVisual />
            </div>
          </div>
        </section>

        <section className="bg-[#f8f7ff] px-8 py-14 max-[480px]:px-4 max-[480px]:py-9">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-center justify-between gap-4 max-[480px]:mb-6 max-[480px]:items-end">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.02em] text-slate-900 max-[480px]:text-2xl">Зертхана модульдері</h2>
                <p className="mt-2 text-sm text-slate-500">Тақырыпты таңдап, зерттеуді бастаңыз</p>
              </div>
              <button className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-semibold text-violet-500 transition hover:text-violet-600">
                Барлығы <ChevronRight size={15} />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    onClick={() => goTo(card.title === "Электр тізбектері" ? "ohms" : "labs")}
                    className="group min-h-[44px] rounded-[26px] border border-violet-200 bg-white p-6 text-left shadow-[0_14px_30px_rgba(76,29,149,0.08)] transition hover:-translate-y-1.5 hover:border-violet-300 max-[480px]:rounded-2xl max-[480px]:p-5"
                  >
                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${card.surface}`}>
                      <Icon size={22} className={card.iconColor} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition group-hover:gap-3">
                      Зерттеу <ChevronRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
