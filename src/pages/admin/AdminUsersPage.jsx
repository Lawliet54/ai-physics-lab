import { useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, RefreshCw, ShieldCheck, UserCog } from "lucide-react";
import { apiRequest } from "../../api/apiClient";

const roleLabels = {
  admin: "Админ",
  teacher: "Мұғалім",
  student: "Оқушы",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", username: "", role: "student" });
  const [createdPassword, setCreatedPassword] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.roles?.includes("admin")).length,
      teachers: users.filter((user) => user.roles?.includes("teacher")).length,
      students: users.filter((user) => user.roles?.includes("student")).length,
    }),
    [users],
  );

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await apiRequest("/admin/users"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    setError("");
    setCreatedPassword(null);

    try {
      const data = await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setCreatedPassword({ username: data.user.username, password: data.temporary_password });
      setForm({ name: "", username: "", role: "student" });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetPassword = async (user) => {
    setError("");
    setCreatedPassword(null);

    try {
      const data = await apiRequest(`/admin/users/${user.id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setCreatedPassword({ username: data.user.username, password: data.temporary_password });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] font-['Exo_2'] text-slate-900">
      <section className="border-b border-violet-200 bg-[linear-gradient(180deg,#faf7ff_0%,#f1eeff_100%)] px-8 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Admin panel</p>
              <h1 className="text-3xl font-black tracking-[-0.02em]">Аккаунттарды басқару</h1>
              <p className="mt-2 text-sm text-slate-600">Қолданушыларды тек админ ашады және уақытша пароль береді.</p>
            </div>
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              <RefreshCw size={15} />
              Жаңарту
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Барлығы", stats.total],
              ["Админ", stats.admins],
              ["Мұғалім", stats.teachers],
              ["Оқушы", stats.students],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-violet-200 bg-white/75 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-8 py-7 lg:grid-cols-[380px_1fr]">
        <form onSubmit={createUser} className="rounded-2xl border border-violet-200 bg-white p-5 shadow-[0_14px_34px_rgba(76,29,149,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <UserCog size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">Жаңа аккаунт</h2>
              <p className="text-xs text-slate-500">Логин бірегей болуы керек</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-400"
              placeholder="Аты-жөні"
            />
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-400"
              placeholder="Логин: student01"
            />
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-violet-400"
            >
              <option value="student">Оқушы</option>
              <option value="teacher">Мұғалім</option>
              <option value="admin">Админ</option>
            </select>
          </div>

          <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(124,58,237,0.24)]">
            <Plus size={16} />
            Аккаунт ашу
          </button>

          {createdPassword && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-extrabold text-emerald-800">
                <KeyRound size={15} />
                Берілетін деректер
              </div>
              <p className="text-slate-700">Логин: <strong>{createdPassword.username}</strong></p>
              <p className="text-slate-700">Пароль: <strong>{createdPassword.password}</strong></p>
            </div>
          )}

          {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        </form>

        <section className="rounded-2xl border border-violet-200 bg-white shadow-[0_14px_34px_rgba(76,29,149,0.08)]">
          <div className="border-b border-violet-100 px-5 py-4">
            <h2 className="text-lg font-extrabold">Қолданушылар</h2>
          </div>

          <div className="divide-y divide-violet-100">
            {loading ? (
              <div className="p-6 text-sm font-semibold text-slate-500">Жүктелуде...</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-slate-900">{user.name}</p>
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                        {roleLabels[user.roles?.[0]] || user.roles?.[0]}
                      </span>
                      {!user.is_active && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">Өшірілген</span>}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">@{user.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetPassword(user)}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
                  >
                    <ShieldCheck size={14} />
                    Пароль жаңарту
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
