import { ChevronRight } from "lucide-react";

export default function VirtualLabCard({
  experiment,
  hoveredId,
  onHover,
  onLeave,
  onOpenExperiment,
}) {
  const Icon = experiment.icon;
  const isHovered = hoveredId === experiment.id;
  const difficultyClassMap = {
    "Базалық": "difficulty-basic",
    "Орташа": "difficulty-medium",
    "Күрделі": "difficulty-hard",
  };

  return (
    <div
      className={`exp-card app-card app-card-hover exp-theme-${experiment.id}`}
      onMouseEnter={() => onHover(experiment.id)}
      onMouseLeave={onLeave}
      style={{
        "--app-card-accent": experiment.color,
        "--app-card-accent-soft": `${experiment.color}66`,
        "--app-card-glow": `${experiment.color}22`,
      }}
    >
      <div className="exp-card-top">
        <div className="app-card-badge">#{String(experiment.id).padStart(2, "0")}</div>
        <div className={`exp-icon-wrap${isHovered ? " is-hovered" : ""}`}>
          <Icon size={22} color={experiment.color} />
        </div>
      </div>

      <div className="exp-topic-row">
        <span className="exp-topic-badge">{experiment.topic}</span>
      </div>

      <h3 className="exp-title">{experiment.title}</h3>

      <div className="exp-meta">
        <span className={`difficulty-badge ${difficultyClassMap[experiment.difficulty]}`}>
          <span className="difficulty-dot" />
          {experiment.difficulty}
        </span>
        <span className="app-card-pill exp-duration">⏱ {experiment.duration}</span>
      </div>

      <div className="app-card-divider" />

      <button
        className={`go-btn${isHovered ? " is-hovered" : ""}`}
        onClick={() => onOpenExperiment(experiment)}
      >
        Тәжірибеге өту
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
