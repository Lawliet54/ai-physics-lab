import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../../api/apiClient";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import katex from "katex";

function decodeUnicodeEscapes(input) {
  if (typeof input !== "string") return input;

  // Turn "\\u049B" or "\u049B" into actual characters (when the API/db double-escaped them).
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function decodeHexRun(input) {
  if (typeof input !== "string") return input;

  // Some broken payloads arrive as a run of hex codepoints like:
  // "049b043e0440044b044204049b044b" (Kazakh "қорытқы").
  // We only decode when it's a long hex run (>= 8 chars) and length is divisible by 4.
  return input.replace(/\b([0-9a-fA-F]{8,})\b/g, (match, hexRun) => {
    if (hexRun.length % 4 !== 0) return match;
    // Don't "decode" normal numbers like 1234, 2026, etc.
    if (/^\d+$/.test(hexRun) && hexRun.length <= 12) return match;

    try {
      let out = "";
      for (let i = 0; i < hexRun.length; i += 4) {
        const cp = parseInt(hexRun.slice(i, i + 4), 16);
        if (!Number.isFinite(cp)) return match;
        out += String.fromCharCode(cp);
      }
      // Guard: only accept if the decoded string contains letters (avoid turning ids into garbage).
      if (!/[A-Za-z\u0400-\u04FF]/.test(out)) return match;
      return out;
    } catch {
      return match;
    }
  });
}

function normalizeLatex(rawLatex) {
  if (typeof rawLatex !== "string") return rawLatex;
  // Order matters: decode escapes first, then decode any accidental hex-runs.
  return decodeHexRun(decodeUnicodeEscapes(rawLatex));
}

export default function TaskSolvePage() {
  const { taskCode } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("neutral");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftWork, setDraftWork] = useState("");
  const [workMode, setWorkMode] = useState("steps"); // steps | free
  const [workSteps, setWorkSteps] = useState([""]);
  const [saveState, setSaveState] = useState("saved");
  const [lastSavedPayload, setLastSavedPayload] = useState("");
  const skipAutosaveRef = useRef(true);

  const splitWorkIntoSteps = (raw) => {
    const value = (raw || "").trim();
    if (!value) return [""];

    // Split by blank lines first, otherwise by newline.
    const blocks = value.split(/\n\s*\n/g).map((part) => part.trim()).filter(Boolean);
    if (blocks.length >= 2) return blocks;

    const lines = value.split("\n").map((part) => part.trim()).filter(Boolean);
    return lines.length ? lines : [""];
  };

  const joinStepsIntoWork = (steps) => (steps || []).map((s) => (s || "").trim()).filter(Boolean).join("\n\n");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await apiRequest(`/me/tasks/${taskCode}`);
        if (cancelled) return;
        setTask(data);
        setDraftAnswer(data.draft_answer || "");
        const initialWork = data.draft_work || "";
        setDraftWork(initialWork);
        setWorkSteps(splitWorkIntoSteps(initialWork));
        setMessage(data.last_feedback || "");
        setMessageType(data.is_correct ? "success" : "neutral");
        setLastSavedPayload(JSON.stringify({ answer: data.draft_answer || "", work: data.draft_work || "" }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [taskCode]);

  useEffect(() => {
    if (!task) return;

    const payload = JSON.stringify({ answer: draftAnswer, work: draftWork });
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    if (payload === lastSavedPayload) return;

    setSaveState("saving");
    const timeout = setTimeout(async () => {
      try {
        await apiRequest(`/tasks/${task.id}/draft`, {
          method: "POST",
          body: JSON.stringify({ answer: draftAnswer, work: draftWork }),
        });
        setLastSavedPayload(payload);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [draftAnswer, draftWork, lastSavedPayload, task]);

  const onCheck = async () => {
    if (!task) return;
    setChecking(true);
    try {
      const data = await apiRequest(`/tasks/${task.id}/check`, {
        method: "POST",
        body: JSON.stringify({ answer: draftAnswer, work: draftWork }),
      });

      setMessage(data.message);
      setMessageType(data.correct ? "success" : "error");
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: data.correct ? "completed" : "in_progress",
              is_correct: data.correct,
              show_solution: data.show_solution,
              answer_display: data.answer_display ?? prev.answer_display,
              solution_steps: data.solution_steps ?? prev.solution_steps,
            }
          : prev,
      );
    } finally {
      setChecking(false);
    }
  };

  // Keep draftWork in sync when using step mode.
  useEffect(() => {
    if (workMode !== "steps") return;
    const merged = joinStepsIntoWork(workSteps);
    if (merged === draftWork) return;
    setDraftWork(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workSteps, workMode]);

  if (loading) {
    return <div className="min-h-screen bg-[#f5f6fb] p-6 text-slate-700">Жүктелуде...</div>;
  }

  if (!task) {
    return <div className="min-h-screen bg-[#f5f6fb] p-6 text-slate-700">Тапсырма табылмады.</div>;
  }

  const formulaLatex = task.formula_latex ? normalizeLatex(task.formula_latex) : null;
  const formulaHtml = formulaLatex
    ? katex.renderToString(formulaLatex, { throwOnError: false, displayMode: true })
    : null;
  const givenLatex = Array.isArray(task.given_latex) ? task.given_latex.filter(Boolean).map(normalizeLatex) : [];

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      <style>{`
        /* Make all math blocks consistent and more "textbook-like" (slightly smaller + tighter). */
        .math-block .katex { font-size: 0.9rem; }
        .math-block .katex-display { margin: 0; }
        .given-block .katex { font-size: 0.95rem; }
        .given-block .katex-display { margin: 0; }
      `}</style>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 max-[480px]:px-4">
          <Breadcrumbs items={[{ label: "Тапсырмалар", to: "/tasks" }, { label: task.title_kz }]} />
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{task.topic_title}</div>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">{task.title_kz}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] max-[480px]:px-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm leading-7 text-slate-800">{task.statement}</div>

          {!!task.given?.length && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-slate-950">Берілгені</h2>
              <div className="given-block mt-3 rounded-2xl bg-slate-50 p-4">
                {givenLatex.length
                  ? givenLatex.map((tex, idx) => (
                      <div
                        key={`${idx}-${tex}`}
                        className="py-1 text-slate-900"
                        dangerouslySetInnerHTML={{
                          __html: katex.renderToString(tex, { throwOnError: false, displayMode: false }),
                        }}
                      />
                    ))
                  : task.given.map((line) => (
                      <div key={line} className="text-sm leading-7 text-slate-700">
                        {line}
                      </div>
                    ))}
              </div>
            </div>
          )}

          {task.formula && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-slate-950">Формула</h2>
              <div className="math-block mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900">
                {formulaHtml ? (
                  <div
                    className="katex-wrap"
                    dangerouslySetInnerHTML={{ __html: formulaHtml }}
                  />
                ) : (
                  <div className="font-mono text-base">{task.formula}</div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-950">Шығару жолыңыз</label>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setWorkMode("steps")}
                  className={`h-9 rounded-xl px-3 text-xs font-bold transition ${
                    workMode === "steps" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Қадаммен
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode("free")}
                  className={`h-9 rounded-xl px-3 text-xs font-bold transition ${
                    workMode === "free" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Еркін мәтін
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Берілген:",
                  "Формула:",
                  "Орнына қоямыз:",
                  "Есептейміз:",
                  "Жауабы:",
                ].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => {
                      setWorkMode("steps");
                      setWorkSteps((prev) => [...prev, tpl + " "]);
                    }}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    title="Дайын қадам қосу"
                  >
                    {tpl.replace(":", "")}
                  </button>
                ))}
              </div>
            </div>

            {workMode === "steps" ? (
              <div className="mt-3 space-y-2">
                {workSteps.map((step, idx) => (
                  <div key={`${idx}`} className="flex items-start gap-2">
                    <div className="mt-2 w-8 flex-shrink-0 text-center text-xs font-extrabold text-slate-400">
                      {idx + 1}
                    </div>
                    <input
                      value={step}
                      onChange={(event) => {
                        const next = [...workSteps];
                        next[idx] = event.target.value;
                        setWorkSteps(next);
                      }}
                      placeholder={
                        idx === 0
                          ? "Мысалы: Формула: F = k|q1·q2|/r^2"
                          : "Келесі қадамды жазыңыз"
                      }
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (workSteps.length === 1) {
                          setWorkSteps([""]);
                          return;
                        }
                        setWorkSteps((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="h-11 w-11 flex-shrink-0 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-500 transition hover:bg-slate-50"
                      title="Қадамды өшіру"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setWorkSteps((prev) => [...prev, ""])}
                  className="mt-2 inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  + Қадам қосу
                </button>
              </div>
            ) : (
              <textarea
                value={draftWork}
                onChange={(event) => {
                  setDraftWork(event.target.value);
                  setWorkSteps(splitWorkIntoSteps(event.target.value));
                }}
                placeholder="Есепті өзіңіз қалай шығарғаныңызды осы жерге жазыңыз"
                className="mt-3 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            )}

            <label className="mt-5 block text-sm font-bold text-slate-950">Жауап</label>
            <input
              value={draftAnswer}
              onChange={(event) => setDraftAnswer(event.target.value)}
              placeholder="Мысалы: 0,8"
              className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />

            <button
              onClick={onCheck}
              disabled={checking || !draftAnswer.trim()}
              className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-[#0f172a] px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? "Тексерілуде..." : "Жауапты тексеру"}
            </button>

            {message ? (
              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : messageType === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {message}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-10 max-[480px]:px-4">
        {task.show_solution ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">Дұрыс шешім</div>
            <div className="mt-4 text-lg font-black text-slate-950">{task.answer_display}</div>
            <div className="mt-4 space-y-3">
              {task.solution_steps.map((step, index) => (
                <div key={`${index}-${step}`} className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-800">
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {task.teacher_score ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="text-sm font-bold text-amber-700">Мұғалім бағасы: {task.teacher_score} / 10</div>
            {task.teacher_feedback ? <div className="mt-2 text-sm leading-7 text-slate-700">{task.teacher_feedback}</div> : null}
          </div>
        ) : null}

        <Link to="/tasks" className="mt-6 inline-flex text-sm font-semibold text-slate-600 hover:text-slate-900">
          Тапсырмалар тізіміне оралу
        </Link>
      </div>
    </div>
  );
}
