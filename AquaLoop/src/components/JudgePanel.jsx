import { useState } from 'react';
import { X } from 'lucide-react';

export default function JudgePanel({ bullets }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const defaultBullets = [
        "Live sensor readings from our Arduino prototype rig.",
        "Real-time routing decisions (min / med / max classification).",
        "Calculated reuse %, gallons saved vs. single-use baseline."
    ];

    const items = bullets || defaultBullets;

    return (
        <div className="fixed bottom-6 right-6 z-[90] w-80 bg-primary/95 backdrop-blur-xl border border-text-light/10 rounded-2xl p-5 shadow-2xl animate-[slideUp_0.5s_ease-out]">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <h4 className="font-heading font-bold text-sm text-text-light">Judge View</h4>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-text-light/40 hover:text-text-light transition-colors p-1"
                    aria-label="Dismiss"
                >
                    <X size={14} />
                </button>
            </div>
            <p className="font-data text-[10px] uppercase tracking-widest text-text-light/40 mb-3">What to look for</p>
            <ul className="space-y-2">
                {items.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="font-data text-accent text-xs mt-0.5">▸</span>
                        <span className="font-heading text-xs text-text-light/80 leading-relaxed">{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
