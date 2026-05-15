import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Info, RotateCcw, Zap } from "lucide-react";
import LabPageLayout, { ControlPanel, HintList, Panel } from "../components/common/LabPageLayout";

const COULOMB_CONSTANT = 8.99e9;
const MIN_CHARGE = -10;
const MAX_CHARGE = 10;
const MIN_DISTANCE_CM = 1;
const MAX_DISTANCE_CM = 10;
const PX_PER_CM = 38;
const RULER_WIDTH = MAX_DISTANCE_CM * PX_PER_CM;
const CHARGE_Y = 118;
const SVG_WIDTH = 860;
const SVG_HEIGHT = 336;

const MEDIUMS = {
  air: { label: "Ауа", k: 1, note: "K = 1.00" },
  glass: { label: "Шыны", k: 5, note: "K ≈ 5.00" },
  water: { label: "Су", k: 80, note: "K ≈ 80.00" },
};

const QUICK_VALUES = [-10, -5, -1, 0, 1, 5, 10];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeCoulombForce(distanceCm, q1, q2, dielectricK) {
  const distanceM = Math.max(distanceCm, MIN_DISTANCE_CM) / 100;
  const charge1 = q1 * 1e-6;
  const charge2 = q2 * 1e-6;
  return (COULOMB_CONSTANT * Math.abs(charge1 * charge2)) / (dielectricK * distanceM * distanceM);
}

function RangeInput({ label, value, onChange, color = "violet" }) {
  const accentClass = color === "red" ? "accent-red-500" : "accent-blue-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <div className="min-w-[88px] rounded-xl bg-slate-50 px-3 py-1.5 text-right text-[1.1rem] font-black text-slate-900">
          {value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
        </div>
      </div>

      <input
        type="range"
        min={MIN_CHARGE}
        max={MAX_CHARGE}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 ${accentClass}`}
      />

      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>{MIN_CHARGE.toFixed(2)} μC</span>
        <span>{MAX_CHARGE.toFixed(2)} μC</span>
      </div>

      <div className="flex flex-nowrap gap-1.5 overflow-hidden">
        {QUICK_VALUES.map((quickValue) => (
          <button
            key={quickValue}
            type="button"
            onClick={() => onChange(quickValue)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[13px] font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
          >
            {quickValue > 0 ? `+${quickValue}` : quickValue}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArrowLine({ startX, endX, y, color, label }) {
  const midX = (startX + endX) / 2;
  const direction = endX > startX ? 1 : -1;
  const tipX = endX;
  const baseX = endX - direction * 15;

  return (
    <>
      <line x1={startX} y1={y} x2={endX} y2={y} stroke={color} strokeWidth="5" strokeLinecap="round" />
      <polygon points={`${tipX},${y} ${baseX},${y - 9} ${baseX},${y + 9}`} fill={color} />
      <text x={midX} y={y - 18} textAnchor="middle" fill={color} fontSize="22" fontWeight="800">
        {label}
      </text>
    </>
  );
}

export default function CoulombsLawLab() {
  const simulationRef = useRef(null);
  const timersRef = useRef([]);
  const animationFrameRef = useRef(null);
  const motionStateRef = useRef({
    leftPos: 0,
    rightPos: 0,
    leftVel: 0,
    rightVel: 0,
    lastTime: null,
    targetLeft: 0,
    targetRight: 0,
    leftMass: 1,
    rightMass: 1,
    elapsed: 0,
  });
  const [q1, setQ1] = useState(2);
  const [q2, setQ2] = useState(-1.2);
  const [distanceCm, setDistanceCm] = useState(6.4);
  const [medium, setMedium] = useState("air");
  const [gridEnabled, setGridEnabled] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [started, setStarted] = useState(false);
  const [experimentPhase, setExperimentPhase] = useState("idle");
  const [experimentNote, setExperimentNote] = useState("");
  const [chargeOffsets, setChargeOffsets] = useState({ left: 0, right: 0 });

  const mediumInfo = MEDIUMS[medium];

  const forceN = useMemo(() => {
    return computeCoulombForce(distanceCm, q1, q2, mediumInfo.k);
  }, [distanceCm, mediumInfo.k, q1, q2]);

  const distancePx = distanceCm * PX_PER_CM;
  const q1X = SVG_WIDTH / 2 - distancePx / 2;
  const q2X = q1X + distancePx;
  const oppositeCharges = q1 * q2 < 0;
  const rulerStartX = SVG_WIDTH / 2 - RULER_WIDTH / 2;
  const q1Positive = q1 >= 0;
  const q2Positive = q2 >= 0;
  const displayQ1X = q1X + chargeOffsets.left;
  const displayQ2X = q2X + chargeOffsets.right;
  const displayedDistanceCm = Math.max(MIN_DISTANCE_CM, Math.abs(displayQ2X - displayQ1X) / PX_PER_CM);
  const displayedForceN = computeCoulombForce(displayedDistanceCm, q1, q2, mediumInfo.k);
  const arrowLength = clamp(86 + Math.log10(displayedForceN + 1) * 42, 96, 180);
  const displayDistanceLabelX = (displayQ1X + displayQ2X) / 2;
  const showForceHighlight = experimentPhase === "calculation" || experimentPhase === "motion" || experimentPhase === "complete";
  const phaseLabel = {
    idle: "Дайын",
    direction: "1-қадам: күш бағыты",
    calculation: "2-қадам: күшті есептеу",
    motion: "3-қадам: қозғалыс",
    complete: "Қорытынды",
  }[experimentPhase];
  const compactPanelClass = "[&>div:first-child]:px-4 [&>div:first-child]:py-3 [&>div:last-child]:p-3";

  const clearExperimentTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const stopMotionAnimation = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    motionStateRef.current.lastTime = null;
  };

  const resetMotionState = () => {
    stopMotionAnimation();
    motionStateRef.current = {
      leftPos: 0,
      rightPos: 0,
      leftVel: 0,
      rightVel: 0,
      lastTime: null,
      targetLeft: 0,
      targetRight: 0,
      leftMass: 1,
      rightMass: 1,
      elapsed: 0,
    };
    setChargeOffsets({ left: 0, right: 0 });
  };

  const runChargeMotion = (leftTarget, rightTarget, leftMass, rightMass) => {
    stopMotionAnimation();
    motionStateRef.current = {
      leftPos: 0,
      rightPos: 0,
      leftVel: 0,
      rightVel: 0,
      lastTime: null,
      targetLeft: leftTarget,
      targetRight: rightTarget,
      leftMass,
      rightMass,
      elapsed: 0,
    };

    const step = (time) => {
      const state = motionStateRef.current;
      const dt = state.lastTime ? Math.min((time - state.lastTime) / 1000, 0.03) : 1 / 60;
      state.lastTime = time;
      state.elapsed += dt;

      const currentQ1X = q1X + state.leftPos;
      const currentQ2X = q2X + state.rightPos;
      const currentDistanceCm = Math.max(MIN_DISTANCE_CM, Math.abs(currentQ2X - currentQ1X) / PX_PER_CM);
      const currentForce = computeCoulombForce(currentDistanceCm, q1, q2, mediumInfo.k);
      const forceScale = clamp(currentForce * 0.055, 0.25, 8.5);
      const damping = 4.8;
      const centerPull = 1.4;
      const leftDirection = oppositeCharges ? 1 : -1;
      const rightDirection = oppositeCharges ? -1 : 1;

      const leftAcceleration = (leftDirection * forceScale - state.leftVel * damping - state.leftPos * centerPull) / state.leftMass;
      const rightAcceleration = (rightDirection * forceScale - state.rightVel * damping - state.rightPos * centerPull) / state.rightMass;
      state.leftVel += leftAcceleration * dt;
      state.rightVel += rightAcceleration * dt;
      state.leftPos += state.leftVel * dt;
      state.rightPos += state.rightVel * dt;

      const minGapPx = MIN_DISTANCE_CM * PX_PER_CM;
      const currentGapPx = (q2X + state.rightPos) - (q1X + state.leftPos);

      if (oppositeCharges && currentGapPx < minGapPx) {
        const overlap = minGapPx - currentGapPx;
        state.leftPos -= overlap / 2;
        state.rightPos += overlap / 2;
        state.leftVel *= 0.25;
        state.rightVel *= 0.25;
      }

      const leftBoundary = -(q1X - 50);
      const rightBoundary = SVG_WIDTH - 50 - q2X;
      state.leftPos = clamp(state.leftPos, leftBoundary, q2X - q1X - minGapPx);
      state.rightPos = clamp(state.rightPos, -(q2X - q1X - minGapPx), rightBoundary);

      setChargeOffsets({
        left: state.leftPos,
        right: state.rightPos,
      });

      const settled =
        state.elapsed > 3.8 &&
        Math.abs(state.leftVel) < 0.12 &&
        Math.abs(state.rightVel) < 0.12;

      if (settled) {
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!dragging) return undefined;

    const handleMove = (event) => {
      event.preventDefault();
      if (!simulationRef.current) return;
      const rect = simulationRef.current.getBoundingClientRect();
      const localX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
      const nextDistance = clamp((Math.abs(localX - SVG_WIDTH / 2) * 2) / PX_PER_CM, MIN_DISTANCE_CM, MAX_DISTANCE_CM);
      setDistanceCm(Number(nextDistance.toFixed(2)));
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging]);

  useEffect(() => () => {
    clearExperimentTimers();
    stopMotionAnimation();
  }, []);

  const resetExperiment = () => {
    clearExperimentTimers();
    resetMotionState();
    setQ1(2);
    setQ2(-1.2);
    setDistanceCm(6.4);
    setMedium("air");
    setGridEnabled(true);
    setStarted(false);
    setExperimentPhase("idle");
    setExperimentNote("");
  };

  const startExperiment = () => {
    clearExperimentTimers();
    resetMotionState();
    setStarted(true);
    setExperimentPhase("direction");
    setExperimentNote("Алдымен күштің қай жаққа бағытталғанын бақылаймыз.");

    timersRef.current.push(window.setTimeout(() => {
      setExperimentPhase("calculation");
      setExperimentNote(`Қазір Кулон заңы бойынша күш есептеледі: F = ${forceN.toFixed(2)} Н.`);
    }, 1300));

    timersRef.current.push(window.setTimeout(() => {
      setExperimentPhase("motion");
      const leftMass = clamp(1.1 + Math.abs(q1) * 0.12, 1.1, 2.4);
      const rightMass = clamp(1.1 + Math.abs(q2) * 0.12, 1.1, 2.4);
      runChargeMotion(0, 0, leftMass, rightMass);
      setExperimentNote(
        oppositeCharges
          ? "Зарядтар бір-біріне біртіндеп жақындайды. Жеңілірек заряд сәл жылдамырақ қозғалады."
          : "Зарядтар бір-бірінен біртіндеп алыстайды. Жеңілірек заряд сәл жылдамырақ қозғалады."
      );
    }, 2600));

    timersRef.current.push(window.setTimeout(() => {
      setExperimentPhase("complete");
      setExperimentNote(
        oppositeCharges
          ? "Қорытынды: әртүрлі таңбалы зарядтар тартылады, ал арақашықтық азайса күш артады."
          : "Қорытынды: бірдей таңбалы зарядтар тебіледі, ал арақашықтық азайса күш артады."
      );
    }, 4300));
  };

  return (
    <LabPageLayout
      topic="Электростатика"
      title="Кулон заңын тәжірибелік модельдеу"
      subtitle="Екі зарядтың шамасын, ортаны және арақашықтықты өзгертіп, Кулон заңындағы күштің қалай өзгеретінін бақылаңыз."
      formula="F = k|q₁q₂| / r²"
      theoryId="electric-charge"
      formulaContent={
        <div className="flex items-center justify-center gap-1.5 text-[1.1rem] font-black italic tracking-[-0.03em] text-amber-500 md:text-[1.2rem]">
          <span>F</span>
          <span>= k</span>
          <span className="text-amber-500">·</span>
          <span className="inline-flex flex-col items-center leading-none text-slate-900">
            <span className="border-b-2 border-amber-400 px-1.5 pb-0.5">
              <span>q₁</span>
              <span className="px-0.5 text-amber-500">·</span>
              <span>q₂</span>
            </span>
            <span className="pt-0.5">r²</span>
          </span>
        </div>
      }
      difficulty="Базалық"
      accent="#f59e0b"
      sidebar={
        <ControlPanel accent="#f59e0b" className={compactPanelClass}>
          <RangeInput label="Заряд q₁" value={q1} onChange={(value) => setQ1(clamp(value, MIN_CHARGE, MAX_CHARGE))} color="red" />
          <RangeInput label="Заряд q₂" value={q2} onChange={(value) => setQ2(clamp(value, MIN_CHARGE, MAX_CHARGE))} color="blue" />

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">Диэлектрлік орта</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                K = {mediumInfo.k.toFixed(2)}
              </span>
            </div>
            <div className="inline-flex w-full items-stretch gap-2">
              {Object.entries(MEDIUMS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMedium(key)}
                  className={`min-w-0 flex-1 rounded-2xl border px-3 py-3 text-left transition ${
                    medium === key
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-500">{item.note}</div>
                  </button>
                ))}
              </div>
            </div>

          <button
            type="button"
            onClick={resetExperiment}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
          >
            <RotateCcw size={16} />
            Қалпына келтіру
          </button>
        </ControlPanel>
      }
    >
      <Panel title="Интерактивті симуляция" icon={ArrowRightLeft} accent="#f59e0b" className={compactPanelClass}>
        <div
          ref={simulationRef}
          className="relative touch-none overflow-hidden rounded-[28px] border border-violet-100 bg-white max-[480px]:rounded-2xl"
        >
          <div className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-bold text-white shadow-[0_10px_20px_rgba(15,23,42,0.15)]">
            {phaseLabel}
          </div>

          <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="h-auto w-full touch-none select-none">
            <defs>
              <radialGradient id="charge-red" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffb6b6" />
                <stop offset="50%" stopColor="#ff3b30" />
                <stop offset="100%" stopColor="#d90404" />
              </radialGradient>
              <radialGradient id="charge-blue" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#bdd8ff" />
                <stop offset="50%" stopColor="#2f7cff" />
                <stop offset="100%" stopColor="#0a56d8" />
              </radialGradient>
            </defs>

            <g opacity="0.1">
              {gridEnabled
                ? Array.from({ length: 20 }).map((_, index) => (
                    <line key={`v-${index}`} x1={50 + index * 40} y1="0" x2={50 + index * 40} y2={SVG_HEIGHT} stroke="#8b5cf6" />
                  ))
                : null}
              {gridEnabled
                ? Array.from({ length: 15 }).map((_, index) => (
                    <line key={`h-${index}`} x1="0" y1={40 + index * 32} x2={SVG_WIDTH} y2={40 + index * 32} stroke="#8b5cf6" />
                  ))
                : null}
            </g>

            <line x1={displayQ1X} y1="164" x2={displayQ1X} y2="208" stroke={q1Positive ? "#f87171" : "#60a5fa"} strokeDasharray="5 4" strokeWidth="2" opacity="0.55" />
            <line x1={displayQ2X} y1="164" x2={displayQ2X} y2="208" stroke={q2Positive ? "#f87171" : "#60a5fa"} strokeDasharray="5 4" strokeWidth="2" opacity="0.55" />

            <motion.g animate={{ y: started ? [0, -2, 0] : 0 }} transition={{ repeat: Infinity, duration: 2.6 }}>
              <motion.g
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragging(true);
                }}
                style={{ cursor: "grab" }}
              >
              <circle cx={displayQ1X} cy={CHARGE_Y} r="34" fill={q1Positive ? "url(#charge-red)" : "url(#charge-blue)"} stroke="#ffffff" strokeWidth="4" />
              <circle cx={displayQ1X} cy={CHARGE_Y} r="40" fill="none" stroke={q1Positive ? "#ef4444" : "#3b82f6"} strokeDasharray="6 4" strokeWidth="2" opacity="0.45" />
              <text x={displayQ1X} y={CHARGE_Y + 10} textAnchor="middle" fill="#ffffff" fontSize="42" fontWeight="900">{q1Positive ? "+" : "−"}</text>
              </motion.g>
            </motion.g>

            <motion.g
              animate={{ y: started ? [0, 2, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 2.4 }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDragging(true);
              }}
              style={{ cursor: "grab" }}
            >
              <circle cx={displayQ2X} cy={CHARGE_Y} r="34" fill={q2Positive ? "url(#charge-red)" : "url(#charge-blue)"} stroke="#ffffff" strokeWidth="4" />
              <circle cx={displayQ2X} cy={CHARGE_Y} r="40" fill="none" stroke={q2Positive ? "#ef4444" : "#3b82f6"} strokeDasharray="6 4" strokeWidth="2" opacity="0.45" />
              <text x={displayQ2X} y={CHARGE_Y + 9} textAnchor="middle" fill="#ffffff" fontSize="42" fontWeight="900">{q2Positive ? "+" : "−"}</text>
            </motion.g>

            {oppositeCharges ? (
              <>
                <ArrowLine startX={displayQ1X + 44} endX={displayQ1X + 44 + arrowLength} y={CHARGE_Y} color={q1Positive ? "#ef4444" : "#2563eb"} label="F₁" />
                <ArrowLine startX={displayQ2X - 44} endX={displayQ2X - 44 - arrowLength} y={CHARGE_Y} color={q2Positive ? "#ef4444" : "#2563eb"} label="F₂" />
              </>
            ) : (
              <>
                <ArrowLine startX={displayQ1X - 44} endX={displayQ1X - 44 - arrowLength} y={CHARGE_Y} color={q1Positive ? "#ef4444" : "#2563eb"} label="F₁" />
                <ArrowLine startX={displayQ2X + 44} endX={displayQ2X + 44 + arrowLength} y={CHARGE_Y} color={q2Positive ? "#ef4444" : "#2563eb"} label="F₂" />
              </>
            )}

            <line x1={rulerStartX} y1="208" x2={rulerStartX + MAX_DISTANCE_CM * PX_PER_CM} y2="208" stroke="#1e293b" strokeWidth="3" />
            {Array.from({ length: 51 }).map((_, index) => {
              const x = rulerStartX + index * (PX_PER_CM / 5);
              const major = index % 5 === 0;
              return (
                <line
                  key={index}
                  x1={x}
                  y1={208}
                  x2={x}
                  y2={208 + (major ? 15 : 8)}
                  stroke="#1e293b"
                  strokeWidth={major ? 2.2 : 1.1}
                />
              );
            })}

            {Array.from({ length: 11 }).map((_, index) => (
              <text
                key={`label-${index}`}
                x={rulerStartX + index * PX_PER_CM}
                y="248"
                textAnchor="middle"
                fill="#1e293b"
                fontSize="13"
                fontWeight="600"
              >
                {index}
              </text>
            ))}

            <text x={rulerStartX + MAX_DISTANCE_CM * PX_PER_CM + 10} y="248" fill="#1e293b" fontSize="13" fontWeight="700">
              см
            </text>

            <foreignObject x={displayDistanceLabelX - 52} y="155" width="104" height="38">
              <div className="rounded-2xl bg-slate-900 px-3 py-1.5 text-center text-lg font-black text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
                r = {displayedDistanceCm.toFixed(2)} см
              </div>
            </foreignObject>

            <text x="430" y="278" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="700">
              Зарядтар арасындағы қашықтық (r)
            </text>
          </svg>

          <div className="border-t border-violet-100 bg-white/90 px-4 py-3 max-[480px]:px-3">
            <div className="flex flex-wrap items-center justify-between gap-3 max-[480px]:items-stretch">
              <div className={`text-sm leading-6 text-slate-600 transition ${showForceHighlight ? "rounded-xl bg-amber-50 px-3 py-1.5 text-amber-800 shadow-[0_8px_18px_rgba(245,158,11,0.15)]" : ""}`}>
                <span className="font-bold text-slate-900">Формула:</span> F = {displayedForceN.toFixed(2)} Н
              </div>
              <div className="flex flex-wrap gap-2 max-[480px]:w-full max-[480px]:grid max-[480px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setGridEnabled((prev) => !prev)}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 max-[480px]:px-3"
                >
                  {gridEnabled ? "Торды жасыру" : "Торды қосу"}
                </button>
                <button
                  type="button"
                  onClick={startExperiment}
                  className="min-h-11 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-[0_12px_24px_rgba(245,158,11,0.28)] max-[480px]:px-3"
                >
                  Тәжірибені бастау
                </button>
              </div>
            </div>
          </div>

          {experimentNote ? (
            <div className="border-t border-amber-100 bg-amber-50/70 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
              {experimentNote}
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="flex items-stretch gap-2 max-[480px]:flex-col">
        <Panel title="Формула және шамалар" icon={Info} accent="#f59e0b" className={`min-w-0 flex-1 h-full ${compactPanelClass}`}>
          <div className="inline-flex w-full items-stretch gap-2 max-[480px]:flex-col">
            <div className="min-w-0 flex-1 rounded-[18px] border border-violet-100 bg-white px-3 py-3 text-center shadow-[0_8px_20px_rgba(76,29,149,0.04)]">
              <div className="flex items-center justify-center gap-2 text-[1.7rem] font-black italic tracking-[-0.03em] text-slate-900 md:text-[2rem]">
                <span>F</span>
                <span className="text-emerald-600">= k</span>
                <span className="text-slate-900">·</span>
                <span className="inline-flex flex-col items-center leading-none">
                  <span className="border-b-2 border-slate-900 px-2 pb-1">
                    <span className="text-red-600">q₁</span>
                    <span className="px-1 text-slate-900">·</span>
                    <span className="text-red-600">q₂</span>
                  </span>
                  <span className="pt-1 text-blue-700">r²</span>
                </span>
              </div>
              <div className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500 md:text-[13px]">
                F = {(COULOMB_CONSTANT / mediumInfo.k).toExponential(2)} · ({(q1 * 1e-6).toExponential(2)} · {(q2 * 1e-6).toExponential(2)}) / {(displayedDistanceCm / 100).toFixed(3)}²
              </div>
            </div>

            <div className="min-w-0 flex-1 rounded-[18px] border border-violet-100 bg-violet-50/50 px-3 py-3 text-[13px] leading-5 text-slate-700">
              <p><span className="font-black text-slate-900">F</span> = Электростатикалық күш (Н)</p>
              <p><span className="font-black text-emerald-600">k</span> = Кулон тұрақтысы (8.99 × 10⁹ Н·м²/Кл²)</p>
              <p><span className="font-black text-red-600">q₁, q₂</span> = Зарядтар (Кл)</p>
              <p><span className="font-black text-blue-700">r</span> = Зарядтар арасындағы қашықтық (м)</p>
            </div>
          </div>
        </Panel>

        <Panel title="Нәтижелер" icon={Zap} accent="#f59e0b" className="ml-auto flex h-full w-[192px] flex-col max-[480px]:ml-0 max-[480px]:w-full [&>div:first-child]:px-4 [&>div:first-child]:py-3 [&>div:last-child]:flex-1 [&>div:last-child]:p-2">
          <div className="grid h-full gap-1.5 max-[480px]:grid-cols-3">
            <div className={`${showForceHighlight ? "rounded-2xl ring-2 ring-amber-300 ring-offset-2 ring-offset-white" : ""}`}>
              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Күш</div>
                <div className="mt-0.5 text-[0.95rem] font-black text-[#f59e0b]">{displayedForceN.toFixed(2)} Н</div>
              </div>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Қашықтық</div>
              <div className="mt-0.5 text-[0.95rem] font-black text-[#2563eb]">{displayedDistanceCm.toFixed(2)} см</div>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Орта</div>
              <div className="mt-0.5 text-[0.95rem] font-black text-[#10b981]">{mediumInfo.label}</div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Түсіндіру" icon={Info} accent="#f59e0b" className={compactPanelClass}>
        <HintList
          accent="#f59e0b"
          items={[
            "Екі заряд бір-біріне жақындаса, күш күштірек болады.",
            "Таңбалары әртүрлі болса, зарядтар тартылады. Таңбалары бірдей болса, олар бір-бірін тебеді.",
            "Орта мәні үлкен болса, зарядтардың бір-біріне әсері әлсірейді.",
          ]}
        />
      </Panel>
    </LabPageLayout>
  );
}
