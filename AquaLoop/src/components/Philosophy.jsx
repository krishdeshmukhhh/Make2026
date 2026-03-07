import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax background
            gsap.to('.parallax-bg', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: 100,
                ease: 'none'
            });

            // Text reveal
            gsap.from('.reveal-line', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 60%'
                },
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="philosophy" ref={containerRef} className="relative w-full py-48 md:py-64 overflow-hidden bg-primary flex items-center justify-center rounded-t-[3rem] -mt-12 z-20">
            {/* Background Parallax */}
            <div
                className="parallax-bg absolute inset-[-150px] z-0 opacity-[0.15] bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/50 to-primary/80" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <div className="reveal-line font-heading text-lg md:text-2xl text-text-light/60 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Most fabs focus on linear water consumption and rigid discharge.
                </div>
                <h2 className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl text-text-light tracking-tighter leading-tight flex flex-col gap-4">
                    <span className="reveal-line">We focus on</span>
                    <span className="reveal-line font-drama italic text-accent pr-4">dynamic loop closure.</span>
                </h2>
            </div>
        </section>
    );
}
