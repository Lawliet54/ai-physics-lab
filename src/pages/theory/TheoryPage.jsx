import { useState } from "react";
import { ClipboardList, FlaskConical, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import FormulaView from "../../components/formula/FormulaView";
import { THEORY_COMPLEXITY_META, THEORY_DATA, THEORY_TOPIC_STYLES } from "../../data/theoryData";

function TheoryCard({ item, index }) {
  const navigate = useNavigate();
  const Icon = item.icon;
  const complexity = THEORY_COMPLEXITY_META[item.complexity];
  const topicStyle = THEORY_TOPIC_STYLES[item.topic] || THEORY_TOPIC_STYLES["Тізбектер"];

  return (
    <article
      className="app-card app-card-hover group flex h-full flex-col p-4 max-[480px]:p-3.5"
      style={{
        animationDelay: `${index * 45}ms`,
        "--app-card-accent": item.accent,
        "--app-card-accent-soft": `${item.accent}55`,
        "--app-card-glow": item.glow,
      }}
    >
      <div className="absolute right-5 top-5">
        <span className="app-card-badge">{item.code}</span>
      </div>

      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 shadow-[0_0_18px_rgba(99,102,241,0.1)] transition duration-300 group-hover:scale-105">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border"
          style={{
            color: item.accent,
            background: item.iconBg,
            borderColor: `${item.accent}33`,
            boxShadow: `0 0 24px ${item.glow}`,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <h3 className="text-center text-[1.05rem] font-bold text-slate-900">{item.title}</h3>
      <div className="mt-2 flex justify-center">
        <div
          className="rounded-xl border px-4 py-1.5 text-sm font-semibold"
          style={{
            color: item.accent,
            background: `${item.accent}12`,
            borderColor: `${item.accent}33`,
          }}
        >
          <FormulaView formula={item.formula} className="text-[0.95rem]" accent={item.accent} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <span className={`app-card-pill ${topicStyle.bg} ${topicStyle.text}`}>
          {item.topic}
        </span>
        <span className={`app-card-pill ${complexity.bg} ${complexity.text}`}>
          {item.complexity}
        </span>
      </div>

      <div className="app-card-divider mt-4" />

      <div className="mt-auto pt-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(`/theory/${item.id}`)}
          className="min-h-11 flex-1 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
        >
          Теорияны оқу
        </button>
        <button
          type="button"
          onClick={() => navigate(`/theory/${item.id}/tasks`)}
          aria-label={`${item.title} тапсырмалары`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-white text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          <ClipboardList size={18} />
        </button>
      </div>
      </div>
    </article>
  );
}

export default function TheoryPage() {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("Барлығы");
  const [complexityFilter, setComplexityFilter] = useState("Барлығы");

  const topics = ["Барлығы", ...Array.from(new Set(THEORY_DATA.map((item) => item.topic)))];
  const complexities = ["Барлығы", "Жеңіл", "Орташа", "Жоғары"];

  const filteredItems = THEORY_DATA.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.formula.toLowerCase().includes(query) ||
      item.topic.toLowerCase().includes(query);
    const matchesTopic = topicFilter === "Барлығы" || item.topic === topicFilter;
    const matchesComplexity = complexityFilter === "Барлығы" || item.complexity === complexityFilter;
    return matchesSearch && matchesTopic && matchesComplexity;
  });

  return (
    <div className="min-h-screen bg-[#f4f1ff] text-slate-900">
      <div className="border-b border-violet-200 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.2),_transparent_52%),linear-gradient(180deg,#faf7ff_0%,#f1eeff_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-8 max-[480px]:px-4 max-[480px]:py-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Теория" }]} />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/45 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                <FlaskConical size={14} />
                AI-Physics Lab
              </div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-slate-950 max-[480px]:text-3xl md:text-5xl">
                Физика теориясы
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Электр және магнетизм бойынша негізгі заңдар мен ұғымдарды интерактивті түрде меңгеріңіз.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-violet-200 bg-white/75 p-4 backdrop-blur max-[480px]:w-full max-[480px]:rounded-2xl max-[480px]:p-3">
              <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Бөлімдер</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{THEORY_DATA.length}</div>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Көрсетілгені</div>
                <div className="mt-1 text-2xl font-bold text-violet-700">{filteredItems.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Заңдарды іздеу..."
                className="min-h-12 w-full rounded-2xl border border-violet-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20 max-[480px]:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-violet-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2.5 px-6 py-3 max-[480px]:px-4 lg:px-8">
          <SlidersHorizontal size={14} className="text-violet-500" />
          <div className="flex flex-wrap gap-2 max-[480px]:-mx-4 max-[480px]:flex-nowrap max-[480px]:overflow-x-auto max-[480px]:px-4 max-[480px]:pb-1">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setTopicFilter(topic)}
                className={`min-h-11 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  topicFilter === topic
                    ? "border-violet-500 bg-violet-500 text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)]"
                    : "border-violet-200 bg-white text-slate-600 hover:border-violet-300 hover:text-slate-900"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="mx-2 hidden h-6 w-px bg-violet-500/10 md:block" />

          <div className="flex flex-wrap gap-2 max-[480px]:-mx-4 max-[480px]:flex-nowrap max-[480px]:overflow-x-auto max-[480px]:px-4 max-[480px]:pb-1">
            {complexities.map((complexity) => (
              <button
                key={complexity}
                type="button"
                onClick={() => setComplexityFilter(complexity)}
                className={`min-h-11 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  complexityFilter === complexity
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.16)]"
                    : "border-violet-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-slate-900"
                }`}
              >
                {complexity}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f8f7ff]">
        <div className="mx-auto max-w-6xl px-6 py-7 max-[480px]:px-4 max-[480px]:py-5 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-violet-200 bg-white px-6 py-16 text-center shadow-[0_16px_40px_rgba(76,29,149,0.08)]">
            <p className="text-lg font-semibold text-slate-900">Тақырып табылмады</p>
            <p className="mt-2 text-sm text-slate-500">Іздеу сұрауын немесе сүзгілерді өзгертіп көріңіз.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <TheoryCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
