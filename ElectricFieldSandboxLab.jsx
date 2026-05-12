import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Flame, Map, MousePointer2, Orbit, Trash2 } from "lucide-react";
import LabPageLayout, { ControlPanel, HintList, Panel, StatPill } from "./LabPageLayout";

const WIDTH = 760;
const HEIGHT = 430;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFieldAtPoint(x, y, charges) {
  let fx = 0;
  let fy = 0;

  charges.forEach((charge) => {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const distanceSq = dx * dx + dy * dy + 180;
    const distance = Math.sqrt(distanceSq);
    const strength = (charge.q * 15500) / distanceSq;
    fx += (strength * dx) / distance;
    fy += (strength * dy) / distance;
  });

  return { fx, fy, magnitude: Math.sqrt(fx * fx + fy * fy) };
}

function drawArrow(ctx, x, y, fx, fy) {
  const magnitude = Math.sqrt(fx * fx + fy * fy);
  if (magnitude < 0.1) return;

  const scale = clamp(magnitude * 0.12, 7, 18);
  const ux = fx / magnitude;
  const uy = fy / magnitude;
  const endX = x + ux * scale;
  const endY = y + uy * scale;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - ux * 6 - uy * 4, endY - uy * 6 + ux * 4);
  ctx.lineTo(endX - ux * 6 + uy * 4, endY - uy * 6 - ux * 4);
  ctx.closePath();
  ctx.fill();
}

export default function ElectricFieldSandboxLab() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("positive");
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [charges, setCharges] = useState([
    { id: 1, x: 220, y: 220, q: 1 },
    { id: 2, x: 520, y: 220, q: -1 },
  ]);
  const [probe, setProbe] = useState(null);

  const averageStrength = useMemo(() => {
    const samplePoints = [
      getFieldAtPoint(200, 180, charges),
      getFieldAtPoint(380, 220, charges),
      getFieldAtPoint(560, 260, charges),
    ];
    return samplePoints.reduce((sum, item) => sum + item.magnitude, 0) / samplePoints.length;
  }, [charges]);

  useEffect(() => {
    if (!probe?.active) return undefined;

    let frameId = 0;
    const tick = () => {
      setProbe((current) => {
        if (!current?.active) return current;
        const { fx, fy } = getFieldAtPoint(current.x, current.y, charges);
        const nextVx = clamp((current.vx + fx * 0.00065) * 0.992, -6, 6);
        const nextVy = clamp((current.vy + fy * 0.00065) * 0.992, -6, 6);
        const nextX = current.x + nextVx;
        const nextY = current.y + nextVy;
        const tooClose = charges.some((charge) => {
          const dx = nextX - charge.x;
          const dy = nextY - charge.y;
          return Math.sqrt(dx * dx + dy * dy) < 18;
        });

        if (tooClose || nextX < 0 || nextX > WIDTH || nextY < 0 || nextY > HEIGHT) {
          return { ...current, active: false };
        }

        return {
          ...current,
          x: nextX,
          y: nextY,
          vx: nextVx,
          vy: nextVy,
          path: [...current.path.slice(-150), { x: nextX, y: nextY }],
        };
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [charges, probe?.active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (showHeatMap) {
      for (let x = 0; x < WIDTH; x += 18) {
        for (let y = 0; y < HEIGHT; y += 18) {
          const { magnitude } = getFieldAtPoint(x + 9, y + 9, charges);
          const alpha = clamp(magnitude / 28, 0.03, 0.36);
          const hue = clamp(210 + magnitude * 4.2, 210, 325);
          ctx.fillStyle = `hsla(${hue}, 90%, 62%, ${alpha})`;
          ctx.fillRect(x, y, 18, 18);
        }
      }
    }

    if (showVectors) {
      ctx.strokeStyle = "#475569";
      ctx.fillStyle = "#475569";
      ctx.lineWidth = 1.6;
      for (let x = 34; x < WIDTH; x += 44) {
        for (let y = 32; y < HEIGHT; y += 44) {
          const { fx, fy } = getFieldAtPoint(x, y, charges);
          drawArrow(ctx, x, y, fx, fy);
        }
      }
    }

    if (probe?.path?.length) {
      ctx.beginPath();
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;
      probe.path.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    charges.forEach((charge) => {
      ctx.beginPath();
      ctx.fillStyle = charge.q > 0 ? "#f97316" : "#3b82f6";
      ctx.shadowColor = charge.q > 0 ? "#fb923c" : "#60a5fa";
      ctx.shadowBlur = 20;
      ctx.arc(charge.x, charge.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Exo 2, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(charge.q > 0 ? "+" : "−", charge.x, charge.y + 1);
    });

    if (probe) {
      ctx.beginPath();
      ctx.fillStyle = probe.active ? "#06b6d4" : "#0f172a";
      ctx.arc(probe.x, probe.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [charges, probe, showHeatMap, showVectors]);

  const handleCanvasClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;

    if (mode === "probe") {
      setProbe({
        x,
        y,
        vx: 0,
        vy: 0,
        active: true,
        path: [{ x, y }],
      });
      return;
    }

    setCharges((current) => [
      ...current,
      {
        id: Date.now(),
        x,
        y,
        q: mode === "positive" ? 1 : -1,
      },
    ]);
  };

  return (
    <LabPageLayout
      topic="Электр өрісі"
      title="Electric Field Sandbox"
      subtitle="Экранға оң және теріс зарядтарды орналастырып, өріс бағытын, күштің таралуын және сынақ зарядтың қозғалыс траекториясын зерттеңіз."
      formula="E = F / q"
      difficulty="Орташа"
      duration="25 мин"
      accent="#8b5cf6"
      sidebar={
        <>
          <ControlPanel accent="#8b5cf6">
            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { key: "positive", label: "Оң заряд", color: "bg-orange-100 text-orange-800" },
                { key: "negative", label: "Теріс заряд", color: "bg-sky-100 text-sky-800" },
                { key: "probe", label: "Сынақ заряд", color: "bg-violet-100 text-violet-800" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMode(item.key)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    mode === item.key
                      ? "border-violet-300 bg-violet-50 text-violet-700"
                      : `border-slate-200 ${item.color}`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Heat map
              <input type="checkbox" checked={showHeatMap} onChange={() => setShowHeatMap((prev) => !prev)} />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Vector arrows
              <input type="checkbox" checked={showVectors} onChange={() => setShowVectors((prev) => !prev)} />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCharges((current) => current.slice(0, -1))}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <Trash2 size={15} />
                Соңғы зарядты өшіру
              </button>
              <button
                type="button"
                onClick={() => {
                  setCharges([]);
                  setProbe(null);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"
              >
                Барлығын тазалау
              </button>
            </div>
          </ControlPanel>

          <Panel title="Негізгі көрсеткіштер" icon={Map} accent="#8b5cf6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatPill label="Заряд саны" value={charges.length} accent="#8b5cf6" />
              <StatPill label="Орташа өріс" value={`${averageStrength.toFixed(1)} a.u.`} accent="#8b5cf6" />
            </div>
            <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-950/85">
              Қанық түс аймақтарында өріс күштірек. Сынақ заряд әрдайым өріс бағытымен қозғалады.
            </div>
          </Panel>

          <Panel title="Нені байқайсыз?" icon={Orbit} accent="#8b5cf6">
            <HintList
              accent="#8b5cf6"
              items={[
                "Оң зарядтан өріс сызықтары сыртқа қарай бағытталады.",
                "Теріс зарядқа жақындаған сайын стрелкалар соған қарай бұрылады.",
                "Сынақ зарядтың ізі өрістің ең күшті бағыттарын көрсетеді.",
              ]}
            />
          </Panel>
        </>
      }
    >
      <Panel title="Өріс алаңы" icon={Activity} accent="#8b5cf6">
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-orange-700">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            Оң заряд
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            Теріс заряд
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            Сынақ заряд траекториясы
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair rounded-[24px] border border-violet-100 bg-white"
        />
        <p className="mt-3 text-sm text-slate-500">
          Таңдалған режимге байланысты кенепке шертіңіз: заряд қосыңыз немесе сынақ зарядын жіберіңіз.
        </p>
      </Panel>

      <Panel title="Мектеп оқушысына қарапайым түсінік" icon={Flame} accent="#8b5cf6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-violet-50 p-4">
            <h3 className="text-sm font-bold text-violet-900">Өріс деген не?</h3>
            <p className="mt-2 text-sm leading-6 text-violet-950/80">
              Бұл зарядтың айналасындағы “әсер ету аймағы”.
            </p>
          </div>
          <div className="rounded-3xl bg-sky-50 p-4">
            <h3 className="text-sm font-bold text-sky-900">Стрелка нені көрсетеді?</h3>
            <p className="mt-2 text-sm leading-6 text-sky-950/80">
              Оң сынақ заряд дәл осы бағытпен итеріледі.
            </p>
          </div>
          <div className="rounded-3xl bg-fuchsia-50 p-4">
            <h3 className="text-sm font-bold text-fuchsia-900">Heat map не үшін керек?</h3>
            <p className="mt-2 text-sm leading-6 text-fuchsia-950/80">
              Қай жерде өріс күшті, қай жерде әлсіз екенін тез көруге көмектеседі.
            </p>
          </div>
        </div>
      </Panel>
    </LabPageLayout>
  );
}
