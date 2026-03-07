import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Droplet, ArrowRight, Disc } from 'lucide-react';
import { useAquaLoopData } from '../hooks/useAquaLoopData';

export default function LoopDiagram() {
    const { latestByProcess } = useAquaLoopData();
    // For demo, we default to observing 'processA'
    const state = latestByProcess['processA'] || { class: 'med', inFlowLpm: 0.8, outFlowLpm: 0.8 };
    const containerRef = useRef(null);

    const minActive = state.class === 'min';
    const medActive = state.class === 'med';
    const maxActive = state.class === 'max';

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Flow animation
            const duration = Math.max(0.5, 2.0 - (state.inFlowLpm || 0)); // Speed driven by flow rate

            gsap.to('.flow-dash', {
                strokeDashoffset: -20,
                duration: duration,
                repeat: -1,
                ease: 'none'
            });

            // Valve scale animation when active changes
            gsap.to('.valve-min', { scale: minActive ? 1.1 : 1, opacity: minActive ? 1 : 0.4, duration: 0.3 });
            gsap.to('.valve-med', { scale: medActive ? 1.1 : 1, opacity: medActive ? 1 : 0.4, duration: 0.3 });
            gsap.to('.valve-max', { scale: maxActive ? 1.1 : 1, opacity: maxActive ? 1 : 0.4, duration: 0.3 });

        }, containerRef);
        return () => ctx.revert();
    }, [state.inFlowLpm, minActive, medActive, maxActive]);

    return (
        <div ref={containerRef} className="w-full h-[400px] md:h-[500px] bg-primary rounded-[3rem] border border-text-dark/10 shadow-2xl overflow-hidden relative p-8 flex flex-col pt-12">
            <h3 className="font-heading font-bold text-xl text-text-light absolute top-8 left-10">Live Loop Routing</h3>

            <div className="flex-grow w-full h-full relative mt-4">
                {/* SVG Pipes layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* Main pipe left to center */}
                    <path d="M 15% 50% L 45% 50%" stroke="url(#pipeGrad)" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 15% 50% L 45% 50%" stroke="#C9A84C" strokeWidth="2" strokeDasharray="10 10" className="flow-dash" strokeLinecap="round" />

                    {/* Pipes center to right (top - min) */}
                    <path d="M 55% 50% L 65% 50% C 70% 50% 70% 20% 75% 20% L 85% 20%" stroke={minActive ? "url(#pipeGrad)" : "#333"} strokeWidth="6" fill="none" />
                    {minActive && <path d="M 55% 50% L 65% 50% C 70% 50% 70% 20% 75% 20% L 85% 20%" stroke="#C9A84C" strokeWidth="2" strokeDasharray="10 10" className="flow-dash" fill="none" />}

                    {/* Pipes center to right (middle - med) */}
                    <path d="M 55% 50% L 85% 50%" stroke={medActive ? "url(#pipeGrad)" : "#333"} strokeWidth="6" fill="none" />
                    {medActive && <path d="M 55% 50% L 85% 50%" stroke="#C9A84C" strokeWidth="2" strokeDasharray="10 10" className="flow-dash" fill="none" />}

                    {/* Pipes center to right (bottom - max) */}
                    <path d="M 55% 50% L 65% 50% C 70% 50% 70% 80% 75% 80% L 85% 80%" stroke={maxActive ? "url(#pipeGrad)" : "#333"} strokeWidth="6" fill="none" />
                    {maxActive && <path d="M 55% 50% L 65% 50% C 70% 50% 70% 80% 75% 80% L 85% 80%" stroke="#C9A84C" strokeWidth="2" strokeDasharray="10 10" className="flow-dash" fill="none" />}
                </svg>

                {/* Tanks HTML Overlays */}
                {/* Source Tank */}
                <div className="absolute left-[10%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-24 h-40 border-2 border-text-light/20 rounded-xl bg-background/5 overflow-hidden flex flex-col justify-end">
                    <div className="w-full bg-blue-500/20 transition-all duration-1000 ease-out h-[60%]" />
                    <div className="absolute inset-0 flex items-center justify-center font-heading text-xs text-text-light/60 text-center px-2">Used Water</div>
                </div>

                {/* Sensing Tank Center */}
                <div className="absolute left-[50%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-48 border-2 border-accent/40 rounded-xl bg-accent/5 overflow-hidden flex flex-col justify-end shadow-[0_0_30px_rgba(201,168,76,0.15)]">
                    <div className="w-full bg-accent/30 transition-all duration-1000 ease-out h-[50%]" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span className="font-heading font-bold text-sm text-text-light">Sensing Area</span>
                        <div className="flex items-center gap-1 bg-[#0A0A10] px-2 py-1 rounded-full border border-text-light/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="font-data text-[8px] uppercase tracking-wider text-text-light">Active</span>
                        </div>
                    </div>
                </div>

                {/* Outlets */}
                {/* Min Outlet (High Grade) */}
                <div className="absolute left-[90%] top-[20%] -translate-y-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className={`valve-min w-6 h-6 rounded-full flex items-center justify-center ${minActive ? 'bg-accent text-primary shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'bg-background/10 text-text-light/40 border border-text-light/20'}`}>
                        <Disc size={12} />
                    </div>
                    <div className="w-24 h-20 border border-text-light/20 rounded-xl bg-background/5 overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-blue-400/30 h-[80%] transition-all duration-1000" />
                        <div className="absolute inset-0 flex items-center justify-center text-center px-1 font-heading text-[10px] text-text-light">High-grade Reuse</div>
                    </div>
                </div>

                {/* Med Outlet (Utility) */}
                <div className="absolute left-[90%] top-[50%] -translate-y-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className={`valve-med w-6 h-6 rounded-full flex items-center justify-center ${medActive ? 'bg-accent text-primary shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'bg-background/10 text-text-light/40 border border-text-light/20'}`}>
                        <Disc size={12} />
                    </div>
                    <div className="w-24 h-20 border border-text-light/20 rounded-xl bg-background/5 overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-amber-500/30 h-[50%] transition-all duration-1000" />
                        <div className="absolute inset-0 flex items-center justify-center text-center px-1 font-heading text-[10px] text-text-light">Utility Loop</div>
                    </div>
                </div>

                {/* Max Outlet (Discharge) */}
                <div className="absolute left-[90%] top-[80%] -translate-y-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className={`valve-max w-6 h-6 rounded-full flex items-center justify-center ${maxActive ? 'bg-accent text-primary shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'bg-background/10 text-text-light/40 border border-text-light/20'}`}>
                        <Disc size={12} />
                    </div>
                    <div className="w-24 h-20 border border-text-light/20 rounded-xl bg-background/5 overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-red-500/30 h-[20%] transition-all duration-1000" />
                        <div className="absolute inset-0 flex items-center justify-center text-center px-1 font-heading text-[10px] text-text-light">Treatment /<br />Discharge</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
