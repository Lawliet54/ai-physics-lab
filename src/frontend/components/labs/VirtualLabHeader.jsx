import { FlaskConical } from "lucide-react";

export default function VirtualLabHeader({ totalCount }) {
  return (
    <div className="lab-page-header">
      <div className="lab-shell">
        <div className="lab-header-eyebrow">
          <FlaskConical size={20} color="#a78bfa" />
          <span className="lab-header-label">Виртуалды зертхана</span>
        </div>
        <h1 className="lab-header-title">Тәжірибелер тізімі</h1>
        <p className="lab-header-subtitle">
          Электр және магнетизм бойынша {totalCount} интерактивті тәжірибе
        </p>
      </div>
    </div>
  );
}
