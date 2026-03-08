import AquaLoopScene from '../components/AquaLoopScene';
import LiveSensorStrip from '../components/LiveSensorStrip';
import JudgePanel from '../components/JudgePanel';

export default function Simulation() {
    return (
        <div className="pt-32 min-h-screen px-6 md:px-16 text-text-dark pb-24">
            <div className="max-w-screen-2xl mx-auto">
                <div className="mb-12">
                    <h1 className="font-heading font-bold text-4xl text-primary tracking-tight mb-4 flex items-center gap-4">
                        3D Flow Simulation
                        <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-heading uppercase tracking-wider font-semibold border border-primary/20">LIVE</span>
                    </h1>
                    <p className="font-heading text-lg text-text-dark/70 max-w-2xl">
                        Real-time WebGL visualization of algorithmic routing for the AquaLoop prototype.
                    </p>
                </div>

                {/* 3D Scene Container */}
                <div className="w-full h-[60vh] min-h-[500px] md:h-[700px] mb-12">
                    <AquaLoopScene />
                </div>

                <div className="mt-8 mb-4">
                    <h3 className="font-heading font-bold text-xl text-primary">Live Telemetry</h3>
                </div>
                <LiveSensorStrip />
            </div>

            <JudgePanel bullets={[
                "Live sensor readings from our Arduino prototype rig.",
                "Real-time routing decisions (min / med / max classification).",
                "Watch tanks fill and reset based on batch volume."
            ]} />
        </div>
    );
}
