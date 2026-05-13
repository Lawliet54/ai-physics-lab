import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Cpu,
  Lightbulb,
  MoveHorizontal,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LabPageLayout, { HintList, Panel, StatPill } from "./LabPageLayout";

const EPSILON_0 = 8.854e-12;
const P_LED = 5e-9;
const MODEL_WIDTH = 820;
const MODEL_HEIGHT = 460;
const MIN_DISTANCE_MM = 0.5;
const MAX_DISTANCE_MM = 12;
const MIN_AREA_CM2 = 25;
const MAX_AREA_CM2 = 500;

const DIELECTRICS = {
  air: { label: "Ауа", epsilon: 1, color: "#cbd5e1", hint: "Ауада ε кіші, сондықтан сыйымдылық та салыстырмалы аз." },
  glass: { label: "Шыны", epsilon: 4.7, color: "#60a5fa", hint: "Шыны зарядты жақсырақ “ұстайды”, сондықтан C артады." },
  water: { label: "Су", epsilon: 80, color: "#14b8a6", hint: "Судың ε өте үлкен, сондықтан сыйымдылық күрт өседі." },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

function NumberInput({ label, value, unit, min, max, step = 0.1, onChange }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {value.toFixed(step >= 1 ? 0 : 2)} {unit}
        </span>
      </div>
      <div className="flex gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-600"
        />
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isNaN(next)) onChange(next);
            }}
            className="w-20 border-none bg-transparent text-right text-sm font-semibold text-slate-800 outline-none"
          />
          <span className="text-xs font-semibold text-slate-500">{unit}</span>
        </div>
      </div>
    </label>
  );
}

export default function CapacitanceLab() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [areaCm2, setAreaCm2] = useState(180);
  const [distanceMm, setDistanceMm] = useState(2.5);
  const [epsilon, setEpsilon] = useState(4.7);
  const [selectedDielectric, setSelectedDielectric] = useState("glass");
  const [dragHandle, setDragHandle] = useState(null);
  const [hoverHandle, setHoverHandle] = useState(null);
  const [chartMode, setChartMode] = useState("distance");
  const [observation, setObservation] = useState(null);
  const [ledState, setLedState] = useState({ startedAt: 0, durationMs: 0 });
  const [now, setNow] = useState(Date.now());

  const sideCm = Math.sqrt(areaCm2);

  // Convert user-friendly units to SI before running the physics formulas.
  const { areaM2, distanceM, capacitanceF, capacitancePf, energyJ, energyNanoJ, chargeNc, ledDurationSec } = useMemo(() => {
    const area = areaCm2 / 10000;
    const distance = distanceMm / 1000;
    const capacitance = (epsilon * EPSILON_0 * area) / distance;
    const energy = (capacitance * 12 * 12) / 2;
    const charge = capacitance * 12 * 1e9;
    const ledDuration = energy / P_LED;

    return {
      areaM2: area,
      distanceM: distance,
      capacitanceF: capacitance,
      capacitancePf: capacitance * 1e12,
      energyJ: energy,
      energyNanoJ: energy * 1e9,
      chargeNc: charge,
      ledDurationSec: ledDuration,
    };
  }, [areaCm2, distanceMm, epsilon]);

  const ledProgress = useMemo(() => {
    const end = ledState.startedAt + ledState.durationMs;
    if (end <= now || ledState.durationMs <= 0) return 0;
    const elapsed = now - ledState.startedAt;
    const tau = ledState.durationMs / 3.2;
    return Math.exp(-elapsed / tau);
  }, [ledState.durationMs, ledState.startedAt, now]);

  const dynamicFormula = useMemo(() => {
    return {
      capacitance: `C = (${epsilon.toFixed(2)} × ${EPSILON_0.toExponential(3)} × ${areaM2.toExponential(3)}) / ${distanceM.toExponential(3)} = ${capacitanceF.toExponential(3)} Ф`,
      energy: `W = (${capacitanceF.toExponential(3)} × 12²) / 2 = ${energyJ.toExponential(3)} Дж`,
      led: `t = W / P_led = ${energyJ.toExponential(3)} / ${P_LED.toExponential(1)} = ${ledDurationSec.toFixed(2)} с`,
    };
  }, [areaM2, capacitanceF, distanceM, energyJ, epsilon, ledDurationSec]);

  const chartData = useMemo(() => {
    if (chartMode === "distance") {
      return Array.from({ length: 24 }, (_, index) => {
        const d = MIN_DISTANCE_MM + index * 0.5;
        const c = (epsilon * EPSILON_0 * areaM2) / (d / 1000);
        return { axis: d, value: c * 1e12 };
      });
    }

    return Array.from({ length: 20 }, (_, index) => {
      const a = MIN_AREA_CM2 + index * 25;
      const c = (epsilon * EPSILON_0 * (a / 10000)) / distanceM;
      return { axis: a, value: c * 1e12 };
    });
  }, [areaM2, chartMode, distanceM, epsilon]);

  const announce = (text) => {
    setObservation({ id: Date.now(), text });
  };

  const applyArea = (nextValue) => {
    const next = clamp(nextValue, MIN_AREA_CM2, MAX_AREA_CM2);
    setAreaCm2(next);
    if (next > areaCm2 + 0.1) announce("Ауданы артты — көбірек заряд сияды, сондықтан сыйымдылық өседі.");
    if (next < areaCm2 - 0.1) announce("Ауданы кішірейді — заряд жиналатын бет азайды, C төмендейді.");
  };

  const applyDistance = (nextValue) => {
    const next = clamp(nextValue, MIN_DISTANCE_MM, MAX_DISTANCE_MM);
    setDistanceMm(next);
    if (next > distanceMm + 0.01) announce("Пластиналар алыстады — өріс әлсіреп, сыйымдылық азайды.");
    if (next < distanceMm - 0.01) announce("Пластиналар жақындады — өріс күшейіп, сыйымдылық артты.");
  };

  const applyEpsilon = (nextValue, selectedKey = "custom") => {
    const next = clamp(nextValue, 1, 90);
    setEpsilon(next);
    setSelectedDielectric(selectedKey);
    if (next > epsilon + 0.01) announce("Диэлектрик күшейді — өріс ішінде көбірек заряд сақталуда.");
    if (next < epsilon - 0.01) announce("ε азайды — конденсатордың заряд ұстау қабілеті төмендеді.");
  };

  useEffect(() => {
    if (!observation) return undefined;
    const timeout = window.setTimeout(() => setObservation(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [observation]);

  useEffect(() => {
    if (ledState.durationMs <= 0) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 40);
    return () => window.clearInterval(timer);
  }, [ledState.durationMs]);

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragHandle || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * MODEL_WIDTH;
      const y = ((event.clientY - rect.top) / rect.height) * MODEL_HEIGHT;

      if (dragHandle === "distance") {
        const gapPx = clamp(x - 310, 70, 230);
        applyDistance(mapRange(gapPx, 70, 230, MIN_DISTANCE_MM, MAX_DISTANCE_MM));
      }

      if (dragHandle === "area") {
        const nextHeightPx = clamp(y - 115, 120, 270);
        const nextSideCm = mapRange(nextHeightPx, 120, 270, Math.sqrt(MIN_AREA_CM2), Math.sqrt(MAX_AREA_CM2));
        applyArea(nextSideCm * nextSideCm);
      }
    };

    const stopDrag = () => setDragHandle(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragHandle, areaCm2, distanceMm, epsilon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const plateHeight = mapRange(sideCm, Math.sqrt(MIN_AREA_CM2), Math.sqrt(MAX_AREA_CM2), 120, 270);
    const gapPx = mapRange(distanceMm, MIN_DISTANCE_MM, MAX_DISTANCE_MM, 70, 230);
    const plateTop = 115;
    const leftPlateX = 250;
    const rightPlateX = leftPlateX + gapPx;
    const lineCount = clamp(Math.round(mapRange(capacitancePf, 40, 4200, 5, 18)), 5, 18);
    const chargeCount = clamp(Math.round(mapRange(chargeNc, 0.5, 45, 3, 16)), 3, 16);

    const areaHandle = { x: leftPlateX + 9, y: plateTop + plateHeight + 6, radius: 16 };
    const distanceHandle = { x: leftPlateX + gapPx / 2 + 9, y: plateTop + 56, radius: 16 };

    canvas.dataset.areaHandle = JSON.stringify(areaHandle);
    canvas.dataset.distanceHandle = JSON.stringify(distanceHandle);

    // Canvas model: plates, field lines, charge density and draggable handles.
    ctx.clearRect(0, 0, MODEL_WIDTH, MODEL_HEIGHT);
    const background = ctx.createLinearGradient(0, 0, MODEL_WIDTH, MODEL_HEIGHT);
    background.addColorStop(0, "#ffffff");
    background.addColorStop(1, "#f0fdf4");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, MODEL_WIDTH, MODEL_HEIGHT);

    ctx.fillStyle = `${DIELECTRICS[selectedDielectric]?.color || "#14b8a6"}22`;
    ctx.fillRect(leftPlateX + 18, plateTop, gapPx - 18, plateHeight);

    for (let i = 0; i < lineCount; i += 1) {
      const x = leftPlateX + 28 + (i * (gapPx - 40)) / Math.max(1, lineCount - 1);
      ctx.strokeStyle = `rgba(16,185,129,${0.25 + (i % 3) * 0.12})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, plateTop + 16);
      ctx.lineTo(x, plateTop + plateHeight - 16);
      ctx.stroke();
    }

    ctx.fillStyle = "#334155";
    ctx.fillRect(leftPlateX, plateTop, 18, plateHeight);
    ctx.fillRect(rightPlateX, plateTop, 18, plateHeight);

    for (let i = 0; i < chargeCount; i += 1) {
      const y = plateTop + 18 + (i * (plateHeight - 36)) / Math.max(1, chargeCount - 1);
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 18px Exo 2, sans-serif";
      ctx.fillText("+", leftPlateX - 26, y + 6);
      ctx.fillStyle = "#2563eb";
      ctx.fillText("−", rightPlateX + 26, y + 6);
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 16px Exo 2, sans-serif";
    ctx.fillText("Сол жақ пластина", 146, 84);
    ctx.fillText("Оң жақ пластина", 470, 84);

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftPlateX + 9, plateTop - 32);
    ctx.lineTo(rightPlateX + 9, plateTop - 32);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(leftPlateX + 9, plateTop - 38);
    ctx.lineTo(leftPlateX + 9, plateTop - 26);
    ctx.moveTo(rightPlateX + 9, plateTop - 38);
    ctx.lineTo(rightPlateX + 9, plateTop - 26);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.fillText(`d = ${distanceMm.toFixed(2)} мм`, leftPlateX + gapPx / 2 - 28, plateTop - 42);

    ctx.beginPath();
    ctx.fillStyle = hoverHandle === "area" || dragHandle === "area" ? "#10b981" : "#34d399";
    ctx.arc(areaHandle.x, areaHandle.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = hoverHandle === "distance" || dragHandle === "distance" ? "#0ea5e9" : "#38bdf8";
    ctx.arc(distanceHandle.x, distanceHandle.y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#065f46";
    ctx.fillText("A өзгерту", areaHandle.x - 44, areaHandle.y + 32);
    ctx.fillStyle = "#075985";
    ctx.fillText("d өзгерту", distanceHandle.x - 44, distanceHandle.y - 22);
  }, [areaCm2, capacitancePf, chargeNc, distanceMm, dragHandle, hoverHandle, selectedDielectric, sideCm]);

  const detectHandle = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * MODEL_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * MODEL_HEIGHT;

    const areaHandle = JSON.parse(event.currentTarget.dataset.areaHandle || "{}");
    const distanceHandle = JSON.parse(event.currentTarget.dataset.distanceHandle || "{}");

    const hitArea = Math.hypot(x - areaHandle.x, y - areaHandle.y) <= 18;
    const hitDistance = Math.hypot(x - distanceHandle.x, y - distanceHandle.y) <= 18;

    if (hitArea) return "area";
    if (hitDistance) return "distance";
    return null;
  };

  const handleMouseDown = (event) => {
    const nextHandle = detectHandle(event);
    if (nextHandle) setDragHandle(nextHandle);
  };

  const handleMouseMove = (event) => {
    const nextHandle = detectHandle(event);
    setHoverHandle(nextHandle);
  };

  const handleLedTransfer = () => {
    const durationMs = ledDurationSec * 1000;
    setNow(Date.now());
    setLedState({ startedAt: Date.now(), durationMs });
    announce("Энергия LED-ке берілді — жарық енді жинақталған W энергиясына тәуелді сөнеді.");
  };

  return (
    <LabPageLayout
      topic="Конденсаторлар"
      title="Конденсатор сыйымдылығының тәуелділігі"
      subtitle="Пластина ауданы, арақашықтық және диэлектрик өзгерген сайын C және W қалай өзгеретінін нақты сандармен және интерактивті 2D модельмен зерттеңіз."
      formula="C = εε₀S / d"
      theoryId="electric-potential"
      difficulty="Орташа"
      duration="35 мин"
      accent="#10b981"
      includeDefaultHint={false}
      sidebar={
        <>
          <Panel title="Бақылау панелі" icon={SlidersHorizontal} accent="#10b981">
            <div className="space-y-5">
              <NumberInput
                label="Пластина ауданы A"
                value={areaCm2}
                unit="см²"
                min={MIN_AREA_CM2}
                max={MAX_AREA_CM2}
                step={1}
                onChange={applyArea}
              />

              <NumberInput
                label="Арақашықтық d"
                value={distanceMm}
                unit="мм"
                min={MIN_DISTANCE_MM}
                max={MAX_DISTANCE_MM}
                step={0.1}
                onChange={applyDistance}
              />

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700">Диэлектрик және ε</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    ε = {epsilon.toFixed(2)}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  {Object.entries(DIELECTRICS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                        setSelectedDielectric(key);
                        applyEpsilon(item.epsilon, key);
                    }}
                      className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                        selectedDielectric === key
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    step={0.1}
                    value={epsilon}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isNaN(next)) applyEpsilon(next, "custom");
                    }}
                    className="w-full border-none bg-transparent text-sm font-semibold text-slate-800 outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-500">қолмен енгізу</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLedTransfer}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_22px_rgba(16,185,129,0.28)]"
              >
                Энергияны LED-ке беру
              </button>
            </div>
          </Panel>

          <Panel title="Есептеулер" icon={Cpu} accent="#10b981">
            <div className="grid gap-3">
              <StatPill label="Сыйымдылық" value={`${capacitancePf.toFixed(2)} пФ`} accent="#10b981" />
              <StatPill label="Жиналған заряд" value={`${chargeNc.toFixed(2)} нКл`} accent="#10b981" />
              <StatPill label="Энергия" value={`${energyNanoJ.toFixed(2)} нДж`} accent="#10b981" />
              <StatPill label="LED жану уақыты" value={`${ledDurationSec.toFixed(2)} с`} accent="#10b981" />
            </div>
          </Panel>

          <Panel title="Dynamic Formula" icon={Sparkles} accent="#10b981">
            <div className="space-y-3 rounded-3xl bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-300">
              <p>{dynamicFormula.capacitance}</p>
              <p>{dynamicFormula.energy}</p>
              <p>{dynamicFormula.led}</p>
            </div>
          </Panel>

          <Panel title="Не байқау керек?" icon={Lightbulb} accent="#10b981">
            <HintList
              accent="#10b981"
              items={[
                "d ешқашан 0.5 мм-ден төмен түспейді: бұл қысқа тұйықталуды болдырмау үшін қойылған шек.",
                "A 500 см²-ден аспайды: модель шынайы және басқаруға ыңғайлы болып қалады.",
                "ε өскенде және d азайғанда C күрт өседі, сондықтан LED ұзағырақ жанады.",
              ]}
            />
          </Panel>
        </>
      }
    >
      <div className="overflow-hidden">
        <Panel title="Интерактивті 2D модель" icon={MoveHorizontal} accent="#10b981">
          <div
            ref={wrapperRef}
            className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#effdf5_100%)]"
          >
            <canvas
              ref={canvasRef}
              width={MODEL_WIDTH}
              height={MODEL_HEIGHT}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverHandle(null)}
              className="w-full"
              style={{ cursor: hoverHandle ? "grab" : "default" }}
            />

            <motion.div
              className="absolute right-5 top-5 w-[220px] rounded-[28px] bg-slate-950/95 p-5 text-white shadow-[0_24px_50px_rgba(15,23,42,0.35)]"
              animate={{
                boxShadow: `0 24px 50px rgba(15,23,42,0.35), 0 0 ${10 + ledProgress * 35}px rgba(16,185,129,${0.18 + ledProgress * 0.52})`,
              }}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="h-16 w-16 rounded-full border-4 border-emerald-400"
                  animate={{
                    backgroundColor: `rgba(16,185,129,${0.12 + ledProgress * 0.48})`,
                    scale: 1 + ledProgress * 0.04,
                  }}
                />
                <div>
                  <p className="text-2xl font-black">LED</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-300">
                    {ledProgress > 0 ? "Біртіндеп сөніп тұр" : "Күту режимі"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">P_led = {P_LED.toExponential(1)} Вт</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-950">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                  animate={{ width: `${ledProgress * 100}%` }}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {observation ? (
                <motion.div
                  key={observation.id}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute bottom-5 left-5 max-w-md rounded-3xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-[0_18px_34px_rgba(16,185,129,0.12)] backdrop-blur"
                >
                  {observation.text}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Үлкейтілген handle нүктелерін ұстап көріңіз: жасыл түйме — аудан, көк түйме — арақашықтық.
          </p>
        </Panel>

        <Panel title={chartMode === "distance" ? "C(d) графигі" : "C(A) графигі"} icon={BarChart3} accent="#10b981" className="mt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChartMode("distance")}
              className={`rounded-2xl border px-4 py-2 text-sm font-bold ${
                chartMode === "distance" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              C(d)
            </button>
            <button
              type="button"
              onClick={() => setChartMode("area")}
              className={`rounded-2xl border px-4 py-2 text-sm font-bold ${
                chartMode === "area" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              C(A)
            </button>
          </div>

          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="#d1fae5" />
                <XAxis
                  dataKey="axis"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  unit={chartMode === "distance" ? " мм" : " см²"}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} unit=" пФ" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} />
                <ReferenceDot
                  x={chartMode === "distance" ? distanceMm : areaCm2}
                  y={capacitancePf}
                  r={8}
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </LabPageLayout>
  );
}
