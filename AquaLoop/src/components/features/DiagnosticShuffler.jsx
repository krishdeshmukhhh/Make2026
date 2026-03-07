import { useState, useEffect } from 'react';

const SHUFFLE_ITEMS = [
    { id: 1, label: "Real-Time Path Routing", status: "Active" },
    { id: 2, label: "Continuous Quality Sensing", status: "Scanning" },
    { id: 3, label: "Automated Batch Direction", status: "Optimized" }
];

export default function DiagnosticShuffler() {
    const [items, setItems] = useState(SHUFFLE_ITEMS);

    useEffect(() => {
        const interval = setInterval(() => {
            setItems(prev => {
                const newItems = [...prev];
                const last = newItems.pop();
                newItems.unshift(last);
                return newItems;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-48 w-full flex items-center justify-center mt-6">
            {items.map((item, index) => {
                const isTop = index === 0;
                const isMiddle = index === 1;

                // Stacking visual parameters
                let yOffset = isTop ? 0 : isMiddle ? 16 : 32;
                let scale = isTop ? 1 : isMiddle ? 0.95 : 0.9;
                let opacity = isTop ? 1 : isMiddle ? 0.7 : 0.4;
                let zIndex = 30 - index;

                return (
                    <div
                        key={item.id}
                        className="absolute w-[90%] bg-primary border border-text-light/10 p-5 rounded-xl shadow-xl flex justify-between items-center top-0 origin-top"
                        style={{
                            transform: `translateY(${yOffset}px) scale(${scale})`,
                            opacity,
                            zIndex,
                            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        <span className="font-heading font-semibold text-sm text-text-light">{item.label}</span>
                        <span className={`font-data text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-background/5 ${isTop ? 'text-accent border border-accent/20' : 'text-text-light/30'}`}>
                            {item.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
