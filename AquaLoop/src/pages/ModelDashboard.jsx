import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import modelData from "../data/modelResults.json";

/* ───── palette ───── */
const CLASS_COLORS = {
  max: "#EF4444", // red
  med: "#F59E0B", // amber
  min: "#60A5FA", // blue
};
const ACCENT = "#C9A84C";
const PRIMARY = "#0D0D12";

/* ───── reusable card ───── */
function Card({ title, span = "", children, className = "" }) {
  return (
    <div
      className={`bg-white border border-text-dark/10 rounded-[2rem] p-6 shadow-sm flex flex-col ${span} ${className}`}
    >
      <h3 className="font-heading font-bold text-base text-primary mb-5 tracking-tight">
        {title}
      </h3>
      <div className="flex-grow w-full min-h-0">{children}</div>
    </div>
  );
}

/* ───── custom tooltip ───── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary border border-text-light/10 p-3 rounded-xl shadow-2xl font-data text-xs text-text-light">
      {label && <p className="mb-2 opacity-60">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold">
            {typeof entry.value === "number"
              ? entry.value.toFixed(1)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───── scatter tooltip ───── */
function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-primary border border-text-light/10 p-3 rounded-xl shadow-2xl font-data text-xs text-text-light min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block w-2 h-2 rounded-full`}
          style={{ background: CLASS_COLORS[d.predicted] }}
        />
        <span className="uppercase font-bold tracking-wider">
          {d.predicted}
        </span>
        <span className="opacity-40 ml-auto">{d.confidence}%</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
        <span className="opacity-60">Turbidity</span>
        <span>{d.turbidity}</span>
        <span className="opacity-60">TDS</span>
        <span>{d.tds}</span>
        <span className="opacity-60">pH</span>
        <span>{d.ph}</span>
        <span className="opacity-60">Temp</span>
        <span>{d.temp}°C</span>
        <span className="opacity-60">Actual</span>
        <span className="uppercase">{d.actual}</span>
      </div>
    </div>
  );
}

/* ───── confusion matrix heatmap ───── */
function ConfusionMatrix({ matrix, labels }) {
  const maxVal = Math.max(...matrix.flat());
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      {/* Column headers */}
      <div className="flex items-end ml-20 gap-1">
        {labels.map((label) => (
          <div
            key={label}
            className="w-20 text-center font-data text-[10px] uppercase tracking-wider text-text-dark/50 pb-1"
          >
            pred {label}
          </div>
        ))}
      </div>
      {matrix.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1">
          <div className="w-16 text-right pr-3 font-data text-[10px] uppercase tracking-wider text-text-dark/50">
            {labels[ri]}
          </div>
          {row.map((val, ci) => {
            const intensity = maxVal > 0 ? val / maxVal : 0;
            const isDiagonal = ri === ci;
            const bg = isDiagonal
              ? `rgba(201, 168, 76, ${0.15 + intensity * 0.7})`
              : `rgba(239, 68, 68, ${intensity * 0.5})`;
            return (
              <div
                key={ci}
                className="w-20 h-16 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 cursor-default"
                style={{ backgroundColor: bg }}
              >
                <span className="font-data text-2xl font-bold text-primary">
                  {val}
                </span>
                <span className="font-data text-[9px] text-text-dark/40">
                  {((val / row.reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      ))}
      <p className="font-heading text-[11px] text-text-dark/40 mt-2">
        Rows = Actual &nbsp;·&nbsp; Columns = Predicted
      </p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════════════ */
export default function ModelDashboard() {
  const [scatterX, setScatterX] = useState("tds");
  const [scatterY, setScatterY] = useState("turbidity");
  const [filterClass, setFilterClass] = useState("all");

  const scatterAxes = [
    "turbidity",
    "tds",
    "temp",
    "ph",
    "inFlowLpm",
    "outFlowLpm",
  ];

  /* Pre-shaped data */
  const featureImpData = modelData.featureImportances.map((f) => ({
    ...f,
    pct: +(f.importance * 100).toFixed(1),
  }));

  const classMetrics = modelData.classificationReport;

  const classDist = modelData.classDistribution.map((d) => ({
    ...d,
    color: CLASS_COLORS[d.class] || "#999",
  }));

  /* Scatter data — filtered */
  const scatterPoints = useMemo(() => {
    return modelData.testPredictions
      .filter((p) => filterClass === "all" || p.predicted === filterClass)
      .map((p) => ({
        ...p,
        fill: CLASS_COLORS[p.predicted],
        correct: p.actual === p.predicted,
      }));
  }, [filterClass]);

  /* Accuracy ring */
  const accRing = [
    { name: "Correct", value: modelData.accuracy },
    { name: "Incorrect", value: 100 - modelData.accuracy },
  ];

  return (
    <div className="pt-32 min-h-screen px-4 md:px-8 xl:px-12 text-text-dark pb-24 bg-background">
      <div className="max-w-screen-2xl mx-auto">
        {/* ── HEADER ── */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full font-heading uppercase tracking-wider font-semibold border border-accent/20">
                ML Model
              </span>
              <span className="bg-primary/5 text-primary text-xs px-3 py-1 rounded-full font-data">
                {modelData.modelName}
              </span>
            </div>
            <h1 className="font-heading font-bold text-4xl text-primary tracking-tight mb-3">
              Model Performance
            </h1>
            <p className="font-heading text-lg text-text-dark/60 max-w-2xl">
              Classifier evaluation on{" "}
              <span className="font-data text-accent">
                {modelData.testSamples}
              </span>{" "}
              test samples from{" "}
              <span className="font-data">{modelData.totalSamples}</span> total
              observations.
            </p>
          </div>

          {/* Accuracy hero */}
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={accRing}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={64}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={ACCENT} />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-data text-3xl font-bold text-primary">
                  {modelData.accuracy}%
                </span>
                <span className="font-heading text-[10px] uppercase tracking-widest text-text-dark/40">
                  accuracy
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 font-data text-xs text-text-dark/60">
              <span>
                Train: <b className="text-primary">{modelData.trainSamples}</b>
              </span>
              <span>
                Test: <b className="text-primary">{modelData.testSamples}</b>
              </span>
              <span>
                Features:{" "}
                <b className="text-primary">{modelData.features.length}</b>
              </span>
              <span>
                Classes:{" "}
                <b className="text-primary">{modelData.classLabels.length}</b>
              </span>
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {classMetrics.map((m) => (
            <div
              key={m.class}
              className="bg-white border border-text-dark/10 rounded-2xl p-5 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: CLASS_COLORS[m.class] }}
                />
                <span className="font-heading text-sm font-semibold uppercase tracking-wider">
                  {m.class}
                </span>
                <span className="ml-auto font-data text-[10px] text-text-dark/40">
                  {m.support} samples
                </span>
              </div>
              <div className="flex gap-4 mt-2 font-data text-xs">
                <div>
                  <span className="text-text-dark/40 block">Precision</span>
                  <span className="text-lg font-bold text-primary">
                    {m.precision}%
                  </span>
                </div>
                <div>
                  <span className="text-text-dark/40 block">Recall</span>
                  <span className="text-lg font-bold text-primary">
                    {m.recall}%
                  </span>
                </div>
                <div>
                  <span className="text-text-dark/40 block">F1</span>
                  <span className="text-lg font-bold text-accent">
                    {m.f1Score}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          {/* Overall strip card */}
          <div className="bg-primary border border-text-light/10 rounded-2xl p-5 flex flex-col gap-1 text-text-light">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              <span className="font-heading text-sm font-semibold uppercase tracking-wider">
                Overall
              </span>
            </div>
            <div className="flex gap-4 mt-2 font-data text-xs">
              <div>
                <span className="text-text-light/40 block">Accuracy</span>
                <span className="text-lg font-bold text-accent">
                  {modelData.accuracy}%
                </span>
              </div>
              <div>
                <span className="text-text-light/40 block">Total</span>
                <span className="text-lg font-bold">
                  {modelData.testSamples}
                </span>
              </div>
              <div>
                <span className="text-text-light/40 block">Correct</span>
                <span className="text-lg font-bold">
                  {Math.round(
                    (modelData.testSamples * modelData.accuracy) / 100,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Feature Importance */}
          <Card
            title="Feature Importance"
            span="lg:col-span-5"
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImpData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2A2A35"
                  opacity={0.08}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, "auto"]}
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  stroke="#2A2A35"
                  opacity={0.4}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={90}
                  tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
                  stroke="#2A2A35"
                  opacity={0.4}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="pct"
                  name="Importance"
                  radius={[0, 8, 8, 0]}
                  barSize={22}
                >
                  {featureImpData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0
                          ? ACCENT
                          : `rgba(201, 168, 76, ${0.7 - i * 0.1})`
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Confusion Matrix */}
          <Card
            title="Confusion Matrix"
            span="lg:col-span-7"
            className="h-[400px]"
          >
            <ConfusionMatrix
              matrix={modelData.confusionMatrix}
              labels={modelData.classLabels}
            />
          </Card>
        </div>

        {/* ── ROW 2: Class Distribution + Per-Class Metrics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Class Distribution Pie */}
          <Card
            title="Dataset Class Distribution"
            span="lg:col-span-4"
            className="h-[380px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDist}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  stroke="none"
                >
                  {classDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value, entry) => (
                    <span className="font-heading text-xs uppercase tracking-wider">
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Per-Class Metrics Grouped Bar */}
          <Card
            title="Per-Class Metrics (Precision / Recall / F1)"
            span="lg:col-span-8"
            className="h-[380px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classMetrics}
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2A2A35"
                  opacity={0.08}
                  vertical={false}
                />
                <XAxis
                  dataKey="class"
                  tick={{
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                    textTransform: "uppercase",
                  }}
                  stroke="#2A2A35"
                  opacity={0.4}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  stroke="#2A2A35"
                  opacity={0.4}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
                />
                <Bar
                  dataKey="precision"
                  name="Precision"
                  fill="#60A5FA"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="recall"
                  name="Recall"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="f1Score"
                  name="F1-Score"
                  fill={ACCENT}
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── SCATTER EXPLORER ── */}
        <Card title="Test Data Explorer" className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="font-heading text-xs text-text-dark/50 uppercase tracking-wider">
              X Axis
            </span>
            {scatterAxes.map((a) => (
              <button
                key={`x-${a}`}
                onClick={() => setScatterX(a)}
                className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${
                  scatterX === a
                    ? "bg-primary text-text-light font-bold"
                    : "bg-primary/5 text-text-dark/60 hover:text-primary border border-text-dark/10"
                }`}
              >
                {a}
              </button>
            ))}
            <div className="w-px h-4 bg-text-dark/10 mx-2" />
            <span className="font-heading text-xs text-text-dark/50 uppercase tracking-wider">
              Y Axis
            </span>
            {scatterAxes.map((a) => (
              <button
                key={`y-${a}`}
                onClick={() => setScatterY(a)}
                className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${
                  scatterY === a
                    ? "bg-accent text-primary font-bold"
                    : "bg-primary/5 text-text-dark/60 hover:text-primary border border-text-dark/10"
                }`}
              >
                {a}
              </button>
            ))}
            <div className="w-px h-4 bg-text-dark/10 mx-2" />
            <span className="font-heading text-xs text-text-dark/50 uppercase tracking-wider">
              Filter
            </span>
            {["all", ...modelData.classLabels].map((c) => (
              <button
                key={c}
                onClick={() => setFilterClass(c)}
                className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${
                  filterClass === c
                    ? "bg-primary text-text-light font-bold"
                    : "bg-primary/5 text-text-dark/60 hover:text-primary border border-text-dark/10"
                }`}
              >
                {c === "all" ? "All" : c.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2A2A35"
                  opacity={0.08}
                />
                <XAxis
                  type="number"
                  dataKey={scatterX}
                  name={scatterX}
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  stroke="#2A2A35"
                  opacity={0.4}
                  label={{
                    value: scatterX,
                    position: "bottom",
                    offset: 0,
                    style: {
                      fontFamily: "JetBrains Mono",
                      fontSize: 11,
                      fill: "#2A2A35",
                      opacity: 0.5,
                    },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey={scatterY}
                  name={scatterY}
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  stroke="#2A2A35"
                  opacity={0.4}
                  label={{
                    value: scatterY,
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: {
                      fontFamily: "JetBrains Mono",
                      fontSize: 11,
                      fill: "#2A2A35",
                      opacity: 0.5,
                    },
                  }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
                />
                {modelData.classLabels.map((cls) => (
                  <Scatter
                    key={cls}
                    name={cls.toUpperCase()}
                    data={scatterPoints.filter((p) => p.predicted === cls)}
                    fill={CLASS_COLORS[cls]}
                    opacity={0.7}
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ── PREDICTION TABLE (sample of misclassified) ── */}
        <Card title="Misclassified Samples" className="mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-text-dark/10 text-text-dark/50 font-heading text-xs uppercase tracking-widest">
                  <th className="pb-3 font-medium px-3">#</th>
                  <th className="pb-3 font-medium px-3">Turbidity</th>
                  <th className="pb-3 font-medium px-3">TDS</th>
                  <th className="pb-3 font-medium px-3">Temp</th>
                  <th className="pb-3 font-medium px-3">pH</th>
                  <th className="pb-3 font-medium px-3">In Flow</th>
                  <th className="pb-3 font-medium px-3">Out Flow</th>
                  <th className="pb-3 font-medium px-3">Actual</th>
                  <th className="pb-3 font-medium px-3">Predicted</th>
                  <th className="pb-3 font-medium px-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="font-data text-sm">
                {modelData.testPredictions
                  .filter((p) => p.actual !== p.predicted)
                  .slice(0, 25)
                  .map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-text-dark/5 hover:bg-red-50/50 transition-colors"
                    >
                      <td className="py-3 px-3 text-text-dark/40">{i + 1}</td>
                      <td className="py-3 px-3">{p.turbidity}</td>
                      <td className="py-3 px-3">{p.tds}</td>
                      <td className="py-3 px-3">{p.temp}°</td>
                      <td className="py-3 px-3">{p.ph}</td>
                      <td className="py-3 px-3">{p.inFlowLpm}</td>
                      <td className="py-3 px-3">{p.outFlowLpm}</td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
                          style={{
                            background: `${CLASS_COLORS[p.actual]}15`,
                            color: CLASS_COLORS[p.actual],
                          }}
                        >
                          {p.actual}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
                          style={{
                            background: `${CLASS_COLORS[p.predicted]}15`,
                            color: CLASS_COLORS[p.predicted],
                          }}
                        >
                          {p.predicted}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold">{p.confidence}%</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <p className="font-heading text-xs text-text-dark/30 mt-4 text-center">
              Showing up to 25 misclassified samples from{" "}
              {modelData.testSamples} test observations
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
