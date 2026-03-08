import { useState, useMemo } from 'react';
import { useAquaLoopData, generateMockReading } from '../hooks/useAquaLoopData';
import {
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import JudgePanel from '../components/JudgePanel';

const TIME_RANGES = ['1h', '24h', '7d', '30d', '3m', '6m', '1y', 'All'];

function ChartCard({ title, children }) {
    return (
        <div className="bg-white border border-text-dark/20 rounded-[2rem] p-6 shadow-sm flex flex-col h-[400px]">
            <h3 className="font-heading font-bold text-lg text-primary mb-6">{title}</h3>
            <div className="flex-grow w-full">
                {children}
            </div>
        </div>
    );
}

export default function Analytics() {
    const { historyByProcess, getAggregatedStats, availableProcesses } = useAquaLoopData();
    const [selectedProcess, setSelectedProcess] = useState('processA');
    const [selectedRange, setSelectedRange] = useState('1h');

    // Memos to dynamically generate or use live data based on range
    const { history, stats } = useMemo(() => {
        const liveHistory = historyByProcess[selectedProcess] || [];
        const liveStats = getAggregatedStats(selectedProcess);

        // Use live array if it's the smallest range
        if (selectedRange === '1h') {
            return { history: liveHistory, stats: liveStats };
        }

        // Generate synthetic mock data for longer ranges to demonstrably simulate historical data
        const now = Date.now();
        let msRange = 24 * 60 * 60 * 1000;

        switch (selectedRange) {
            case '24h': msRange = 24 * 60 * 60 * 1000; break;
            case '7d': msRange = 7 * 24 * 60 * 60 * 1000; break;
            case '30d': msRange = 30 * 24 * 60 * 60 * 1000; break;
            case '3m': msRange = 90 * 24 * 60 * 60 * 1000; break;
            case '6m': msRange = 180 * 24 * 60 * 60 * 1000; break;
            case '1y': msRange = 365 * 24 * 60 * 60 * 1000; break;
            case 'All': msRange = 2 * 365 * 24 * 60 * 60 * 1000; break;
            default: msRange = 24 * 60 * 60 * 1000; break; // Default to 24h if something goes wrong
        }

        const generatedHistory = [];
        const numPoints = 60; // Chart resolution
        const step = msRange / numPoints;

        let totalInVolume = 0;
        const classVolumes = { min: 0, med: 0, max: 0 };

        for (let i = 0; i < numPoints; i++) {
            const reading = generateMockReading(selectedProcess);
            // Space timestamps evenly backwards from now
            reading.timestamp = now - msRange + (step * i);
            generatedHistory.push(reading);

            // Accumulate stats (assuming arbitrary flow time proxy)
            const proxyMinutes = (msRange / numPoints) / 1000 / 60; // real span

            totalInVolume += reading.inFlowLpm * proxyMinutes;
            classVolumes[reading.class] += reading.outFlowLpm * proxyMinutes;
        }

        return {
            history: generatedHistory,
            stats: { totalInVolume, classVolumes }
        };
    }, [selectedProcess, selectedRange, historyByProcess, getAggregatedStats]);

    // Format data for Recharts Pie
    const pieData = [
        { name: 'High-grade Reuse', value: stats.classVolumes.min, color: '#60A5FA' }, // blue-400
        { name: 'Utility Loop', value: stats.classVolumes.med, color: '#F59E0B' },   // amber-500
        { name: 'Discharge', value: stats.classVolumes.max, color: '#EF4444' },      // red-500
    ].filter(d => d.value > 0);

    // Custom Tooltip for charts matching design system
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-primary border border-text-light/10 p-3 rounded-lg shadow-xl font-data text-xs text-text-light">
                    <p className="mb-2 opacity-60">{new Date(label).toLocaleTimeString()}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
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
                        <h1 className="font-heading font-bold text-4xl text-primary tracking-tight mb-4">Analytics Engine</h1>
                        <p className="font-heading text-lg text-text-dark/70 max-w-2xl">
                            Deep operational metrics and historical routing distributions.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {availableProcesses.map(pid => (
                                <button
                                    key={pid}
                                    onClick={() => setSelectedProcess(pid)}
                                    className={`px-4 py-2 rounded-full font-heading text-sm font-semibold transition-colors ${selectedProcess === pid
                                        ? 'bg-primary text-text-light'
                                        : 'bg-primary/5 text-primary hover:bg-primary/10'
                                        }`}
                                >
                                    {pid === 'processA' ? 'Lithography Rinse — LIVE' :
                                        pid === 'processB' ? 'Etch Clean — SIMULATED' :
                                            'Cooling Return — SIMULATED'}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TIME_RANGES.map(range => (
                                <button
                                    key={range}
                                    onClick={() => setSelectedRange(range)}
                                    className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${selectedRange === range
                                        ? 'bg-accent text-primary font-bold'
                                        : 'bg-transparent text-text-dark/60 hover:text-primary border border-text-dark/10'
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
                                <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" opacity={0.1} vertical={false} />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        stroke="#2A2A35"
                                        opacity={0.5}
                                        tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                                    />
                                    <YAxis stroke="#2A2A35" opacity={0.5} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter' }} />
                                    <Line type="monotone" dataKey="turbidity" name="Turbidity" stroke="#C9A84C" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="tds" name="TDS" stroke="#60A5FA" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="ph" name="pH" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Volume Distribution & Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ChartCard title="Routing Distribution">
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-text-dark/40 font-heading">
                                        Accumulating volume...
                                    </div>
                                )}
                            </ChartCard>

                            <ChartCard title="Efficiency Overview">
                                <div className="flex flex-col h-full justify-center gap-6 pb-8">
                                    <div>
                                        <div className="font-heading text-xs text-text-dark/60 uppercase tracking-wider mb-2">Total Freshwater Saved</div>
                                        <div className="font-data text-4xl font-bold text-accent">
                                            {((stats.classVolumes.min + stats.classVolumes.med) || 0).toFixed(1)} <span className="text-xl text-text-dark/40">L</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-heading text-xs text-text-dark/60 uppercase tracking-wider mb-2">Reuse Percentage</div>
                                        <div className="font-data text-4xl font-bold text-primary">
                                            {stats.totalInVolume > 0
                                                ? (((stats.classVolumes.min + stats.classVolumes.med) / stats.totalInVolume) * 100).toFixed(1)
                                                : '0.0'}%
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    </div>

                    {/* Right Column (Batch History Table) */}
                    <div className="lg:col-span-5 h-[832px]"> {/* Match height approx for 400px x2 + gap */}
                        <div className="bg-white text-text-dark rounded-[2rem] p-8 shadow-sm overflow-hidden border border-text-dark/20 h-full flex flex-col">
                            <h3 className="font-heading font-bold text-xl text-primary mb-6 shrink-0">Batch History</h3>
                            <div className="overflow-y-auto flex-grow custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b border-text-dark/10 text-text-dark/50 font-heading text-xs uppercase tracking-widest">
                                            <th className="pb-4 font-medium px-2">Batch No.</th>
                                            <th className="pb-4 font-medium px-2">Time</th>
                                            <th className="pb-4 font-medium px-2">Turbidity</th>
                                            <th className="pb-4 font-medium px-2">TDS</th>
                                            <th className="pb-4 font-medium px-2">Temp</th>
                                            <th className="pb-4 font-medium px-2">pH</th>
                                            <th className="pb-4 font-medium px-2">Class</th>
                                            <th className="pb-4 font-medium px-2">Routing</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-data text-sm">
                                        {[...history].reverse().slice(0, 30).map((row, i) => (
                                            <tr key={i} className="border-b border-text-dark/5 hover:bg-text-dark/5 transition-colors group cursor-default">
                                                <td className="py-4 px-2 font-bold text-accent">{row.batchNo}</td>
                                                <td className="py-4 px-2 text-text-dark/60 whitespace-nowrap">{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                                <td className="py-4 px-2 font-medium">{row.turbidity}</td>
                                                <td className="py-4 px-2 font-medium">{row.tds}</td>
                                                <td className="py-4 px-2 text-text-dark/80">{row.temp}</td>
                                                <td className="py-4 px-2 text-text-dark/80">{row.ph}</td>
                                                <td className="py-4 px-2">
                                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${row.class === 'min' ? 'bg-blue-500/10 text-blue-600' :
                                                        row.class === 'med' ? 'bg-amber-500/10 text-amber-600' :
                                                            'bg-red-500/10 text-red-600'
                                                        }`}>
                                                        {row.class === 'min' ? 'MIN' : row.class === 'med' ? 'MED' : 'MAX'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2 font-heading text-xs text-text-dark/80 font-medium whitespace-nowrap">
                                                    {row.class === 'min' ? 'Reuse' : row.class === 'med' ? 'Utility' : 'Drain'}
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

            <JudgePanel bullets={[
                "Process-level reuse % and gallons saved vs. single-use baseline.",
                "Routing distribution across high-grade, utility, and discharge.",
                "Historical trends — switch time ranges to see long-term patterns."
            ]} />
        </div>
    );
}
