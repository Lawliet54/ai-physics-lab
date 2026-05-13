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
import { useAuth } from "./AuthContext";

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
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const visibleNavItems = isAdmin
    ? [...navItems, { id: "admin-users", label: "Аккаунттар", icon: ShieldCheck, path: "/admin/users" }]
    : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0918] font-['Exo_2'] text-slate-100 max-[480px]:h-dvh">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        .sidebar-shell {
          width: 16rem;
          transition: width 0.35s ease, transform 0.35s ease;
        }
        .nav-label,
        .brand-copy,
        .sidebar-footer-copy,
        .nav-arrow {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .sidebar-shell {
            width: 5.5rem;
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
            padding: 0.75rem 1rem;
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
            min-height: 48px;
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
        className={`sidebar-shell ${sidebarOpen ? "mobile-open" : ""} border-r border-violet-500/15 bg-[linear-gradient(180deg,#141229_0%,#0d0b1c_100%)] shadow-[0_0_60px_rgba(0,0,0,0.35)]`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-violet-500/10 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-[0_0_18px_rgba(124,58,237,0.45)]">
                <Atom size={18} className="text-white" />
              </div>
              <div className="brand-copy mini-label">
                <p className="text-sm font-extrabold tracking-[0.02em] text-white">AI-Physics</p>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-violet-400">LABORATORY</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Жабу"
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-slate-200 md:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            <div className="mini-label px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Навигация
            </div>
            {visibleNavItems.map(({ id, label, icon: Icon, path }) => (
              <NavLink
                key={id}
                to={path}
                end={path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `mini-group mini-center relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-violet-400/20 bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-white shadow-[0_0_22px_rgba(124,58,237,0.18)]"
                      : "border-transparent text-slate-400 hover:border-violet-500/10 hover:bg-white/5 hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? "text-violet-300" : "text-slate-500"} />
                    <span className="nav-label mini-label whitespace-nowrap">{label}</span>
                    <ChevronRight
                      size={14}
                      className={`nav-arrow mini-label ml-auto ${isActive ? "text-violet-300 opacity-100" : "opacity-0"}`}
                    />
                    <span className="mini-tooltip absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-xl border border-violet-400/20 bg-[#161329] px-3 py-2 text-xs font-semibold text-violet-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:block lg:hidden">
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-violet-500/10 p-3">
            <div className="mini-group relative rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-indigo-500/8 p-4">
              <div className="sidebar-footer-copy mini-label">
                <p className="text-sm font-bold text-violet-200">{user?.display_name || user?.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{user?.roles?.[0] || "user"}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate("/login", { replace: true });
                    setSidebarOpen(false);
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  Шығу <LogOut size={12} />
                </button>
              </div>
              <div className="mini-tooltip absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-xl border border-violet-400/20 bg-[#161329] px-3 py-2 text-xs font-semibold text-violet-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:block lg:hidden">
                AI Көмекші
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="mobile-app-header flex items-center gap-3 border-b border-violet-500/10 bg-[#110f20] px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Навигацияны ашу"
            aria-expanded={sidebarOpen}
            className="mobile-menu-button inline-flex text-violet-300 transition hover:text-violet-200"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Atom size={16} className="text-violet-300" />
            <span className="text-sm font-bold text-white">AI-Physics Lab</span>
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
