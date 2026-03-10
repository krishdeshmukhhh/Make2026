import { useEffect, useRef } from "react";
import { X, AlertTriangle, AlertOctagon } from "lucide-react";
import { useAquaLoopData } from "../hooks/useAquaLoopData";
import { useLocation } from "react-router-dom";

const PROCESS_LABELS = {
  processA: "Process A",
  processB: "Process B",
  processC: "Process C",
};

export default function AlertToast() {
  const { alerts, dismissAlert } = useAquaLoopData();
  const audioRef = useRef(null);
  // 🚫 Disable alerts on demo/video page
  if (location.pathname === "/demo") {
    return null;
  }

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[0];
    const timer = setTimeout(() => dismissAlert(latest.id), 8000);
    return () => clearTimeout(timer);
  }, [alerts, dismissAlert]);

  // Only show the most recent 3
  const visible = alerts.slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[80] flex flex-col gap-3 w-80">
      {visible.map((alert, i) => {
        const isCritical = alert.severity === "critical";
        return (
          <div
            key={alert.id}
            className={`
                            flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl
                            animate-[slideIn_0.3s_ease-out]
                            ${
                              isCritical
                                ? "bg-red-950/90 border-red-500/30 text-red-100"
                                : "bg-amber-950/90 border-amber-500/30 text-amber-100"
                            }
                        `}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={`mt-0.5 ${isCritical ? "text-red-400" : "text-amber-400"}`}
            >
              {isCritical ? (
                <AlertOctagon size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-heading text-[10px] uppercase tracking-widest font-bold ${isCritical ? "text-red-400" : "text-amber-400"}`}
                >
                  {alert.severity}
                </span>
                <span className="font-data text-[10px] opacity-50">
                  {PROCESS_LABELS[alert.processId] || alert.processId}
                </span>
              </div>
              <p className="font-heading text-sm font-semibold">
                {alert.metric} spike:{" "}
                <span className="font-data">
                  {alert.value}
                  {alert.unit}
                </span>
              </p>
              <p className="font-data text-[10px] opacity-50 mt-1">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="opacity-40 hover:opacity-100 transition-opacity p-1"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
