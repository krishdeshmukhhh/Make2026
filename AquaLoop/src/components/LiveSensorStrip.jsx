import { useAquaLoopData } from '../hooks/useAquaLoopData';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

function MetricCard({ title, value, unit, range, status, history, dataKey }) {
    const getStatusColor = (s) => {
        switch (s) {
            case 'good': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]';
            case 'warn': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
            case 'crit': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
            default: return 'bg-text-dark/20';
        }
    };

    return (
        <div className="bg-white border border-text-dark/10 rounded-2xl p-5 shadow-sm flex flex-col hover:-translate-y-[2px] transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-heading font-medium text-text-dark/60 text-xs uppercase tracking-wider">{title}</h4>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
            </div>

            <div className="flex items-end gap-2 mb-2">
                <span className="font-data text-3xl font-bold text-text-dark">{value}</span>
                <span className="font-heading text-sm text-text-dark/40 mb-1">{unit}</span>
            </div>

            <div className="font-heading text-[10px] text-text-dark/40 mb-4 tracking-wider">
                TARGET: {range}
            </div>

            <div className="mt-auto h-8 w-full opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke="#C9A84C"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function LiveSensorStrip() {
    const { latestByProcess, historyByProcess } = useAquaLoopData();
    const processId = 'processA'; // Focusing on Process A for the live strip demo

    const current = latestByProcess[processId];
    const history = historyByProcess[processId] || [];

    if (!current) return <div className="h-40 flex items-center justify-center text-text-dark/60 font-heading">Waiting for sensor data...</div>;

    // Determine statuses
    const turbStatus = current.turbidity < 1.0 ? 'good' : current.turbidity < 3.0 ? 'warn' : 'crit';
    const tdsStatus = current.tds < 100 ? 'good' : current.tds < 250 ? 'warn' : 'crit';
    const flowStatus = 'good'; // Just mocked good for flow and temp

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <MetricCard
                title="Turbidity"
                value={current.turbidity}
                unit="NTU"
                range="< 1.0 NTU"
                status={turbStatus}
                history={history}
                dataKey="turbidity"
            />
            <MetricCard
                title="Purity (TDS)"
                value={current.tds}
                unit="ppm"
                range="< 50 ppm"
                status={tdsStatus}
                history={history}
                dataKey="tds"
            />
            <MetricCard
                title="Temperature"
                value={current.temp}
                unit="°C"
                range="20 - 30 °C"
                status="good"
                history={history}
                dataKey="temp"
            />
            <MetricCard
                title="Process pH"
                value={current.ph}
                unit="pH"
                range="6.5 - 7.5"
                status="good"
                history={history}
                dataKey="ph"
            />
            <MetricCard
                title="Line Flow"
                value={current.inFlowLpm}
                unit="L/min"
                range="0.5 - 1.5 L/min"
                status={flowStatus}
                history={history}
                dataKey="inFlowLpm"
            />
        </div>
    );
}
