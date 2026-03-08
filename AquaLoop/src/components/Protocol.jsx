import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PROTOCOL_STEPS = [
    {
        num: "01",
        title: "Continuous Sensing",
        desc: "Deploying high-frequency sensors across all rinse streams to monitor quality metrics in real-time.",
        Animation: Step1Animation
    },
    {
        num: "02",
        title: "Algorithmic Routing",
        desc: "Dynamically directing each batch of water—from process cooling to utility use—based on precise purity needs.",
        Animation: Step2Animation
    },
    {
        num: "03",
        title: "Loop Optimization",
        desc: "Closing the operational cycle to drastically reduce overall freshwater draw and minimize wastewater discharge.",
        Animation: Step3Animation
    }
];

function Step1Animation() {
    return (
        <svg className="w-full h-full text-accent opacity-50 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.5" />
        </svg>
    );
}

function Step2Animation() {
    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-12 gap-2 w-full h-full opacity-30">
                {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="bg-accent rounded-full w-1 h-1 place-self-center" />
                ))}
            </div>
            <div className="absolute left-0 w-full h-[2px] bg-accent shadow-[0_0_15px_rgba(201,168,76,1)] animate-[scan_3s_ease-in-out_infinite_alternate]" />
        </div>
    );
}

function Step3Animation() {
    return (
        <svg className="w-full h-full text-accent opacity-60 drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path
                d="M0,50 L50,50 L60,20 L75,90 L90,10 L105,80 L115,50 L200,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-[pulseWave_2s_linear_infinite]"
                strokeDasharray="400"
                strokeDashoffset="400"
            />
        </svg>
    );
}

export default function Protocol() {
    const containerRef = useRef(null);

    useEffect(() => {
        // Add custom keyframes
        const style = document.createElement('style');
        style.innerHTML = `
      @keyframes scan {
        0% { top: 5%; }
        100% { top: 95%; }
      }
      @keyframes pulseWave {
        100% { stroke-dashoffset: 0; }
      }
    `;
        document.head.appendChild(style);

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.protocol-card');

            cards.forEach((card, i) => {
                if (i < cards.length - 1) {
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 10%",
                        pin: true,
                        pinSpacing: false,
                        scrub: true,
                        animation: gsap.to(card, {
                            scale: 0.9,
                            filter: "blur(10px)",
                            opacity: 0.6,
                            ease: "none"
                        })
                    });
                }
            });
        }, containerRef);

        return () => {
            ctx.revert();
            document.head.removeChild(style);
        };
    }, []);

    return (
        <section id="protocol" ref={containerRef} className="relative w-full bg-background mt-[-3rem] pt-32 pb-16 rounded-t-[3rem] z-30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 text-center">
                    <div className="font-data text-xs text-accent tracking-[0.2em] uppercase mb-6 flex items-center justify-center gap-3">
                        <span className="w-8 h-[1px] bg-accent/50 block"></span>
                        03 — The Protocol
                        <span className="w-8 h-[1px] bg-accent/50 block"></span>
                    </div>
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-primary tracking-tight">
                        The <span className="font-drama italic text-accent pr-2">Protocol.</span>
                    </h2>
                </div>

                <div className="relative">
                    {PROTOCOL_STEPS.map((step, i) => (
                        <div
                            key={i}
                            className="protocol-card h-[80vh] w-full flex items-center justify-center sticky top-[10%] mt-8"
                        >
                            <div className="w-full max-w-5xl h-full bg-primary rounded-[3rem] border border-text-dark/10 shadow-2xl overflow-hidden flex flex-col md:flex-row will-change-transform">
                                <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-12 md:p-20 relative z-10">
                                    <div className="font-data text-accent text-lg mb-6 tracking-widest">{step.num}</div>
                                    <h3 className="font-heading font-bold text-4xl md:text-5xl text-text-light mb-6 leading-tight">
                                        {step.title}
                                    </h3>
                                    <p className="font-heading text-lg text-text-light/70 leading-relaxed max-w-md">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="w-full md:w-1/2 h-full bg-[#0A0A10] border-l border-text-light/5 flex items-center justify-center p-12 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 to-transparent z-0" />
                                    <div className="relative z-10 w-full max-w-[300px] aspect-square">
                                        <step.Animation />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
