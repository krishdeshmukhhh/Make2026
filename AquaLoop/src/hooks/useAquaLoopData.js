import { useState, useEffect, useCallback, createContext, useContext, createElement } from "react";

const USE_MOCK_DATA = false; // Set to false to use WebSocket
const WS_URL = "ws://localhost:8080/ws/aqualoop"; // Replace with actual backend WS URL

const PROCESS_IDS = ["processA", "processB", "processC"];

// Spike thresholds — if a reading exceeds these, fire an alert
const SPIKE_THRESHOLDS = {
  turbidity: { warn: 5.0, critical: 8.0, label: "Turbidity", unit: "NTU" },
  tds: { warn: 400, critical: 700, label: "TDS", unit: "ppm" },
  temp: { warn: 35, critical: 42, label: "Temperature", unit: "°C" },
  ph_low: { warn: 5.5, critical: 4.5, label: "pH (Low)", unit: "" },
  ph_high: { warn: 9.0, critical: 10.0, label: "pH (High)", unit: "" },
};

// Multi-feature water quality scoring (matches arduino_bridge.py)
function determineClass(turbidity, tds, temp, ph) {
  let score = 0;

  if (turbidity < 1.0) score += 40;
  else if (turbidity < 4.0) score += 25;
  else if (turbidity < 7.0) score += 10;

  if (tds < 300) score += 25;
  else if (tds < 500) score += 18;
  else if (tds < 800) score += 8;

  if (temp >= 15 && temp <= 30) score += 15;
  else if (temp >= 10 && temp <= 40) score += 8;

  if (ph >= 6.5 && ph <= 8.5) score += 20;
  else if (ph >= 5.5 && ph <= 9.5) score += 10;

  if (score >= 70) return "min";
  if (score >= 40) return "med";
  return "max";
}

let globalSimulatorState = {
  processA: { volume: 0, batchNo: 1 },
  processB: { volume: 0, batchNo: 1 },
  processC: { volume: 0, batchNo: 1 },
};

export function generateMockReading(processId) {
  const baseTurbidity =
    processId === "processA" ? 0.5 : processId === "processB" ? 3.0 : 8.0;
  const baseTDS =
    processId === "processA" ? 30 : processId === "processB" ? 120 : 350;

  const turbidity = Math.max(0, baseTurbidity + (Math.random() * 2 - 1));
  const tds = Math.max(0, Math.floor(baseTDS + (Math.random() * 40 - 20)));

  const inFlowLpm = parseFloat((0.8 + Math.random() * 0.2).toFixed(2));
  const outFlowLpm = parseFloat((0.8 + Math.random() * 0.2).toFixed(2));

  globalSimulatorState[processId].volume += inFlowLpm / 60;

  if (globalSimulatorState[processId].volume >= 5.0) {
    globalSimulatorState[processId].volume = 0;
    globalSimulatorState[processId].batchNo += 1;
  }

  const temp = parseFloat((25 + Math.random() * 5).toFixed(1));
  const ph = parseFloat((7.0 + (Math.random() * 0.4 - 0.2)).toFixed(2));

  return {
    timestamp: Date.now(),
    processId,
    batchNo: `BAT-${String(globalSimulatorState[processId].batchNo).padStart(4, "0")}`,
    turbidity: parseFloat(turbidity.toFixed(2)),
    tds,
    temp,
    ph,
    class: determineClass(turbidity, tds, temp, ph),
    inFlowLpm,
    outFlowLpm,
  };
}

// ─── Spike detection ───

function detectSpikes(reading) {
  const alerts = [];

  if (reading.turbidity >= SPIKE_THRESHOLDS.turbidity.critical) {
    alerts.push({ severity: "critical", metric: "Turbidity", value: reading.turbidity, unit: "NTU", processId: reading.processId });
  } else if (reading.turbidity >= SPIKE_THRESHOLDS.turbidity.warn) {
    alerts.push({ severity: "warning", metric: "Turbidity", value: reading.turbidity, unit: "NTU", processId: reading.processId });
  }

  if (reading.tds >= SPIKE_THRESHOLDS.tds.critical) {
    alerts.push({ severity: "critical", metric: "TDS", value: reading.tds, unit: "ppm", processId: reading.processId });
  } else if (reading.tds >= SPIKE_THRESHOLDS.tds.warn) {
    alerts.push({ severity: "warning", metric: "TDS", value: reading.tds, unit: "ppm", processId: reading.processId });
  }

  if (reading.temp >= SPIKE_THRESHOLDS.temp.critical) {
    alerts.push({ severity: "critical", metric: "Temp", value: reading.temp, unit: "°C", processId: reading.processId });
  } else if (reading.temp >= SPIKE_THRESHOLDS.temp.warn) {
    alerts.push({ severity: "warning", metric: "Temp", value: reading.temp, unit: "°C", processId: reading.processId });
  }

  if (reading.ph <= SPIKE_THRESHOLDS.ph_low.critical) {
    alerts.push({ severity: "critical", metric: "pH", value: reading.ph, unit: "", processId: reading.processId });
  } else if (reading.ph <= SPIKE_THRESHOLDS.ph_low.warn) {
    alerts.push({ severity: "warning", metric: "pH", value: reading.ph, unit: "", processId: reading.processId });
  } else if (reading.ph >= SPIKE_THRESHOLDS.ph_high.critical) {
    alerts.push({ severity: "critical", metric: "pH", value: reading.ph, unit: "", processId: reading.processId });
  } else if (reading.ph >= SPIKE_THRESHOLDS.ph_high.warn) {
    alerts.push({ severity: "warning", metric: "pH", value: reading.ph, unit: "", processId: reading.processId });
  }

  return alerts;
}

// ─── Browser notifications (best for when user is in another tab or app) ───
// Best practice: in-app toasts (AlertToast) + browser notifications so users
// see threshold alerts even when the dashboard tab isn’t focused.
function notifyBrowser(alert) {
  if (typeof window === "undefined" || !window.Notification) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(`AquaLoop: ${alert.severity}`, {
        body: `${alert.metric} ${alert.severity}: ${alert.value}${alert.unit}`,
        tag: `aqualoop-${alert.id}`,
        requireInteraction: alert.severity === "critical",
      });
    } catch (_) {}
    return;
  }
  if (Notification.permission === "default") {
    Notification.requestPermission().then((p) => {
      if (p === "granted" && alert) {
        try {
          new Notification(`AquaLoop: ${alert.severity}`, {
            body: `${alert.metric} ${alert.severity}: ${alert.value}${alert.unit}`,
            tag: `aqualoop-${alert.id}`,
          });
        } catch (_) {}
      }
    });
  }
}

// ─── Context-based provider so data persists across route changes ───

const AquaLoopContext = createContext(null);

let alertIdCounter = 0;

export function AquaLoopProvider({ children, maxHistory = 100 }) {
  const [latestByProcess, setLatestByProcess] = useState({});
  const [historyByProcess, setHistoryByProcess] = useState({
    processA: [],
    processB: [],
    processC: [],
  });
  const [alerts, setAlerts] = useState([]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleNewReading = useCallback(
    (reading) => {
      setLatestByProcess((prev) => ({
        ...prev,
        [reading.processId]: reading,
      }));

      setHistoryByProcess((prev) => {
        const processHistory = prev[reading.processId] || [];
        const updatedHistory = [...processHistory, reading].slice(-maxHistory);
        return {
          ...prev,
          [reading.processId]: updatedHistory,
        };
      });

      // Detect spikes and create alerts (in-app toasts + browser notifications)
      const newSpikes = detectSpikes(reading);
      if (newSpikes.length > 0) {
        const timestamped = newSpikes.map((spike) => ({
          ...spike,
          id: ++alertIdCounter,
          timestamp: reading.timestamp,
        }));
        setAlerts((prev) => [...timestamped, ...prev].slice(0, 20)); // keep last 20
        // Browser notification for first/new spike so user sees it when tab is in background
        const first = timestamped[0];
        if (first) notifyBrowser(first);
      }
    },
    [maxHistory],
  );

  useEffect(() => {
    if (USE_MOCK_DATA) {
      const initialHistory = { processA: [], processB: [], processC: [] };
      const initialLatest = {};
      const now = Date.now();

      PROCESS_IDS.forEach((pid) => {
        for (let i = maxHistory; i > 0; i--) {
          const reading = generateMockReading(pid);
          reading.timestamp = now - i * 2000;
          initialHistory[pid].push(reading);
        }
        initialLatest[pid] =
          initialHistory[pid][initialHistory[pid].length - 1];
      });

      setHistoryByProcess(initialHistory);
      setLatestByProcess(initialLatest);

      const interval = setInterval(() => {
        const randomProcess =
          PROCESS_IDS[Math.floor(Math.random() * PROCESS_IDS.length)];
        handleNewReading(generateMockReading(randomProcess));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      let ws;
      let reconnectTimer;

      const connect = () => {
        ws = new WebSocket(WS_URL);

        ws.onmessage = (event) => {
          try {
            const reading = JSON.parse(event.data);
            handleNewReading(reading);
          } catch (e) {
            console.error("Failed to parse WS message:", e);
          }
        };

        ws.onclose = () => {
          console.log("WS disconnected, reconnecting...");
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.error("WS error: ", err);
          ws.close();
        };
      };

      connect();

      return () => {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (ws) {
          ws.onclose = null;
          ws.close();
        }
      };
    }
  }, [handleNewReading, maxHistory]);

  const getAggregatedStats = (processId) => {
    const history = historyByProcess[processId] || [];
    if (history.length === 0)
      return { totalInVolume: 0, classVolumes: { min: 0, med: 0, max: 0 } };

    let totalInVolume = 0;
    const classVolumes = { min: 0, med: 0, max: 0 };

    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      const timeDeltaMin = (curr.timestamp - prev.timestamp) / 1000 / 60;

      const volumeIn = curr.inFlowLpm * timeDeltaMin;
      totalInVolume += volumeIn;

      const volumeOut = curr.outFlowLpm * timeDeltaMin;
      if (classVolumes[curr.class] !== undefined) {
        classVolumes[curr.class] += volumeOut;
      }
    }

    return { totalInVolume, classVolumes };
  };

  const value = {
    latestByProcess,
    historyByProcess,
    getAggregatedStats,
    availableProcesses: PROCESS_IDS,
    isConnected: USE_MOCK_DATA ? true : false,
    alerts,
    dismissAlert,
  };

  return createElement(AquaLoopContext.Provider, { value }, children);
}

export function useAquaLoopData() {
  const ctx = useContext(AquaLoopContext);
  if (!ctx) {
    throw new Error("useAquaLoopData must be used within an <AquaLoopProvider>");
  }
  return ctx;
}
