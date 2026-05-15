import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  labExperiments,
  labTopics,
} from "../../frontend/data/labExperiments";
import VirtualLabFilters from "../../frontend/components/labs/VirtualLabFilters";
import VirtualLabGrid from "../../frontend/components/labs/VirtualLabGrid";
import VirtualLabHeader from "../../frontend/components/labs/VirtualLabHeader";
import "../../frontend/styles/virtual-lab-list.css";

export default function VirtualLabList({
  onOpenExperiment = () => {},
}) {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Барлығы");
  const [selectedDiff, setSelectedDiff] = useState("Барлығы");
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

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

  const filtered = labExperiments.filter((experiment) => {
    const matchSearch = experiment.title.toLowerCase().includes(search.toLowerCase());
    const matchTopic = selectedTopic === "Барлығы" || experiment.topic === selectedTopic;
    const matchDiff = selectedDiff === "Барлығы" || experiment.difficulty === selectedDiff;
    return matchSearch && matchTopic && matchDiff;
  });

  return (
    <div className="virtual-lab-page">
      <VirtualLabHeader totalCount={labExperiments.length} />

      <VirtualLabFilters
        search={search}
        selectedTopic={selectedTopic}
        selectedDiff={selectedDiff}
        topics={labTopics}
        totalCount={labExperiments.length}
        filteredCount={filtered.length}
        onSearchChange={setSearch}
        onTopicChange={setSelectedTopic}
        onDifficultyChange={setSelectedDiff}
      />

      <div className="lab-content">
        <VirtualLabGrid
          experiments={filtered}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onLeave={() => setHoveredId(null)}
          onOpenExperiment={handleOpenExperiment}
        />
      </div>
    </div>
  );
}
