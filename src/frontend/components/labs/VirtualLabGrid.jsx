import { BookOpen } from "lucide-react";
import VirtualLabCard from "./VirtualLabCard";

export default function VirtualLabGrid({
  experiments,
  hoveredId,
  onHover,
  onLeave,
  onOpenExperiment,
}) {
  if (experiments.length === 0) {
    return (
      <div className="lab-empty-state">
        <BookOpen size={40} color="#d1d5db" className="lab-empty-icon" />
        <p className="lab-empty-title">Тәжірибелер табылмады</p>
        <p className="lab-empty-text">Іздеу сұрауын өзгертіп көріңіз</p>
      </div>
    );
  }

  return (
    <div className="grid-area">
      {experiments.map((experiment) => (
        <VirtualLabCard
          key={experiment.id}
          experiment={experiment}
          hoveredId={hoveredId}
          onHover={onHover}
          onLeave={onLeave}
          onOpenExperiment={onOpenExperiment}
        />
      ))}
    </div>
  );
}
