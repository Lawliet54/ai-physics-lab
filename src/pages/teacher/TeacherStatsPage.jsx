import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import { Award, Clock, GraduationCap, RefreshCcw } from "lucide-react";

export default function TeacherStatsPage() {
  const { user, isTeacher } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewState, setReviewState] = useState({});

  const load = async () => {
    if (!user || !isTeacher) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/teacher/task-stats");
      setRows(data || []);
    } catch (e) {
      setError(e?.message || "Жүктеу сәтсіз болды");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isTeacher]);

  const totals = useMemo(() => {
    const completed = rows.reduce((acc, r) => acc + (r.completed_tasks || 0), 0);
    const inProgress = rows.reduce((acc, r) => acc + (r.in_progress_tasks || 0), 0);
    const points = rows.reduce((acc, r) => acc + (r.earned_points || 0), 0);
    return { completed, inProgress, points, students: rows.length };
  }, [rows]);

  const setDraftReview = (attemptId, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [attemptId]: {
        ...(prev[attemptId] || {}),
        [field]: value,
      },
    }));
  };

  const submitReview = async (attemptId) => {
    const draft = reviewState[attemptId] || {};
    if (!draft.score) return;
    await apiRequest(`/teacher/task-attempts/${attemptId}/review`, {
      method: "POST",
      body: JSON.stringify({
        score: Number(draft.score),
        feedback: draft.feedback || "",
      }),
    });
    await load();
  };

  if (!user) {
    return <div className="p-6 text-slate-700">Кіру қажет.</div>;
  }

  if (!isTeacher) {
    return <div className="p-6 text-slate-700">Бұл бет мұғалімге ғана қолжетімді.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f1ff] text-slate-900">
      <div className="border-b border-violet-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-6 py-7 max-[480px]:px-4 max-[480px]:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Мұғалім панелі</div>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Тапсырма статистикасы</h1>
              <p className="mt-2 text-sm text-slate-600">Оқушының қанша тапсырма орындағаны және соңғы өзгерістер (DB арқылы).</p>
            </div>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
            >
              <RefreshCcw size={14} />
              Жаңарту
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="app-card p-4" style={{ "--app-card-accent": "#7c3aed" }}>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><GraduationCap size={16} /> Оқушы</div>
              <div className="mt-2 text-3xl font-black text-slate-950">{totals.students}</div>
            </div>
            <div className="app-card p-4" style={{ "--app-card-accent": "#10b981" }}>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Clock size={16} /> Аяқталды</div>
              <div className="mt-2 text-3xl font-black text-slate-950">{totals.completed}</div>
            </div>
            <div className="app-card p-4" style={{ "--app-card-accent": "#f59e0b" }}>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Clock size={16} /> Орындалуда</div>
              <div className="mt-2 text-3xl font-black text-slate-950">{totals.inProgress}</div>
            </div>
            <div className="app-card p-4" style={{ "--app-card-accent": "#a78bfa" }}>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Award size={16} /> Ұпай</div>
              <div className="mt-2 text-3xl font-black text-slate-950">{totals.points}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 max-[480px]:px-4">
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="app-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50 px-5 py-4">
            <div className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Оқушылар</div>
            <div className="text-sm text-slate-600">{loading ? "Жүктелуде..." : `${rows.length} жазба`}</div>
          </div>
          <div className="divide-y divide-violet-100">
            {rows.map((r) => (
              <div key={r.user_id} className="px-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{r.display_name || r.username}</div>
                    <div className="text-xs text-slate-500">@{r.username}</div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-emerald-500/12 px-3 py-1 font-semibold text-emerald-700">Аяқталды: {r.completed_tasks}</span>
                    <span className="rounded-full bg-amber-500/12 px-3 py-1 font-semibold text-amber-700">Орындалуда: {r.in_progress_tasks}</span>
                    <span className="rounded-full bg-violet-500/12 px-3 py-1 font-semibold text-violet-700">Ұпай: {r.earned_points}</span>
                  </div>
                </div>

                {r.attempts?.length ? (
                  <div className="mt-3 grid gap-3">
                    {r.attempts.map((a) => (
                      <div key={a.id} className="rounded-2xl border border-violet-100 bg-white px-4 py-4 text-sm text-slate-700">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">{a.task_code}: {a.task_title}</div>
                            <div className="mt-1 text-xs text-slate-500">{a.topic_title || "Тақырып жоқ"} · {new Date(a.created_at).toLocaleString()}</div>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{a.status}</span>
                        </div>
                        <div className="mt-3 grid gap-3 lg:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Оқушының шығару жолы</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{a.response_snapshot?.work || "—"}</div>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Оқушы жауабы</div>
                            <div className="mt-2 text-sm leading-7 text-slate-800">{a.response_snapshot?.answer || "—"}</div>
                            {a.reviewed_at ? (
                              <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                Баға: {a.score} / 10
                                {a.feedback_summary ? <div className="mt-1 text-slate-700">{a.feedback_summary}</div> : null}
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={reviewState[a.id]?.score || ""}
                                  onChange={(event) => setDraftReview(a.id, "score", event.target.value)}
                                  placeholder="1-10 балл"
                                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
                                />
                                <textarea
                                  value={reviewState[a.id]?.feedback || ""}
                                  onChange={(event) => setDraftReview(a.id, "feedback", event.target.value)}
                                  placeholder="Қысқа пікір"
                                  className="min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                                />
                                <button
                                  onClick={() => submitReview(a.id)}
                                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                  Баға қою
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {!rows.length && !loading && (
              <div className="px-5 py-10 text-center text-sm text-slate-600">Қазір студенттер жоқ немесе әрекет жазбалары жоқ.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
