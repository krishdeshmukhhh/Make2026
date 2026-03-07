import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
    const navRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                start: 50,
                toggleClass: {
                    className: 'scrolled',
                    targets: navRef.current
                }
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <nav
            ref={navRef}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 rounded-[2rem] px-6 py-3 flex items-center justify-between w-[90%] max-w-5xl bg-transparent text-text-light [&.scrolled]:bg-primary/80 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border [&.scrolled]:border-text-light/10 [&.scrolled]:shadow-2xl"
        >
            <div className="font-heading font-bold text-xl tracking-tight cursor-pointer">AquaLoop</div>

            <div className="hidden md:flex items-center gap-8 font-heading text-sm font-medium">
                <a href="#features" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Features</a>
                <a href="#philosophy" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Philosophy</a>
                <a href="#protocol" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Protocol</a>
            </div>

            <a href="#demo" className="btn-magnetic bg-accent text-primary px-5 py-2 w-max rounded-full font-heading font-semibold text-sm transition-colors hover:bg-opacity-90">
                See the live demo
            </a>
        </nav>
    );
}
