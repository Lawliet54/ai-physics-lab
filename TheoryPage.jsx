import { useState } from "react";
import { ClipboardList, FlaskConical, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import { THEORY_COMPLEXITY_META, THEORY_DATA, THEORY_TOPIC_STYLES } from "./theoryData";

function TheoryCard({ item, index }) {
  const navigate = useNavigate();
  const Icon = item.icon;
  const complexity = THEORY_COMPLEXITY_META[item.complexity];
  const topicStyle = THEORY_TOPIC_STYLES[item.topic] || THEORY_TOPIC_STYLES["Тізбектер"];

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white p-6 shadow-[0_16px_36px_rgba(76,29,149,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-violet-300 hover:shadow-[0_20px_48px_rgba(76,29,149,0.14)]"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute right-5 top-5 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
        {item.code}
      </div>

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 shadow-[0_0_24px_rgba(99,102,241,0.12)] transition duration-300 group-hover:scale-105">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border"
          style={{
            color: item.accent,
            background: item.iconBg,
            borderColor: `${item.accent}33`,
            boxShadow: `0 0 24px ${item.glow}`,
          }}
        >
          <Icon size={24} />
        </div>
      </div>

      <h3 className="text-center text-lg font-bold text-slate-900">{item.title}</h3>
      <div className="mt-3 flex justify-center">
        <div
          className="rounded-xl border px-4 py-2 font-mono text-sm font-semibold"
          style={{
            color: item.accent,
            background: `${item.accent}12`,
            borderColor: `${item.accent}33`,
          }}
        >
          {item.formula}
        </div>
      </div>

      <p className="mt-4 text-center text-sm leading-7 text-slate-600">{item.description}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${topicStyle.bg} ${topicStyle.text}`}>
          {item.topic}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complexity.bg} ${complexity.text}`}>
          {item.complexity}
        </span>
      </div>

      <div className="mt-5 border-t border-violet-500/10 pt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>{item.progress}% орындалды</span>
          <span>{item.sections} бөлім</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(`/theory/${item.id}`)}
          className="flex-1 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
        >
          Теорияны оқу
        </button>
        <button
          type="button"
          onClick={() => navigate(`/theory/${item.id}/tasks`)}
          aria-label={`${item.title} тапсырмалары`}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-white text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          <ClipboardList size={18} />
        </button>
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
    <div className="min-h-screen bg-[#0a0918] text-slate-100">
      <div className="border-b border-violet-500/15 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_52%),linear-gradient(180deg,#100f24_0%,#0a0918_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <Breadcrumbs items={[{ label: "Теория" }]} />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                <FlaskConical size={14} />
                AI-Physics Lab
              </div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-white md:text-5xl">
                Физика теориясы
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Электр және магнетизм бойынша негізгі заңдар мен ұғымдарды интерактивті түрде меңгеріңіз.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-violet-500/15 bg-white/5 p-4 backdrop-blur">
              <div className="rounded-2xl border border-white/8 bg-[#120f25] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Бөлімдер</div>
                <div className="mt-1 text-2xl font-bold text-white">{THEORY_DATA.length}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#120f25] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Көрсетілгені</div>
                <div className="mt-1 text-2xl font-bold text-violet-200">{filteredItems.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Заңдарды іздеу..."
                className="w-full rounded-2xl border border-violet-500/20 bg-[#120f25] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-violet-500/10 bg-[#0d0b1d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4 lg:px-8">
          <SlidersHorizontal size={14} className="text-violet-300" />
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setTopicFilter(topic)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  topicFilter === topic
                    ? "border-violet-400/50 bg-violet-500/20 text-white"
                    : "border-violet-500/15 bg-white/5 text-slate-400 hover:border-violet-400/25 hover:text-slate-200"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="mx-2 hidden h-6 w-px bg-violet-500/10 md:block" />

          <div className="flex flex-wrap gap-2">
            {complexities.map((complexity) => (
              <button
                key={complexity}
                type="button"
                onClick={() => setComplexityFilter(complexity)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  complexityFilter === complexity
                    ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                    : "border-violet-500/15 bg-white/5 text-slate-400 hover:border-indigo-400/25 hover:text-slate-200"
                }`}
              >
                {complexity}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f8f7ff]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-violet-200 bg-white px-6 py-16 text-center shadow-[0_16px_40px_rgba(76,29,149,0.08)]">
            <p className="text-lg font-semibold text-slate-900">Тақырып табылмады</p>
            <p className="mt-2 text-sm text-slate-500">Іздеу сұрауын немесе сүзгілерді өзгертіп көріңіз.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
