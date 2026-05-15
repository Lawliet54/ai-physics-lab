import { useEffect, useMemo, useRef, useState } from "react";
import { Mountain, Move3D, Route, Waves } from "lucide-react";
import LabPageLayout, {
  ControlPanel,
  HintList,
  Panel,
  RangeControl,
  StatPill,
} from "../components/common/LabPageLayout";

const WIDTH = 760;
const HEIGHT = 430;
const PX_PER_CM = 16;

const INITIAL_CHARGES = [
  { id: 1, x: 240, y: 210, q: 6 },
  { id: 2, x: 520, y: 210, q: -5 },
];

const INITIAL_POINT = { x: 380, y: 120 };

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

function fieldAt(x, y, charges) {
  return charges.reduce(
    (field, charge) => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const r2 = Math.max(100, dx * dx + dy * dy);
      const r = Math.sqrt(r2);
      const strength = charge.q / r2;

      return {
        x: field.x + strength * (dx / r),
        y: field.y + strength * (dy / r),
      };
    },
    { x: 0, y: 0 },
  );
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
  5: [
    ["top", "left"],
    ["bottom", "right"],
  ],
  6: [["top", "bottom"]],
  7: [["top", "left"]],
  8: [["top", "left"]],
  9: [["top", "bottom"]],
  10: [
    ["top", "right"],
    ["left", "bottom"],
  ],
  11: [["top", "right"]],
  12: [["left", "right"]],
  13: [["bottom", "right"]],
  14: [["left", "bottom"]],
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawLabel(ctx, text, x, y, color = "#0f172a") {
  ctx.save();
  ctx.font = "700 12px Exo 2, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const paddingX = 10;
  const width = ctx.measureText(text).width + paddingX * 2;
  const height = 24;

  drawRoundedRect(ctx, x - width / 2, y - height / 2, width, height, 12);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(226,232,240,0.95)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function drawSoftBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#fff7fb");
  gradient.addColorStop(0.5, "#ffffff");
  gradient.addColorStop(1, "#ecfeff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawGrid(ctx) {
  ctx.save();
  ctx.strokeStyle = "rgba(148,163,184,0.13)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= WIDTH; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y <= HEIGHT; y += 38) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPotentialHeatMap(ctx, charges) {
  const cell = 8;

  for (let x = 0; x < WIDTH; x += cell) {
    for (let y = 0; y < HEIGHT; y += cell) {
      const value = potentialAt(x + cell / 2, y + cell / 2, charges);
      const normalized = clamp(Math.abs(value) / 1350, 0, 1);
      const alpha = 0.035 + normalized * 0.34;

      ctx.fillStyle =
        value >= 0
          ? `rgba(244,114,182,${alpha})`
          : `rgba(34,211,238,${alpha})`;

      ctx.fillRect(x, y, cell, cell);
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  charges.forEach((charge) => {
    const positive = charge.q > 0;
    const radius = 150 + Math.abs(charge.q) * 10;
    const gradient = ctx.createRadialGradient(
      charge.x,
      charge.y,
      8,
      charge.x,
      charge.y,
      radius,
    );

    if (positive) {
      gradient.addColorStop(0, "rgba(244,114,182,0.32)");
      gradient.addColorStop(1, "rgba(244,114,182,0)");
    } else {
      gradient.addColorStop(0, "rgba(34,211,238,0.34)");
      gradient.addColorStop(1, "rgba(34,211,238,0)");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawContours(ctx, charges) {
  const step = 16;
  const levels = [-750, -450, -220, -120, 120, 220, 450, 750];

  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,255,255,0.18)";
  ctx.shadowBlur = 4;

  levels.forEach((level) => {
    ctx.strokeStyle =
      level > 0
        ? "rgba(244,114,182,0.88)"
        : "rgba(34,211,238,0.88)";

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

function drawArrow(ctx, x1, y1, x2, y2, color, width = 1.25) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 7;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawFieldArrows(ctx, charges) {
  ctx.save();

  for (let x = 56; x < WIDTH - 40; x += 52) {
    for (let y = 44; y < HEIGHT - 28; y += 46) {
      const tooClose = charges.some(
        (charge) => Math.hypot(charge.x - x, charge.y - y) < 44,
      );

      if (tooClose) continue;

      const field = fieldAt(x, y, charges);
      const magnitude = Math.hypot(field.x, field.y);

      if (magnitude < 0.00001) continue;

      const strength = clamp((magnitude - 0.00008) / 0.0015, 0, 1);
      const arrowLength = 16 + strength * 18;
      const alpha = 0.16 + strength * 0.42;
      const lineWidth = 0.9 + strength * 1.4;

      const dx = (field.x / magnitude) * arrowLength;
      const dy = (field.y / magnitude) * arrowLength;
      const color = `rgba(15,23,42,${alpha})`;

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();

      drawArrow(
        ctx,
        x - dx * 0.42,
        y - dy * 0.42,
        x + dx * 0.42,
        y + dy * 0.42,
        color,
        lineWidth,
      );
    }
  }

  ctx.restore();
}

function drawCharge(ctx, charge) {
  const positive = charge.q > 0;
  const mainColor = positive ? "#f472b6" : "#06b6d4";
  const glowColor = positive ? "#f9a8d4" : "#67e8f9";

  ctx.save();

  const outerGradient = ctx.createRadialGradient(
    charge.x,
    charge.y,
    4,
    charge.x,
    charge.y,
    42,
  );

  outerGradient.addColorStop(0, positive ? "rgba(244,114,182,0.32)" : "rgba(6,182,212,0.34)");
  outerGradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = outerGradient;
  ctx.beginPath();
  ctx.arc(charge.x, charge.y, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = mainColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 24;
  ctx.arc(charge.x, charge.y, 19, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 19px Exo 2, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(positive ? "+" : "−", charge.x, charge.y);

  drawLabel(
    ctx,
    `${positive ? "Тау" : "Шұңқыр"} · ${charge.q} нКл`,
    charge.x,
    charge.y + 42,
    "#334155",
  );

  ctx.restore();
}

function drawPoint(ctx, point, label, color) {
  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(point.x - 11, point.y);
  ctx.lineTo(point.x + 11, point.y);
  ctx.moveTo(point.x, point.y - 11);
  ctx.lineTo(point.x, point.y + 11);
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
  ctx.fill();

  drawLabel(ctx, label, point.x + 23, point.y - 17, color);

  ctx.restore();
}

function drawPointConnection(ctx, pointA, pointB) {
  if (!pointA || !pointB) return;

  ctx.save();

  ctx.setLineDash([8, 7]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(124,58,237,0.55)";

  ctx.beginPath();
  ctx.moveTo(pointA.x, pointA.y);
  ctx.lineTo(pointB.x, pointB.y);
  ctx.stroke();

  ctx.setLineDash([]);

  drawArrow(
    ctx,
    pointA.x,
    pointA.y,
    pointB.x,
    pointB.y,
    "rgba(124,58,237,0.65)",
  );

  ctx.restore();
}

export default function ElectricPotentialLab() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const [charges, setCharges] = useState(INITIAL_CHARGES);
  const [mode, setMode] = useState("inspect");
  const [selectedPoint, setSelectedPoint] = useState(INITIAL_POINT);
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

      const x = clamp(
        ((event.clientX - rect.left) / rect.width) * WIDTH,
        30,
        WIDTH - 30,
      );

      const y = clamp(
        ((event.clientY - rect.top) / rect.height) * HEIGHT,
        30,
        HEIGHT - 30,
      );

      setCharges((current) =>
        current.map((charge) =>
          charge.id === dragId ? { ...charge, x, y } : charge,
        ),
      );
    };

    const stopDrag = () => setDragId(null);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopDrag);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopDrag);
    };
  }, [dragId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawSoftBackground(ctx);
    drawGrid(ctx);
    drawPotentialHeatMap(ctx, charges);
    drawContours(ctx, charges);
    drawFieldArrows(ctx, charges);
    drawPointConnection(ctx, pointA, pointB);

    charges.forEach((charge) => drawCharge(ctx, charge));

    drawPoint(ctx, selectedPoint, "P", "#7c3aed");

    if (pointA) drawPoint(ctx, pointA, "A", "#16a34a");
    if (pointB) drawPoint(ctx, pointB, "B", "#f97316");
  }, [charges, pointA, pointB, selectedPoint]);

  const handleCanvasAction = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = clamp(
      ((event.clientX - rect.left) / rect.width) * WIDTH,
      20,
      WIDTH - 20,
    );

    const y = clamp(
      ((event.clientY - rect.top) / rect.height) * HEIGHT,
      20,
      HEIGHT - 20,
    );

    const hitCharge = charges.find(
      (charge) => Math.hypot(charge.x - x, charge.y - y) < 28,
    );

    if (hitCharge) {
      setDragId(hitCharge.id);
      return;
    }

    if (mode === "addPositive" || mode === "addNegative") {
      setCharges((current) => [
        ...current,
        {
          id: Date.now(),
          x,
          y,
          q: mode === "addPositive" ? 4 : -4,
        },
      ]);
      return;
    }

    setSelectedPoint({ x, y });

    if (mode === "pointA") setPointA({ x, y });
    if (mode === "pointB") setPointB({ x, y });
  };

  const resetLab = () => {
    setCharges(INITIAL_CHARGES);
    setSelectedPoint(INITIAL_POINT);
    setPointA(null);
    setPointB(null);
    setMode("inspect");
    setTransportCharge(3);
  };

  const removeLastCharge = () => {
    setCharges((current) => {
      if (current.length <= 2) return current;
      return current.slice(0, -1);
    });
  };

  return (
    <LabPageLayout
      topic="Электр потенциалы"
      title="Электр потенциалының өзгерісін зерттеу"
      subtitle="Оң зарядтарды тау, теріс зарядтарды шұңқыр деп елестетіп, эквипотенциал сызықтарды, нүктедегі потенциалды және A = qU жұмысын зерттеңіз."
      formula="φ = kQ / r"
      theoryId="electric-field"
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
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/40"
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

            <div className="grid gap-2">
              <button
                type="button"
                onClick={removeLastCharge}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Соңғы зарядты өшіру
              </button>

              <button
                type="button"
                onClick={resetLab}
                className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
              >
                Бастапқы күйге қайтару
              </button>
            </div>
          </ControlPanel>

          <Panel title="Есептеу нәтижесі" icon={Route} accent="#06b6d4">
            <div className="grid gap-3">
              <StatPill
                label="Таңдалған нүкте"
                value={`${selectedPotential.toFixed(1)} В`}
                accent="#06b6d4"
              />

              <StatPill
                label="ΔU (B − A)"
                value={deltaV !== null ? `${deltaV.toFixed(1)} В` : "—"}
                accent="#06b6d4"
              />

              <StatPill
                label="A = qU"
                value={workNanoJ !== null ? `${workNanoJ.toFixed(1)} нДж` : "—"}
                accent="#06b6d4"
              />

              {deltaV === null && (
                <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-xs font-semibold leading-5 text-cyan-800">
                  ΔU және жұмыс мәнін көру үшін алдымен A және B нүктелерін таңдаңыз.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Нені есте сақтаймыз?" icon={Waves} accent="#06b6d4">
            <HintList
              accent="#06b6d4"
              items={[
                "Оң заряд маңында потенциал оң болады, ал теріс заряд маңында потенциал теріс болады.",
                "Эквипотенциал сызықтар бірдей потенциал мәндерін көрсетеді.",
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
            onPointerDown={handleCanvasAction}
            className="w-full cursor-crosshair rounded-[24px] border border-cyan-100 bg-white shadow-inner"
          />
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Зарядтарды сүйреп жылжытыңыз немесе таңдалған режим арқылы картаға шертіңіз.
          Жіңішке сызықтар — эквипотенциал сызықтар, ал шағын бағыт көрсеткіштері электр өрісінің бағытын көрсетеді.
        </p>
      </Panel>

      <Panel title="Неге бұл карта тауға ұқсайды?" icon={Move3D} accent="#06b6d4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-pink-50 p-4">
            <h3 className="text-sm font-bold text-pink-900">Оң заряд</h3>
            <p className="mt-2 text-sm leading-6 text-pink-950/80">
              Биік төбе сияқты: зарядқа жақындаған сайын потенциал жоғарылайды.
            </p>
          </div>

          <div className="rounded-3xl bg-cyan-50 p-4">
            <h3 className="text-sm font-bold text-cyan-900">Теріс заряд</h3>
            <p className="mt-2 text-sm leading-6 text-cyan-950/80">
              Ойпат сияқты: зарядқа жақындаған сайын потенциал төмендейді.
            </p>
          </div>

          <div className="rounded-3xl bg-violet-50 p-4">
            <h3 className="text-sm font-bold text-violet-900">Жұмыс</h3>
            <p className="mt-2 text-sm leading-6 text-violet-950/80">
              Заряд A нүктесінен B нүктесіне өткенде потенциал айырмасы неғұрлым үлкен болса,
              есептелетін жұмыс та соғұрлым үлкен болады.
            </p>
          </div>
        </div>
      </Panel>
    </LabPageLayout>
  );
}
