import { useState } from "react";
import { Atom, Lock, LogIn, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.login, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1ff] px-5 py-8 font-['Exo_2'] text-slate-900 max-[480px]:items-start max-[480px]:px-4 max-[480px]:py-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      <form
        onSubmit={submit}
        className="w-full max-w-[420px] rounded-[28px] border border-violet-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f4ff_100%)] p-7 shadow-[0_26px_80px_rgba(76,29,149,0.12)] max-[480px]:rounded-2xl max-[480px]:p-5"
      >
        <div className="mb-7 flex items-center gap-4 max-[480px]:mb-6 max-[480px]:gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-[0_0_24px_rgba(124,58,237,0.45)]">
            <Atom size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-[-0.02em] text-slate-950 max-[480px]:text-xl">AI-Physics Lab</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Жүйеге кіру</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Логин</span>
            <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 focus-within:border-violet-400/45">
              <UserRound size={18} className="text-violet-500" />
              <input
                value={form.login}
                onChange={(event) => setForm((prev) => ({ ...prev, login: event.target.value }))}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="admin немесе берілген логин"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Пароль</span>
            <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 focus-within:border-violet-400/45">
              <Lock size={18} className="text-violet-500" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Пароль"
                autoComplete="current-password"
              />
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !form.login.trim() || !form.password}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-extrabold text-white shadow-[0_0_24px_rgba(124,58,237,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <LogIn size={17} />
          {loading ? "Тексерілуде..." : "Кіру"}
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Аккаунтты тек админ ашады. Логин мен парольді әкімшіден алыңыз.
        </p>
      </form>
    </div>
  );
}
