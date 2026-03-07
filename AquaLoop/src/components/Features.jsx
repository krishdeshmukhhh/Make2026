import DiagnosticShuffler from './features/DiagnosticShuffler';
import TelemetryTypewriter from './features/TelemetryTypewriter';
import CursorProtocolScheduler from './features/CursorProtocolScheduler';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.feature-card', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="features" ref={containerRef} className="py-40 px-6 md:px-16 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="mb-24 feature-card">
                    <h2 className="font-heading font-bold text-4xl md:text-6xl text-primary tracking-tight">
                        The Logic of <span className="font-drama italic text-accent pr-2">Efficiency.</span>
                    </h2>
                    <p className="font-heading text-lg md:text-xl text-text-dark/70 mt-6 max-w-2xl leading-relaxed">
                        Our hardware-software integration transforms rinse water management from a blind drain into an intelligent, responsive system.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="feature-card bg-background border border-text-dark/5 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] flex flex-col hover:-translate-y-2 transition-transform duration-500 ease-out">
                        <h3 className="font-heading font-bold text-2xl text-primary mb-4 leading-snug">Real‑time Sensing<br />& Routing</h3>
                        <p className="font-heading text-base text-text-dark/70 mb-8 flex-grow">
                            Continuously measures water quality and automatically directs each batch to the right reuse loop.
                        </p>
                        <DiagnosticShuffler />
                    </div>

                    <div className="feature-card bg-background border border-text-dark/5 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] flex flex-col hover:-translate-y-2 transition-transform duration-500 ease-out">
                        <h3 className="font-heading font-bold text-2xl text-primary mb-4 leading-snug">Higher Reuse,<br />Lower Draw</h3>
                        <p className="font-heading text-base text-text-dark/70 mb-8 flex-grow">
                            Maximizes safe reuse for process and utility water, cutting overall freshwater consumption.
                        </p>
                        <TelemetryTypewriter />
                    </div>

                    <div className="feature-card bg-background border border-text-dark/5 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] flex flex-col hover:-translate-y-2 transition-transform duration-500 ease-out">
                        <h3 className="font-heading font-bold text-2xl text-primary mb-4 leading-snug">Fab‑ready<br />Analytics</h3>
                        <p className="font-heading text-base text-text-dark/70 mb-8 flex-grow">
                            Gives engineers clear dashboards for reuse %, gallons saved, and per‑tool water footprints.
                        </p>
                        <CursorProtocolScheduler />
                    </div>
                </div>
            </div>
        </section>
    );
}