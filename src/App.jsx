import { useState } from "react";
import AIPhysicsLab from "../AIPhysicsLab.jsx";
import OhmsLawLab from "../OhmsLawLab.jsx";
import VirtualLabList from "../VirtualLabList.jsx";

const OHMS_EXPERIMENT_IDS = new Set([5, 8]);

export default function App() {
  const [view, setView] = useState("home");

  const openExperiment = (experiment) => {
    if (OHMS_EXPERIMENT_IDS.has(experiment.id)) {
      setView("ohms");
      return;
    }

    setView("labs");
  };

  if (view === "labs") {
    return (
      <VirtualLabList
        onBackHome={() => setView("home")}
        onOpenExperiment={openExperiment}
      />
    );
  }

  if (view === "ohms") {
    return <OhmsLawLab onBack={() => setView("labs")} />;
  }

  return <AIPhysicsLab onNavigate={setView} />;
}
