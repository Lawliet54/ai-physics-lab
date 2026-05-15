import { Search, SlidersHorizontal } from "lucide-react";

export default function VirtualLabFilters({
  search,
  selectedTopic,
  selectedDiff,
  topics,
  totalCount,
  filteredCount,
  onSearchChange,
  onTopicChange,
  onDifficultyChange,
}) {
  return (
    <div className="lab-filter-bar">
      <div className="lab-filter-inner">
        <div className="lab-search-wrap">
          <Search size={15} color="#9ca3af" className="lab-search-icon" />
          <input
            className="search-input"
            placeholder="Тәжірибе іздеу..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="filter-separator" />

        <div className="filters-row">
          <SlidersHorizontal size={14} color="#9ca3af" />
          {topics.map((topic) => (
            <button
              key={topic}
              className={`filter-chip ${selectedTopic === topic ? "active" : ""}`}
              onClick={() => onTopicChange(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="filter-separator" />

        <div className="difficulty-row">
          {["Барлығы", "Базалық", "Орташа", "Күрделі"].map((difficulty) => (
            <button
              key={difficulty}
              className={`filter-chip ${selectedDiff === difficulty ? "active" : ""}`}
              onClick={() => onDifficultyChange(difficulty)}
            >
              {difficulty}
            </button>
          ))}
        </div>

        <div className="lab-result-count">
          <strong>{filteredCount}</strong> / {totalCount}
        </div>
      </div>
    </div>
  );
}
