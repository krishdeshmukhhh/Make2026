import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CursorProtocolScheduler() {
    const containerRef = useRef(null);
    const cursorRef = useRef(null);
    const targetDayRef = useRef(null);
    const saveBtnRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

            tl.set(cursorRef.current, { x: 200, y: 150, opacity: 0 })
                .set(targetDayRef.current, { backgroundColor: 'transparent', color: 'rgba(240, 239, 244, 0.4)', scale: 1 })
                // Cursor enters
                .to(cursorRef.current, { x: 120, y: 30, opacity: 1, duration: 1, ease: 'power2.out' })
                // Hover Wednesday (index 3)
                .to(cursorRef.current, { x: 154, y: 22, duration: 0.8, ease: 'power2.inOut' })
                // Click down on day
                .to(targetDayRef.current, { scale: 0.9, duration: 0.1 })
                .to(targetDayRef.current, { backgroundColor: '#C9A84C', color: '#0D0D12', duration: 0.1 }, "<")
                // Click up
                .to(targetDayRef.current, { scale: 1, duration: 0.1 })
                // Move to save button
                .to(cursorRef.current, { x: 220, y: 115, duration: 0.8, delay: 0.3, ease: 'power2.inOut' })
                // Click save
                .to(saveBtnRef.current, { scale: 0.95, duration: 0.1 })
                .to(saveBtnRef.current, { backgroundColor: '#C9A84C', color: '#0D0D12', duration: 0.1 }, "<")
                .to(saveBtnRef.current, { scale: 1, duration: 0.1 })
                .to(saveBtnRef.current, { backgroundColor: 'transparent', color: 'rgba(240, 239, 244, 0.5)', duration: 0.4, delay: 0.2 })
                // Fade out
                .to(cursorRef.current, { opacity: 0, duration: 0.5, delay: 0.3 });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-[180px] bg-primary rounded-xl p-5 overflow-hidden border border-text-dark/10 shadow-inner flex flex-col justify-between mt-6">
            <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div
                        key={i}
                        ref={i === 3 ? targetDayRef : null}
                        className="aspect-square bg-background/5 border border-text-light/5 rounded flex items-center justify-center font-data text-[10px] text-text-light/40 transition-colors"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between items-end border-t border-text-light/10 pt-4">
                <div className="space-y-2">
                    <div className="h-1.5 w-16 bg-text-light/10 rounded-full" />
                    <div className="h-1.5 w-24 bg-text-light/5 rounded-full" />
                </div>
                <div
                    ref={saveBtnRef}
                    className="border border-text-light/20 text-text-light/50 font-heading text-[10px] px-4 py-1.5 rounded uppercase tracking-wider origin-center"
                >
                    Save
                </div>
            </div>

            {/* GSAP animated cursor */}
            <svg
                ref={cursorRef}
                className="absolute w-6 h-6 text-text-light z-10 drop-shadow-xl"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
            >
                <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.3 1-3.2-7.4-4.4 5.2z" />
            </svg>
        </div>
    );
}
