import { Link } from 'react-router-dom';
import { Activity, BarChart3 } from 'lucide-react';

export default function ImpactCTA() {
    return (
        <section className="relative w-full bg-background py-24 z-20">
            <div className="max-w-6xl mx-auto px-6">
                <div className="font-data text-xs text-accent tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-accent/50 block"></span>
                    04 — Live System
                </div>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary tracking-tight mb-4">
                    See it <span className="font-drama italic text-accent pr-1">working.</span>
                </h2>
                <p className="font-heading text-text-dark/60 text-lg mb-12 max-w-xl">
                    Our prototype runs in real-time. Explore the live 3D simulation or dive into the analytics engine.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Simulation Card */}
                    <Link
                        to="/simulation"
                        className="group relative bg-white rounded-[2rem] border border-gray-200 p-8 shadow-md overflow-hidden hover:-translate-y-2 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 ease-out flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                <Activity size={24} className="text-accent" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-primary">Run the live loop</h3>
                                <span className="font-data text-[10px] text-text-dark/50 tracking-widest uppercase">3D WebGL Simulation</span>
                            </div>
                        </div>
                        <p className="font-heading text-sm text-text-dark/60 leading-relaxed mb-4">
                            Watch water flow through the sensing tank and get routed to the right destination in real-time based on sensor readings.
                        </p>
                        <div className="mt-auto flex items-center gap-2 font-heading font-semibold text-accent text-sm group-hover:gap-3 transition-all">
                            Open simulation <span className="text-lg">→</span>
                        </div>
                    </Link>

                    {/* Analytics Card */}
                    <Link
                        to="/analytics"
                        className="group relative bg-white rounded-[2rem] border border-gray-200 p-8 shadow-md overflow-hidden hover:-translate-y-2 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 ease-out flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                <BarChart3 size={24} className="text-accent" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl text-primary">Inspect the data</h3>
                                <span className="font-data text-[10px] text-text-dark/50 tracking-widest uppercase">Analytics Engine</span>
                            </div>
                        </div>
                        <p className="font-heading text-sm text-text-dark/60 leading-relaxed mb-4">
                            Deep-dive into reuse percentages, routing distributions, and gallons saved vs. a traditional single-use baseline.
                        </p>
                        <div className="mt-auto flex items-center gap-2 font-heading font-semibold text-accent text-sm group-hover:gap-3 transition-all">
                            Open analytics <span className="text-lg">→</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
