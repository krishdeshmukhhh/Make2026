import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
    const navRef = useRef(null);
    const { pathname } = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // If not on home page, force a lightly styled background immediately or keep it morphing on scroll
        // Better to just morph on scroll everywhere so it's consistent.

        const onScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', onScroll);
        // Initial check
        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 rounded-[2rem] px-6 py-3 flex items-center justify-between w-[90%] max-w-5xl text-text-light ${isScrolled || pathname !== '/' ? 'bg-primary/80 backdrop-blur-xl border border-text-light/10 shadow-2xl' : 'bg-transparent'}`}
        >
            <Link to="/" className="font-heading font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
                AquaLoop
            </Link>

            <div className="hidden md:flex items-center gap-8 font-heading text-sm font-medium">
                {pathname === '/' ? (
                    <>
                        <a href="#features" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Features</a>
                        <a href="#philosophy" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Philosophy</a>
                        <a href="#protocol" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Protocol</a>
                    </>
                ) : (
                    <>
                        <Link to="/#features" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Features</Link>
                        <Link to="/#philosophy" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Philosophy</Link>
                        <Link to="/#protocol" className="link-hover text-text-light/80 hover:text-text-light transition-colors">Protocol</Link>
                    </>
                )}
                <div className="w-[1px] h-4 bg-text-light/20" />
                <Link to="/simulation" className={`link-hover transition-colors ${pathname === '/simulation' ? 'text-accent' : 'text-text-light/80 hover:text-text-light'}`}>Simulation</Link>
                <Link to="/analytics" className={`link-hover transition-colors ${pathname === '/analytics' ? 'text-accent' : 'text-text-light/80 hover:text-text-light'}`}>Analytics</Link>
            </div>

            {pathname === '/' ? (
                <a href="#demo" className="btn-magnetic bg-accent text-primary px-5 py-2 w-max rounded-full font-heading font-semibold text-sm transition-colors hover:bg-opacity-90">
                    See the live demo
                </a>
            ) : (
                <Link to="/simulation" className="btn-magnetic bg-accent text-primary px-5 py-2 w-max rounded-full font-heading font-semibold text-sm transition-colors hover:bg-opacity-90">
                    Live Data View
                </Link>
            )}
        </nav>
    );
}
