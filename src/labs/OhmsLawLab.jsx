import { useEffect, useMemo, useRef, useState } from "react";
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
import { Gauge, Microscope, Radio, Zap } from "lucide-react";
import LabPageLayout, { ControlPanel, HintList, Panel, RangeControl, StatPill } from "../components/common/LabPageLayout";

const MICRO_WIDTH = 760;
const MICRO_HEIGHT = 210;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function circuitPoint(progress) {
  const perimeter = 2 * (520 + 180);
  let d = progress * perimeter;
  if (d < 520) return { x: 120 + d, y: 110 };
  d -= 520;
  if (d < 180) return { x: 640, y: 110 + d };
  d -= 180;
  if (d < 520) return { x: 640 - d, y: 290 };
  d -= 520;
  return { x: 120, y: 290 - d };
}

export default function OhmsLawLab() {
  const microRef = useRef(null);
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(6);
  const [zoomed, setZoomed] = useState(false);
  const [phase, setPhase] = useState(0);

  const current = useMemo(() => voltage / resistance, [resistance, voltage]);
  const electronSpeed = clamp(current * 1.5, 0.8, 8);
  const collisionRate = clamp(resistance / 20, 0.1, 1);
  const power = voltage * current;

  const chartData = useMemo(
    () =>
      Array.from({ length: 13 }, (_, index) => {
        const u = index * 2;
        return { voltage: u, current: u / resistance };
      }),
    [resistance],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase((value) => value + 0.012 * electronSpeed);
    }, 30);
    return () => window.clearInterval(timer);
  }, [electronSpeed]);

  useEffect(() => {
    if (!zoomed || !microRef.current) return;
    const canvas = microRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, MICRO_WIDTH, MICRO_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, MICRO_WIDTH, MICRO_HEIGHT);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#eff6ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MICRO_WIDTH, MICRO_HEIGHT);

    const rows = 4;
    const cols = 16;
    const jitter = resistance * 0.35;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = 50 + col * 44 + Math.sin(phase * 2 + row + col * 0.3) * jitter;
        const y = 45 + row * 38 + Math.cos(phase * 1.6 + col) * jitter * 0.3;
        ctx.beginPath();
        ctx.fillStyle = "#cbd5e1";
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.fill();

        if (((row + col + Math.floor(phase * 10)) % 5 === 0) && collisionRate > 0.35) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(239,68,68,${collisionRate})`;
          ctx.lineWidth = 2;
          ctx.arc(x, y, 17 + Math.sin(phase * 4 + col) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    const electronCount = 11;
    for (let i = 0; i < electronCount; i += 1) {
      const base = ((phase * 110 * electronSpeed + i * 68) % (MICRO_WIDTH + 60)) - 30;
      const wobble = Math.sin(phase * 6 + i) * 6;
      const lane = i % rows;
      const x = base;
      const y = 45 + lane * 38 + wobble;
      ctx.beginPath();
      ctx.fillStyle = "#2563eb";
      ctx.shadowColor = "#60a5fa";
      ctx.shadowBlur = 14;
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = "#334155";
    ctx.font = "700 13px Exo 2, sans-serif";
    ctx.fillText("Электрондар бағыты →", 28, 188);
    ctx.fillText(`Соқтығысу деңгейі: ${(collisionRate * 100).toFixed(0)}%`, 560, 188);
  }, [collisionRate, electronSpeed, phase, resistance, zoomed]);

  return (
    <LabPageLayout
      topic="Тізбек бөлігі үшін Ом заңы"
      title="Ом заңын микроскопиялық деңгейде зерттеу"
      subtitle="Кернеу артқанда электрондар қалай тезірек қозғалатынын, ал кедергі өскенде атомдармен соқтығысу неге көбейетінін бір мезетте көріңіз."
      formula="I = U / R"
      theoryId="capacitors"
      difficulty="Базалық"
      duration="20 мин"
      accent="#f43f5e"
      sidebar={
        <>
          <ControlPanel accent="#f43f5e">
            <RangeControl
              label="Кернеу U"
              valueLabel={`${voltage.toFixed(1)} В`}
              min={2}
              max={24}
              step={1}
              value={voltage}
              onChange={setVoltage}
            />
            <RangeControl
              label="Кедергі R"
              valueLabel={`${resistance.toFixed(1)} Ом`}
              min={1}
              max={20}
              step={1}
              value={resistance}
              onChange={setResistance}
            />

            <button
              type="button"
              onClick={() => setZoomed((prev) => !prev)}
              className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
            >
              {zoomed ? "Zoom режимін жабу" : "Zoom: өткізгіш ішін көру"}
            </button>
          </ControlPanel>

          <Panel title="Есептелген шамалар" icon={Gauge} accent="#f43f5e">
            <div className="grid gap-3">
              <StatPill label="Ток күші" value={`${current.toFixed(2)} A`} accent="#f43f5e" />
              <StatPill label="Қуат" value={`${power.toFixed(1)} Вт`} accent="#f43f5e" />
              <StatPill label="Электрон жылдамдығы" value={`${electronSpeed.toFixed(1)} шартты бірлік`} accent="#f43f5e" />
              <StatPill label="Соқтығысу жиілігі" value={`${(collisionRate * 100).toFixed(0)}%`} accent="#f43f5e" />
            </div>
          </Panel>

          <Panel title="Бақылау" icon={Microscope} accent="#f43f5e">
            <HintList
              accent="#f43f5e"
              items={[
                "U артқанда I өседі, сондықтан электрондар жылдамырақ жылжиды.",
                "R артқанда атомдармен соқтығысу көбейіп, қозғалыс тежеледі.",
                "I–U графигінің көлбеулігі кедергіге тәуелді: R аз болса, сызық тігірек болады.",
              ]}
            />
          </Panel>
        </>
      }
    >
      <Panel title="Тізбектің макро көрінісі" icon={Radio} accent="#f43f5e">
        <svg viewBox="0 0 760 370" className="w-full rounded-[24px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f4_100%)]">
          <rect x="0" y="0" width="760" height="370" fill="transparent" />

          <path
            d="M120 110 H640 V290 H120 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <rect x="82" y="140" width="38" height="120" rx="14" fill="#475569" />
          <rect x="98" y="125" width="6" height="150" rx="4" fill="#e2e8f0" />
          <text x="55" y="312" fill="#475569" fontSize="14" fontWeight="700">Ток көзі</text>

          <circle cx="380" cy="110" r="38" fill="#fff" stroke="#f43f5e" strokeWidth="4" />
          <text x="352" y="116" fill="#f43f5e" fontSize="18" fontWeight="800">A</text>
          <text x="333" y="160" fill="#475569" fontSize="14" fontWeight="700">Амперметр</text>

          <rect x="300" y="270" width="160" height="40" rx="18" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="3" />
          <path d="M318 290 L334 278 L350 302 L366 278 L382 302 L398 278 L414 302 L430 278" fill="none" stroke="#be123c" strokeWidth="4" />
          <text x="334" y="336" fill="#475569" fontSize="14" fontWeight="700">Резистор · {resistance.toFixed(1)} Ом</text>

          {[...Array(9)].map((_, index) => {
            const point = circuitPoint((phase * electronSpeed * 0.08 + index / 9) % 1);
            return <circle key={index} cx={point.x} cy={point.y} r="6" fill="#2563eb" />;
          })}

          <text x="565" y="95" fill="#0f172a" fontSize="16" fontWeight="800">U = {voltage.toFixed(1)} В</text>
          <text x="565" y="118" fill="#0f172a" fontSize="16" fontWeight="800">I = {current.toFixed(2)} A</text>
        </svg>
      </Panel>

      {zoomed && (
        <Panel title="Zoom: өткізгіш ішіндегі қозғалыс" icon={Microscope} accent="#f43f5e">
          <canvas
            ref={microRef}
            width={MICRO_WIDTH}
            height={MICRO_HEIGHT}
            className="w-full rounded-[24px] border border-rose-100 bg-white"
          />
        </Panel>
      )}

      <Panel title="I(U) графигі" icon={Zap} accent="#f43f5e">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="#fecdd3" />
              <XAxis dataKey="voltage" tick={{ fill: "#64748b", fontSize: 12 }} unit="В" />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} unit="A" />
              <Tooltip />
              <Line type="monotone" dataKey="current" stroke="#f43f5e" strokeWidth={3} dot={false} />
              <ReferenceDot x={voltage} y={current} r={8} fill="#2563eb" stroke="#ffffff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Көк нүкте ағымдағы жұмыс нүктесін көрсетеді. Кедергі өзгерсе, бүкіл сызықтың көлбеулігі де өзгереді.
        </p>
      </Panel>
    </LabPageLayout>
  );
}
