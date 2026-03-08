import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export default function Hero() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-elem', {
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.2
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-[100dvh] w-full flex flex-col justify-end pb-24 px-6 md:px-16 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/semiconductor2.webp')" }}
            />
            {/* Heavy primary-to-black gradient overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary via-primary/80 to-primary/20" />

            {/* Content pushed to bottom-left */}
            <div className="relative z-20 max-w-4xl hero-content">
                <h1 className="flex flex-col gap-2">
                    <span className="hero-elem font-heading font-bold text-4xl md:text-6xl text-text-light tracking-tight">
                        Water reuse meets
                    </span>
                    <span className="hero-elem font-drama italic text-7xl md:text-9xl text-accent -ml-1">
                        Precision.
                    </span>
                </h1>
                <p className="hero-elem font-heading text-lg md:text-xl text-text-light/80 max-w-2xl mt-8 leading-relaxed">
                    AquaLoop — smart water reuse for semiconductor fabs, turning single‑use ultrapure rinse water into a closed, data‑driven reclamation loop.
                </p>

                {/* Dual CTAs */}
                <div className="hero-elem mt-10 flex flex-wrap items-center gap-4">
                    <Link to="/simulation" className="inline-flex items-center gap-2 btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg hover:bg-opacity-90 transition-colors">
                        Run the live loop
                        <span className="text-xl">→</span>
                    </Link>
                    <Link to="/analytics" className="inline-flex items-center gap-2 bg-text-light/10 backdrop-blur-sm text-text-light border border-text-light/20 px-6 py-4 rounded-full font-heading font-semibold text-base hover:bg-text-light/20 transition-colors">
                        <BarChart3 size={18} />
                        Inspect the data
                    </Link>
                </div>

                {/* Live Prototype Badge */}
                <div className="hero-elem mt-8 inline-flex items-center gap-3 bg-primary/60 backdrop-blur-md border border-text-light/10 px-4 py-2.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    <span className="font-data text-[11px] uppercase tracking-widest text-text-light/80">
                        Live prototype — powered by real sensor data from our tabletop loop
                    </span>
                </div>
            </div>
        </section>
    );
}
