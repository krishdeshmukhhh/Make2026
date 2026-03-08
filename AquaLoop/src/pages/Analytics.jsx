import { useState, useMemo } from "react";
import { useAquaLoopData } from "../hooks/useAquaLoopData";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import JudgePanel from "../components/JudgePanel";

const TIME_RANGES = ["1h", "24h", "7d", "30d", "3m", "6m", "1y", "All"];

function ChartCard({ title, children }) {
    return (
        <div className="bg-white border border-text-dark/20 rounded-[2rem] p-6 shadow-sm flex flex-col h-[400px]">
            <h3 className="font-heading font-bold text-lg text-primary mb-6">
                {title}
            </h3>
            <div className="flex-grow w-full">{children}</div>
        </div>
    );
}

export default function Analytics() {
    const { historyByProcess, getAggregatedStats, availableProcesses, alerts, isConnected } =
        useAquaLoopData();
    const [selectedProcess, setSelectedProcess] = useState("processA");
    const [selectedRange, setSelectedRange] = useState("1h");

    // Use actual historical data: filter by time range and downsample for display
    const { history, stats } = useMemo(() => {
        const rawHistory = historyByProcess[selectedProcess] || [];
        const now = Date.now();
        let msRange = 24 * 60 * 60 * 1000;

        switch (selectedRange) {
            case "1h":
                msRange = 60 * 60 * 1000;
                break;
            case "24h":
                msRange = 24 * 60 * 60 * 1000;
                break;
            case "7d":
                msRange = 7 * 24 * 60 * 60 * 1000;
                break;
            case "30d":
                msRange = 30 * 24 * 60 * 60 * 1000;
                break;
            case "3m":
                msRange = 90 * 24 * 60 * 60 * 1000;
                break;
            case "6m":
                msRange = 180 * 24 * 60 * 60 * 1000;
                break;
            case "1y":
                msRange = 365 * 24 * 60 * 60 * 1000;
                break;
            case "All":
                msRange = 2 * 365 * 24 * 60 * 60 * 1000;
                break;
            default:
                msRange = 24 * 60 * 60 * 1000;
                break;
        }

        const cutoff = now - msRange;
        const inRange = rawHistory.filter((r) => r.timestamp >= cutoff);

        // Downsample to ~60 points for longer ranges so the chart stays readable
        const maxPoints = 60;
        let historyToUse = inRange;
        if (inRange.length > maxPoints) {
            const step = inRange.length / maxPoints;
            const indices = new Set();
            for (let i = 0; i < maxPoints; i++) {
                indices.add(Math.min(Math.floor(i * step), inRange.length - 1));
            }
            historyToUse = inRange
                .map((r, i) => (indices.has(i) ? r : null))
                .filter(Boolean);
            // Keep chronological order
            historyToUse.sort((a, b) => a.timestamp - b.timestamp);
        }

        const statsToUse = getAggregatedStats(selectedProcess);
        // For stats we use full in-range data; getAggregatedStats uses full process history
        // so we recompute from inRange for the selected window
        let totalInVolume = 0;
        const classVolumes = { min: 0, med: 0, max: 0 };
        for (let i = 1; i < inRange.length; i++) {
            const prev = inRange[i - 1];
            const curr = inRange[i];
            const timeDeltaMin = (curr.timestamp - prev.timestamp) / 1000 / 60;
            totalInVolume += curr.inFlowLpm * timeDeltaMin;
            if (classVolumes[curr.class] !== undefined) {
                classVolumes[curr.class] += curr.outFlowLpm * timeDeltaMin;
            }
        }

        return {
            history: historyToUse,
            stats: { totalInVolume, classVolumes },
        };
    }, [selectedProcess, selectedRange, historyByProcess, getAggregatedStats]);

    // Custom Tooltip for charts matching design system
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-primary border border-text-light/10 p-3 rounded-lg shadow-xl font-data text-xs text-text-light">
                    <p className="mb-2 opacity-60">
                        {new Date(label).toLocaleTimeString()}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize">{entry.name}:</span>
                            <span className="font-bold">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="pt-32 min-h-screen px-4 md:px-8 xl:px-12 text-text-dark pb-24 bg-background">
            <div className="max-w-screen-2xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-heading font-bold text-4xl text-primary tracking-tight mb-4">
                            Analytics Engine
                        </h1>
                        <p className="font-heading text-lg text-text-dark/70 max-w-2xl">
                            Deep operational metrics and historical routing distributions.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2 justify-end">
                            {TIME_RANGES.map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setSelectedRange(range)}
                                    className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${selectedRange === range
                                        ? "bg-accent text-primary font-bold"
                                        : "bg-transparent text-text-dark/60 hover:text-primary border border-text-dark/10"
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dashboard Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (Charts & Overviews) */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                        {/* Sensor Trends */}
                        <ChartCard title="Sensor Telemetry">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={history}
                                    margin={{ top: 5, right: 60, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#2A2A35"
                                        opacity={0.1}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(tick) =>
                                            new Date(tick).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                        }
                                        stroke="#2A2A35"
                                        opacity={0.5}
                                        tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                                    />

                                    {/* LEFT axis — TDS: fixed 0–500 ppm */}
                                    <YAxis
                                        yAxisId="tds"
                                        orientation="left"
                                        domain={[0, 300]}
                                        stroke="#60A5FA"
                                        tick={{
                                            fontSize: 9,
                                            fontFamily: "JetBrains Mono",
                                            fill: "#60A5FA",
                                        }}
                                        width={40}
                                    />

                                    {/* RIGHT — pH: fixed 0–14 */}
                                    <YAxis
                                        yAxisId="ph"
                                        orientation="right"
                                        domain={[0, 14]}
                                        stroke="#10B981"
                                        tick={{
                                            fontSize: 9,
                                            fontFamily: "JetBrains Mono",
                                            fill: "#10B981",
                                        }}
                                        tickFormatter={(v) => v.toFixed(1)}
                                        width={35}
                                    />

                                    {/* FAR RIGHT — Turbidity: fixed 0–500 (NTU scale) */}
                                    <YAxis
                                        yAxisId="turbidity"
                                        orientation="right"
                                        domain={[0, 500]}
                                        stroke="#C9A84C"
                                        tick={{
                                            fontSize: 9,
                                            fontFamily: "JetBrains Mono",
                                            fill: "#C9A84C",
                                        }}
                                        width={35}
                                    />

                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
                                    />

                                    <Line
                                        yAxisId="tds"
                                        type="monotone"
                                        dataKey="tds"
                                        name="TDS"
                                        stroke="#60A5FA"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        yAxisId="turbidity"
                                        type="monotone"
                                        dataKey="turbidity"
                                        name="Turbidity"
                                        stroke="#C9A84C"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        yAxisId="ph"
                                        type="monotone"
                                        dataKey="ph"
                                        name="pH"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Overview dashboard: notifications, system status, what to watch, volume stats */}
                        <div className="bg-white border border-text-dark/20 rounded-[2rem] p-6 shadow-sm">
                            <h3 className="font-heading font-bold text-lg text-primary mb-6">
                                Overview
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="font-heading text-[10px] uppercase tracking-widest text-text-dark/50 mb-1">
                                            Last notification
                                        </div>
                                        <p className="font-data text-sm text-text-dark">
                                            {alerts.length > 0
                                                ? new Date(alerts[0].timestamp).toLocaleString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "No recent alerts"}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="font-heading text-[10px] uppercase tracking-widest text-text-dark/50 mb-1">
                                            System status
                                        </div>
                                        <p className="font-data text-sm flex items-center gap-2">
                                            <span
                                                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                                                    }`}
                                            />
                                            {isConnected ? "Systems nominal" : "Disconnected"}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="font-heading text-[10px] uppercase tracking-widest text-text-dark/50 mb-1">
                                            Watch
                                        </div>
                                        <p className="font-data text-sm text-text-dark">
                                            {alerts.length > 0
                                                ? `${alerts[0].metric} ${alerts[0].severity} (${alerts[0].value}${alerts[0].unit})`
                                                : "All within range"}
                                        </p>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex flex-col justify-center">
                                    <div className="font-heading text-[10px] uppercase tracking-widest text-text-dark/50 mb-4">
                                        Volume this period
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                            <div className="font-data text-2xl font-bold text-green-700">
                                                {(stats.classVolumes.min || 0).toFixed(1)}
                                            </div>
                                            <div className="font-heading text-xs text-text-dark/70 mt-1">
                                                Reused (L)
                                            </div>
                                        </div>
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                                            <div className="font-data text-2xl font-bold text-amber-700">
                                                {(stats.classVolumes.med || 0).toFixed(1)}
                                            </div>
                                            <div className="font-heading text-xs text-text-dark/70 mt-1">
                                                Cooled (L)
                                            </div>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                                            <div className="font-data text-2xl font-bold text-red-700">
                                                {(stats.classVolumes.max || 0).toFixed(1)}
                                            </div>
                                            <div className="font-heading text-xs text-text-dark/70 mt-1">
                                                Wasted (L)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Batch History Table) */}
                    <div className="lg:col-span-5 h-[832px]">
                        {" "}
                        {/* Match height approx for 400px x2 + gap */}
                        <div className="bg-white text-text-dark rounded-[2rem] p-8 shadow-sm overflow-hidden border border-text-dark/20 h-full flex flex-col">
                            <h3 className="font-heading font-bold text-xl text-primary mb-6 shrink-0">
                                Batch History
                            </h3>
                            <div className="overflow-y-auto flex-grow custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b border-text-dark/10 text-text-dark/50 font-heading text-xs uppercase tracking-widest">
                                            <th className="pb-4 font-medium px-2">Time</th>
                                            <th className="pb-4 font-medium px-2">Turbidity</th>
                                            <th className="pb-4 font-medium px-2">TDS</th>
                                            <th className="pb-4 font-medium px-2">Temp</th>
                                            <th className="pb-4 font-medium px-2">pH</th>
                                            <th className="pb-4 font-medium px-2">Class</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-data text-sm">
                                        {[...history]
                                            .reverse()
                                            .slice(0, 30)
                                            .map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b border-text-dark/5 hover:bg-text-dark/5 transition-colors group cursor-default"
                                                >
                                                    <td className="py-4 px-2 text-text-dark/60 whitespace-nowrap">
                                                        {new Date(row.timestamp).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        })}
                                                    </td>
                                                    <td className="py-4 px-2 font-medium">
                                                        {row.turbidity}
                                                    </td>
                                                    <td className="py-4 px-2 font-medium">{row.tds}</td>
                                                    <td className="py-4 px-2 text-text-dark/80">
                                                        {row.temp}
                                                    </td>
                                                    <td className="py-4 px-2 text-text-dark/80">
                                                        {row.ph}
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span
                                                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${row.class === "min"
                                                                ? "bg-green-500/10 text-green-600"
                                                                : row.class === "med"
                                                                    ? "bg-amber-500/10 text-amber-600"
                                                                    : "bg-red-500/10 text-red-600"
                                                                }`}
                                                        >
                                                            {row.class === "min"
                                                                ? "OPS"
                                                                : row.class === "med"
                                                                    ? "MID"
                                                                    : "BAD"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {history.length === 0 && (
                                    <div className="text-center py-12 font-heading text-text-dark/40">
                                        Awaiting sensor data sequence...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <JudgePanel
                bullets={[
                    "Process-level reuse % and gallons saved vs. single-use baseline.",
                    "Overview: last notification, system status, volume reused / cooled / wasted.",
                    "Historical trends — switch time ranges to see long-term patterns.",
                ]}
            />
        </div>
    );
}
