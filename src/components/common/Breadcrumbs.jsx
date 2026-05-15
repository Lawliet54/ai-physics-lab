import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className="transition-colors hover:text-slate-300">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-violet-300" : "text-slate-500"}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={12} className="text-slate-600" />}
          </div>
        );
      })}
    </nav>
  );
}
