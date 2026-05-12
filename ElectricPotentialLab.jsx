import { useEffect, useMemo, useRef, useState } from "react";
import { Mountain, Move3D, Route, Waves } from "lucide-react";
import LabPageLayout, { ControlPanel, HintList, Panel, RangeControl, StatPill } from "./LabPageLayout";

const WIDTH = 760;
const HEIGHT = 430;
const PX_PER_CM = 16;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function potentialAt(x, y, charges) {
  return charges.reduce((sum, charge) => {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distCm = Math.max(1, distPx / PX_PER_CM);
    return sum + (900 * charge.q) / distCm;
  }, 0);
}

function interpolatePoint(p1, p2, v1, v2, level) {
  if (Math.abs(v2 - v1) < 0.0001) return p1;
  const t = (level - v1) / (v2 - v1);
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

const CASE_SEGMENTS = {
  1: [["left", "bottom"]],
  2: [["bottom", "right"]],
  3: [["left", "right"]],
  4: [["top", "right"]],
  5: [["top", "left"], ["bottom", "right"]],
  6: [["top", "bottom"]],
  7: [["top", "left"]],
  8: [["top", "left"]],
  9: [["top", "bottom"]],
  10: [["top", "right"], ["left", "bottom"]],
  11: [["top", "right"]],
  12: [["left", "right"]],
  13: [["bottom", "right"]],
  14: [["left", "bottom"]],
};

function drawContours(ctx, charges) {
  const step = 24;
  const levels = [-750, -450, -220, -120, 120, 220, 450, 750];

  ctx.save();
  ctx.lineWidth = 1.5;

  levels.forEach((level) => {
    ctx.strokeStyle = level > 0 ? "rgba(244,114,182,0.85)" : "rgba(34,211,238,0.85)";

    for (let x = 0; x < WIDTH - step; x += step) {
      for (let y = 0; y < HEIGHT - step; y += step) {
        const p0 = { x, y };
        const p1 = { x: x + step, y };
        const p2 = { x: x + step, y: y + step };
        const p3 = { x, y: y + step };

        const v0 = potentialAt(p0.x, p0.y, charges);
        const v1 = potentialAt(p1.x, p1.y, charges);
        const v2 = potentialAt(p2.x, p2.y, charges);
        const v3 = potentialAt(p3.x, p3.y, charges);

        const mask =
          (v0 > level ? 1 : 0) |
          (v1 > level ? 2 : 0) |
          (v2 > level ? 4 : 0) |
          (v3 > level ? 8 : 0);

        const segments = CASE_SEGMENTS[mask];
        if (!segments) continue;

        const edgePoints = {
          top: interpolatePoint(p0, p1, v0, v1, level),
          right: interpolatePoint(p1, p2, v1, v2, level),
          bottom: interpolatePoint(p3, p2, v3, v2, level),
          left: interpolatePoint(p0, p3, v0, v3, level),
        };

        segments.forEach(([start, end]) => {
          ctx.beginPath();
          ctx.moveTo(edgePoints[start].x, edgePoints[start].y);
          ctx.lineTo(edgePoints[end].x, edgePoints[end].y);
          ctx.stroke();
        });
      }
    }
  });

  ctx.restore();
}

export default function ElectricPotentialLab() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [charges, setCharges] = useState([
    { id: 1, x: 240, y: 210, q: 6 },
    { id: 2, x: 520, y: 210, q: -5 },
  ]);
  const [mode, setMode] = useState("inspect");
  const [selectedPoint, setSelectedPoint] = useState({ x: 380, y: 120 });
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [transportCharge, setTransportCharge] = useState(3);
  const [dragId, setDragId] = useState(null);

  const selectedPotential = useMemo(
    () => potentialAt(selectedPoint.x, selectedPoint.y, charges),
    [charges, selectedPoint.x, selectedPoint.y],
  );
  const potentialA = pointA ? potentialAt(pointA.x, pointA.y, charges) : null;
  const potentialB = pointB ? potentialAt(pointB.x, pointB.y, charges) : null;
  const deltaV = pointA && pointB ? potentialB - potentialA : null;
  const workNanoJ = deltaV !== null ? transportCharge * deltaV : null;

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragId || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * WIDTH, 26, WIDTH - 26);
      const y = clamp(((event.clientY - rect.top) / rect.height) * HEIGHT, 26, HEIGHT - 26);
      setCharges((current) => current.map((charge) => (charge.id === dragId ? { ...charge, x, y } : charge)));
    };

    const stopDrag = () => setDragId(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let x = 0; x < WIDTH; x += 16) {
      for (let y = 0; y < HEIGHT; y += 16) {
        const value = potentialAt(x + 8, y + 8, charges);
        const normalized = clamp(Math.abs(value) / 1400, 0, 1);
        const alpha = 0.06 + normalized * 0.3;
        if (value >= 0) {
          ctx.fillStyle = `rgba(244,114,182,${alpha})`;
        } else {
          ctx.fillStyle = `rgba(34,211,238,${alpha})`;
        }
        ctx.fillRect(x, y, 16, 16);
      }
    }

    drawContours(ctx, charges);

    charges.forEach((charge) => {
      const positive = charge.q > 0;
      ctx.beginPath();
      ctx.fillStyle = positive ? "#f472b6" : "#06b6d4";
      ctx.shadowColor = positive ? "#f9a8d4" : "#67e8f9";
      ctx.shadowBlur = 24;
      ctx.arc(charge.x, charge.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px Exo 2, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(positive ? "+" : "−", charge.x, charge.y);

      ctx.fillStyle = "#0f172a";
      ctx.font = "700 12px Exo 2, sans-serif";
      ctx.fillText(`${positive ? "Тау" : "Шұңқыр"} · ${charge.q} нКл`, charge.x, charge.y + 34);
    });

    const points = [
      { point: selectedPoint, label: "P", color: "#7c3aed" },
      pointA ? { point: pointA, label: "A", color: "#16a34a" } : null,
      pointB ? { point: pointB, label: "B", color: "#f97316" } : null,
    ].filter(Boolean);

    points.forEach(({ point, label, color }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(point.x - 10, point.y);
      ctx.lineTo(point.x + 10, point.y);
      ctx.moveTo(point.x, point.y - 10);
      ctx.lineTo(point.x, point.y + 10);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = "bold 13px Exo 2, sans-serif";
      ctx.fillText(label, point.x + 16, point.y - 12);
    });
  }, [charges, pointA, pointB, selectedPoint]);

  const handleCanvasAction = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;

    const hitCharge = charges.find((charge) => Math.hypot(charge.x - x, charge.y - y) < 24);
    if (hitCharge) {
      setDragId(hitCharge.id);
      return;
    }

    if (mode === "addPositive" || mode === "addNegative") {
      setCharges((current) => [
        ...current,
        { id: Date.now(), x, y, q: mode === "addPositive" ? 4 : -4 },
      ]);
      return;
    }

    setSelectedPoint({ x, y });

    if (mode === "pointA") setPointA({ x, y });
    if (mode === "pointB") setPointB({ x, y });
  };

  return (
    <LabPageLayout
      topic="Электр потенциалы"
      title="Электр потенциалының өзгерісін зерттеу"
      subtitle="Оң зарядтарды тау, теріс зарядтарды шұңқыр деп елестетіп, эквипотенциал сызықтарды, нүктедегі потенциалды және A = qU жұмысты зерттеңіз."
      formula="φ = k · Q / r"
      difficulty="Орташа"
      duration="30 мин"
      accent="#06b6d4"
      sidebar={
        <>
          <ControlPanel accent="#06b6d4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {[
                { key: "inspect", label: "Нүктені өлшеу" },
                { key: "pointA", label: "A нүктесін таңдау" },
                { key: "pointB", label: "B нүктесін таңдау" },
                { key: "addPositive", label: "+ заряд қосу" },
                { key: "addNegative", label: "− заряд қосу" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMode(item.key)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    mode === item.key
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <RangeControl
              label="Тасымалданатын заряд"
              valueLabel={`${transportCharge} нКл`}
              min={1}
              max={10}
              value={transportCharge}
              onChange={setTransportCharge}
            />

            <button
              type="button"
              onClick={() => {
                setCharges([
                  { id: 1, x: 240, y: 210, q: 6 },
                  { id: 2, x: 520, y: 210, q: -5 },
                ]);
                setPointA(null);
                setPointB(null);
              }}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700"
            >
              Бастапқы күйге қайтару
            </button>
          </ControlPanel>

          <Panel title="Есептеу нәтижесі" icon={Route} accent="#06b6d4">
            <div className="grid gap-3">
              <StatPill label="Таңдалған нүкте" value={`${selectedPotential.toFixed(1)} В`} accent="#06b6d4" />
              <StatPill label="ΔU (B − A)" value={deltaV !== null ? `${deltaV.toFixed(1)} В` : "—"} accent="#06b6d4" />
              <StatPill label="A = qU" value={workNanoJ !== null ? `${workNanoJ.toFixed(1)} нДж` : "—"} accent="#06b6d4" />
            </div>
          </Panel>

          <Panel title="Нені есте сақтаймыз?" icon={Waves} accent="#06b6d4">
            <HintList
              accent="#06b6d4"
              items={[
                "Оң заряд маңында потенциал оң болады, ал теріс заряд маңында потенциал теріс болады.",
                "Эквипотенциал сызық бойымен қозғалғанда жұмыс азаяды немесе нөлге жуықтайды.",
                "Нүкте зарядқа жақындаған сайын потенциалдың абсолют мәні артады.",
              ]}
            />
          </Panel>
        </>
      }
    >
      <Panel title="Потенциал картасы" icon={Mountain} accent="#06b6d4">
        <div ref={wrapperRef}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onMouseDown={handleCanvasAction}
            className="w-full cursor-crosshair rounded-[24px] border border-cyan-100 bg-white"
          />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Зарядтарды сүйреп жылжытыңыз немесе таңдалған режиммен кенепке шертіңіз.
        </p>
      </Panel>

      <Panel title="Неге бұл карта тауға ұқсайды?" icon={Move3D} accent="#06b6d4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-pink-50 p-4">
            <h3 className="text-sm font-bold text-pink-900">Оң заряд</h3>
            <p className="mt-2 text-sm leading-6 text-pink-950/80">
              Биік төбе сияқты: потенциал жоғарылайды.
            </p>
          </div>
          <div className="rounded-3xl bg-cyan-50 p-4">
            <h3 className="text-sm font-bold text-cyan-900">Теріс заряд</h3>
            <p className="mt-2 text-sm leading-6 text-cyan-950/80">
              Ойпат сияқты: потенциал төмендейді.
            </p>
          </div>
          <div className="rounded-3xl bg-violet-50 p-4">
            <h3 className="text-sm font-bold text-violet-900">Жұмыс</h3>
            <p className="mt-2 text-sm leading-6 text-violet-950/80">
              Заряд бір нүктеден екіншісіне өткенде потенциал айырмасы неғұрлым үлкен болса, жұмыс соғұрлым көп болады.
            </p>
          </div>
        </div>
      </Panel>
    </LabPageLayout>
  );
}
