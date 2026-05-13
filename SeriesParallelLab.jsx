import { useMemo, useState } from "react";
import {
  Battery,
  Gauge,
  GitBranch,
  Home,
  Lightbulb,
  Plug,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import LabPageLayout, { ControlPanel, HintList, Panel, StatPill } from "./LabPageLayout";

const palette = [
  { type: "switch", label: "Қосқыш", icon: Plug, color: "bg-sky-50 text-sky-700" },
  { type: "lamp", label: "Шам", icon: Lightbulb, color: "bg-amber-50 text-amber-700" },
  { type: "voltmeter", label: "Вольтметр", icon: Gauge, color: "bg-violet-50 text-violet-700" },
];

function DropSlot({ slotId, label, expected, value, onDropItem, onClear, children }) {
  const PaletteIcon = palette.find((item) => item.type === value)?.icon;
  const paletteLabel = palette.find((item) => item.type === value)?.label;

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const itemType = event.dataTransfer.getData("text/plain");
        onDropItem(slotId, itemType);
      }}
      className="rounded-3xl border border-violet-200 bg-white p-4 shadow-[0_12px_28px_rgba(76,29,149,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">Күтілетін компонент: {expected}</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onClear(slotId)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            Тазалау
          </button>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {value ? (
          <div className="flex items-center gap-3">
            {PaletteIcon ? <PaletteIcon size={18} className="text-violet-700" /> : null}
            <span className="text-sm font-semibold text-slate-700">{paletteLabel}</span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Компонентті осы жерге сүйреп әкеліңіз</p>
        )}
        {children}
      </div>
    </div>
  );
}

export default function SeriesParallelLab() {
  const [topology, setTopology] = useState("series");
  const [slots, setSlots] = useState({
    switchMain: "",
    lampA: "",
    lampB: "",
    voltmeterSeries: "",
    switchA: "",
    switchB: "",
    lampPA: "",
    lampPB: "",
    voltmeterParallel: "",
  });
  const [switchState, setSwitchState] = useState({ main: true, a: true, b: true });
  const [failures, setFailures] = useState({ lamp1: false, lamp2: false });

  const seriesMetrics = useMemo(() => {
    const ready = slots.switchMain === "switch" && slots.lampA === "lamp" && slots.lampB === "lamp";
    const active = ready && switchState.main && !failures.lamp1 && !failures.lamp2;
    const totalResistance = active || ready ? 12 : 0;
    const current = active ? 12 / 12 : 0;
    return {
      ready,
      active,
      totalResistance,
      current,
      lamp1Voltage: active ? 6 : 0,
      lamp2Voltage: active ? 6 : 0,
    };
  }, [failures.lamp1, failures.lamp2, slots.lampA, slots.lampB, slots.switchMain, switchState.main]);

  const parallelMetrics = useMemo(() => {
    const branchAReady = slots.switchA === "switch" && slots.lampPA === "lamp";
    const branchBReady = slots.switchB === "switch" && slots.lampPB === "lamp";
    const branchAActive = branchAReady && switchState.a && !failures.lamp1;
    const branchBActive = branchBReady && switchState.b && !failures.lamp2;
    const currentA = branchAActive ? 12 / 6 : 0;
    const currentB = branchBActive ? 12 / 6 : 0;
    return {
      branchAReady,
      branchBReady,
      branchAActive,
      branchBActive,
      currentA,
      currentB,
      totalCurrent: currentA + currentB,
    };
  }, [failures.lamp1, failures.lamp2, slots.lampPA, slots.lampPB, slots.switchA, slots.switchB, switchState.a, switchState.b]);

  const handleDrop = (slotId, itemType) => {
    setSlots((current) => ({ ...current, [slotId]: itemType }));
  };

  const handleClearSlot = (slotId) => {
    setSlots((current) => ({ ...current, [slotId]: "" }));
  };

  const lampActiveState =
    topology === "series"
      ? {
          lamp1: seriesMetrics.active,
          lamp2: seriesMetrics.active,
        }
      : {
          lamp1: parallelMetrics.branchAActive,
          lamp2: parallelMetrics.branchBActive,
        };

  return (
    <LabPageLayout
      topic="Тізбектер"
      title="Өткізгіштерді тізбектей және параллель жалғауды модельдеу"
      subtitle="Smart Home бөлмесі үшін жарық схемасын жинаңыз: компоненттерді сүйреп орналастырыңыз, қосқыштарды қосыңыз және series пен parallel сұлбаларының айырмасын бақылаңыз."
      formula="I = U / R, U = const"
      theoryId="ohms-law"
      difficulty="Базалық"
      duration="25 мин"
      accent="#f97316"
      sidebar={
        <>
          <ControlPanel accent="#f97316">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button
                type="button"
                onClick={() => setTopology("series")}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  topology === "series" ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                Тізбектей
              </button>
              <button
                type="button"
                onClick={() => setTopology("parallel")}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                  topology === "parallel" ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                Параллель
              </button>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Шам 1 істен шықты
              <input
                type="checkbox"
                checked={failures.lamp1}
                onChange={(event) => setFailures((current) => ({ ...current, lamp1: event.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Шам 2 істен шықты
              <input
                type="checkbox"
                checked={failures.lamp2}
                onChange={(event) => setFailures((current) => ({ ...current, lamp2: event.target.checked }))}
              />
            </label>
          </ControlPanel>

          <Panel title="Негізгі мәндер" icon={GitBranch} accent="#f97316">
            {topology === "series" ? (
              <div className="grid gap-3">
                <StatPill label="Жалпы ток" value={`${seriesMetrics.current.toFixed(2)} A`} accent="#f97316" />
                <StatPill label="L1 кернеуі" value={`${seriesMetrics.lamp1Voltage.toFixed(1)} В`} accent="#f97316" />
                <StatPill label="L2 кернеуі" value={`${seriesMetrics.lamp2Voltage.toFixed(1)} В`} accent="#f97316" />
              </div>
            ) : (
              <div className="grid gap-3">
                <StatPill label="1-тармақ тогы" value={`${parallelMetrics.currentA.toFixed(2)} A`} accent="#f97316" />
                <StatPill label="2-тармақ тогы" value={`${parallelMetrics.currentB.toFixed(2)} A`} accent="#f97316" />
                <StatPill label="Жалпы ток" value={`${parallelMetrics.totalCurrent.toFixed(2)} A`} accent="#f97316" />
              </div>
            )}
          </Panel>

          <Panel title="Түсіндіру" icon={Home} accent="#f97316">
            <HintList
              accent="#f97316"
              items={[
                "Тізбектей сұлбада бір шам істен шықса, бүкіл тізбек үзіледі.",
                "Параллель сұлбада әр тармақ өз алдына жұмыс істейді.",
                "Параллель қосқанда әр шам толық 12 В алады, сондықтан жарығы тұрақтырақ болады.",
              ]}
            />
          </Panel>
        </>
      }
    >
      <Panel title="Компоненттер палитрасы" icon={Battery} accent="#f97316">
        <div className="flex flex-wrap gap-3">
          {palette.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", item.type)}
                className={`inline-flex cursor-grab items-center gap-2 rounded-2xl border border-white px-4 py-3 text-sm font-bold shadow-[0_12px_24px_rgba(15,23,42,0.04)] ${item.color}`}
              >
                <Icon size={16} />
                {item.label}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Сұлбаны жинау" icon={GitBranch} accent="#f97316">
        {topology === "series" ? (
          <div className="grid gap-4 lg:grid-cols-4">
            <DropSlot slotId="switchMain" label="1-қадам" expected="Қосқыш" value={slots.switchMain} onDropItem={handleDrop} onClear={handleClearSlot}>
              {slots.switchMain === "switch" && (
                <button
                  type="button"
                  onClick={() => setSwitchState((current) => ({ ...current, main: !current.main }))}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  {switchState.main ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {switchState.main ? "Қосулы" : "Ашық"}
                </button>
              )}
            </DropSlot>
            <DropSlot slotId="lampA" label="2-қадам" expected="Шам" value={slots.lampA} onDropItem={handleDrop} onClear={handleClearSlot} />
            <DropSlot slotId="lampB" label="3-қадам" expected="Шам" value={slots.lampB} onDropItem={handleDrop} onClear={handleClearSlot} />
            <DropSlot slotId="voltmeterSeries" label="Қосымша" expected="Вольтметр" value={slots.voltmeterSeries} onDropItem={handleDrop} onClear={handleClearSlot} />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <DropSlot slotId="switchA" label="1-тармақ" expected="Қосқыш" value={slots.switchA} onDropItem={handleDrop} onClear={handleClearSlot}>
              {slots.switchA === "switch" && (
                <button
                  type="button"
                  onClick={() => setSwitchState((current) => ({ ...current, a: !current.a }))}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  {switchState.a ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {switchState.a ? "Қосулы" : "Ашық"}
                </button>
              )}
            </DropSlot>
            <DropSlot slotId="lampPA" label="1-тармақ шамы" expected="Шам" value={slots.lampPA} onDropItem={handleDrop} onClear={handleClearSlot} />
            <DropSlot slotId="switchB" label="2-тармақ" expected="Қосқыш" value={slots.switchB} onDropItem={handleDrop} onClear={handleClearSlot}>
              {slots.switchB === "switch" && (
                <button
                  type="button"
                  onClick={() => setSwitchState((current) => ({ ...current, b: !current.b }))}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  {switchState.b ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {switchState.b ? "Қосулы" : "Ашық"}
                </button>
              )}
            </DropSlot>
            <DropSlot slotId="lampPB" label="2-тармақ шамы" expected="Шам" value={slots.lampPB} onDropItem={handleDrop} onClear={handleClearSlot} />
            <div className="lg:col-span-2">
              <DropSlot slotId="voltmeterParallel" label="Қосымша" expected="Вольтметр" value={slots.voltmeterParallel} onDropItem={handleDrop} onClear={handleClearSlot} />
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Smart Home көрінісі" icon={Home} accent="#f97316">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((lampNumber) => {
            const active = lampActiveState[`lamp${lampNumber}`];
            const failed = failures[`lamp${lampNumber}`];
            return (
              <div key={lampNumber} className="rounded-[28px] border border-orange-100 bg-orange-50/50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Шам {lampNumber}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${failed ? "bg-rose-100 text-rose-700" : active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {failed ? "Істен шыққан" : active ? "Жанып тұр" : "Өшірулі"}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white"
                    style={{
                      background: active ? "rgba(250,204,21,0.25)" : "#ffffff",
                      boxShadow: active ? "0 0 32px rgba(250,204,21,0.45)" : "none",
                    }}
                  >
                    <Lightbulb size={28} className={active ? "text-amber-500" : "text-slate-400"} />
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Кернеу: {topology === "series" ? `${seriesMetrics[`lamp${lampNumber}Voltage`].toFixed(1)} В` : active ? "12.0 В" : "0.0 В"}</p>
                    <p>Ток: {topology === "series" ? `${seriesMetrics.current.toFixed(2)} A` : `${lampNumber === 1 ? parallelMetrics.currentA.toFixed(2) : parallelMetrics.currentB.toFixed(2)} A`}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </LabPageLayout>
  );
}
