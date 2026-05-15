import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Atom,
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { id: "home", label: "Басты бет", icon: Home, path: "/" },
  { id: "theory", label: "Теория", icon: BookOpen, path: "/theory" },
  { id: "lab", label: "Виртуалды зертхана", icon: FlaskConical, path: "/labs" },
  { id: "tasks", label: "Тапсырмалар", icon: ClipboardList, path: "/tasks" },
  { id: "results", label: "Нәтижелер", icon: BarChart3, path: "/results" },
  { id: "ai", label: "AI көмекші", icon: Bot, path: "/ai" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMiniMode, setSidebarMiniMode] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const visibleNavItems = isAdmin
    ? [...navItems, { id: "admin-users", label: "Аккаунттар", icon: ShieldCheck, path: "/admin/users" }]
    : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f1ff] font-['Exo_2'] text-slate-900 max-[480px]:h-dvh">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        .sidebar-shell {
          width: 16rem;
          transition: width 0.35s ease, transform 0.35s ease;
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          flex-shrink: 0;
          border-bottom: 1px solid rgb(221, 214, 254);
          padding: 1.25rem;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .sidebar-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 2.5rem;
          width: 2.5rem;
          flex-shrink: 0;
          border-radius: 0.625rem;
          background: linear-gradient(to bottom right, rgb(139, 92, 246), rgb(99, 102, 241));
          box-shadow: 0 0 18px rgba(124, 58, 237, 0.45);
        }
        .sidebar-brand-text {
          transition: opacity 0.2s ease, width 0.2s ease, overflow 0.2s ease;
        }
        .brand-copy,
        .sidebar-footer-copy,
        .nav-label,
        .nav-arrow {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .sidebar-shell {
            width: 5.5rem;
          }
          .sidebar-brand-text {
            opacity: 0;
            width: 0;
            overflow: hidden;
          }
          .mini-label {
            opacity: 0;
            width: 0;
            overflow: hidden;
            transform: translateX(-4px);
          }
          .mini-center {
            justify-content: center;
          }
          .mini-tooltip {
            opacity: 0;
            pointer-events: none;
            transform: translateX(8px);
          }
          .mini-group:hover .mini-tooltip {
            opacity: 1;
            transform: translateX(0);
            pointer-events: auto;
            z-index: 50;
          }
        }
        @media (min-width: 1025px) {
          .sidebar-shell.mini-mode {
            width: 5.5rem;
          }
          .sidebar-shell.mini-mode .sidebar-brand-text {
            opacity: 0;
            width: 0;
            overflow: hidden;
          }
          .sidebar-shell.mini-mode .mini-label {
            opacity: 0;
            width: 0;
            overflow: hidden;
            transform: translateX(-4px);
          }
          .sidebar-shell.mini-mode .mini-center {
            justify-content: center;
          }
          .sidebar-shell.mini-mode .mini-tooltip {
            opacity: 0;
            pointer-events: none;
            transform: translateX(8px);
          }
          .sidebar-shell.mini-mode .mini-group:hover .mini-tooltip {
            opacity: 1;
            transform: translateX(0);
            pointer-events: auto;
            z-index: 50;
          }
          .desktop-toggle-btn {
            position: absolute;
            top: 1.25rem;
            right: 1rem;
            opacity: 1;
            pointer-events: auto;
          }
        }
        @media (max-width: 1024px) {
          .desktop-toggle-btn {
            display: none;
          }
        }
        @media (max-width: 767px) {
          .sidebar-shell {
            position: fixed;
            inset: 0 auto 0 0;
            z-index: 40;
            width: min(20rem, 86vw);
            transform: translateX(-100%);
          }
          .sidebar-shell.mobile-open {
            transform: translateX(0);
          }
        }
        @media (max-width: 480px) {
          .mobile-app-header {
            position: sticky;
            top: 0;
            z-index: 20;
            padding: 0.625rem 0.875rem;
          }
          .mobile-menu-button {
            min-height: 44px;
            min-width: 44px;
            justify-content: center;
            border-radius: 0.875rem;
            background: rgba(124, 58, 237, 0.12);
          }
          .sidebar-shell {
            width: min(19rem, 88vw);
          }
          .sidebar-shell nav a {
            min-height: 44px;
          }
        }
      `}</style>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="sidebar-backdrop"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar-shell ${sidebarOpen ? "mobile-open" : ""} ${sidebarMiniMode ? "mini-mode" : ""} border-r border-violet-200 bg-[linear-gradient(180deg,#f7f3ff_0%,#ebe7ff_100%)] shadow-[0_18px_42px_rgba(124,58,237,0.12)]`}
      >
        <div className="flex h-full flex-col">
          <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Atom size={18} className="text-white" />
            </div>
            <div className="sidebar-brand-text brand-copy">
              <p className="text-sm font-extrabold tracking-[0.02em] text-slate-900">AI-Physics</p>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-violet-500">LABORATORY</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Навигацияны жабу"
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-100 hover:text-slate-700 md:hidden"
            >
              <X size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSidebarMiniMode(!sidebarMiniMode)}
              aria-label={sidebarMiniMode ? "Сайдбарды ашу" : "Сайдбарды қысу"}
              className="desktop-toggle-btn flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-100 hover:text-slate-700"
            >
              {sidebarMiniMode ? <ChevronRight size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <div className="mini-label px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Навигация
            </div>
            {visibleNavItems.map(({ id, label, icon: Icon, path }) => (
              <NavLink
                key={id}
                to={path}
                end={path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `mini-group mini-center relative flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border-violet-300 bg-gradient-to-r from-violet-100 to-indigo-50 text-slate-900 shadow-[0_10px_26px_rgba(124,58,237,0.12)]"
                      : "border-transparent text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? "text-violet-600" : "text-slate-500"} />
                    <span className="nav-label mini-label whitespace-nowrap">{label}</span>
                    <ChevronRight
                      size={14}
                      className={`nav-arrow mini-label ml-auto ${isActive ? "text-violet-600 opacity-100" : "opacity-0"}`}
                    />
                    <span className="mini-tooltip absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_30px_rgba(76,29,149,0.12)] md:block lg:hidden">
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-violet-200 p-3">
            <div className="mini-group relative rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-100 to-indigo-50 p-4">
              <div className="sidebar-footer-copy mini-label">
                <p className="text-sm font-bold text-slate-900">{user?.display_name || user?.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{user?.roles?.[0] || "user"}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate("/login", { replace: true });
                    setSidebarOpen(false);
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-violet-700 transition hover:text-violet-800"
                >
                  Шығу <LogOut size={12} />
                </button>
              </div>
              <div className="mini-tooltip absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_30px_rgba(76,29,149,0.12)] md:block lg:hidden">
                AI Көмекші
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="mobile-app-header flex items-center gap-2.5 border-b border-violet-200 bg-white/90 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Навигацияны ашу"
            aria-expanded={sidebarOpen}
            className="mobile-menu-button inline-flex text-violet-700 transition hover:text-violet-800"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Atom size={16} className="text-violet-600" />
            <span className="text-[13px] font-bold text-slate-900">AI-Physics Lab</span>
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
