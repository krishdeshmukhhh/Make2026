import { useState, useEffect } from 'react';

const FULL_TEXT = `INIT SEQUENCE...
> SENSING QUALITY... [OK]
> MAXIMIZING SAFE REUSE...
> PROCESS WATER: OPTIMIZED
> UTILITY WATER: OPTIMIZED
> FRESHWATER DRAW: -47%
AQUALOOP ACTIVE.`;

export default function TelemetryTypewriter() {
    const [text, setText] = useState('');

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(FULL_TEXT.slice(0, i));
            i++;
            if (i > FULL_TEXT.length + 20) {
                // Pause before looping
                i = 0;
                setText('');
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[180px] bg-primary rounded-xl p-5 overflow-hidden border border-text-dark/10 shadow-inner flex flex-col mt-6">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-text-light/10">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                <span className="font-data text-[10px] text-text-light/60 uppercase tracking-widest">Live Feed</span>
            </div>
            <div className="font-data text-xs text-text-light/90 whitespace-pre-line leading-relaxed">
                {text}<span className="inline-block w-2.5 h-3.5 bg-accent animate-pulse ml-1 align-middle" />
            </div>
        </div>
    );
}
