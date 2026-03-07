import { useState, useEffect, useCallback } from 'react';

const USE_MOCK_DATA = true; // Set to false to use WebSocket
const WS_URL = 'ws://localhost:8080/ws/aqualoop'; // Replace with actual backend WS URL

const PROCESS_IDS = ['processA', 'processB', 'processC'];

// Helper to determine class based on purity/turbidity
function determineClass(turbidity, tds) {
    if (turbidity < 1.0 && tds < 50) return 'min'; // High-grade reuse
    if (turbidity < 5.0 && tds < 200) return 'med'; // Utility Loop
    return 'max'; // Treatment / Discharge
}

let globalSimulatorState = {
    processA: { volume: 0, batchNo: 1 },
    processB: { volume: 0, batchNo: 1 },
    processC: { volume: 0, batchNo: 1 }
};

export function generateMockReading(processId) {
    const baseTurbidity = processId === 'processA' ? 0.5 : processId === 'processB' ? 3.0 : 8.0;
    const baseTDS = processId === 'processA' ? 30 : processId === 'processB' ? 120 : 350;

    const turbidity = Math.max(0, baseTurbidity + (Math.random() * 2 - 1));
    const tds = Math.max(0, Math.floor(baseTDS + (Math.random() * 40 - 20)));

    // Simulate batch logic: tank fills up to ~100L then empties and increments batch
    const inFlowLpm = parseFloat((0.8 + Math.random() * 0.2).toFixed(2));
    const outFlowLpm = parseFloat((0.8 + Math.random() * 0.2).toFixed(2));

    // Assuming this function is called roughly every second during live gen
    // We add incoming flow to the simulated tank
    globalSimulatorState[processId].volume += (inFlowLpm / 60);

    if (globalSimulatorState[processId].volume >= 5.0) { // Keep the demo quick (5L per batch)
        globalSimulatorState[processId].volume = 0;
        globalSimulatorState[processId].batchNo += 1;
    }

    return {
        timestamp: Date.now(),
        processId,
        batchNo: `BAT-${String(globalSimulatorState[processId].batchNo).padStart(4, '0')}`,
        turbidity: parseFloat(turbidity.toFixed(2)),
        tds,
        temp: parseFloat((25 + Math.random() * 5).toFixed(1)),
        ph: parseFloat((7.0 + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        class: determineClass(turbidity, tds),
        inFlowLpm,
        outFlowLpm,
    };
}

export function useAquaLoopData(maxHistory = 100) {
    const [latestByProcess, setLatestByProcess] = useState({});
    const [historyByProcess, setHistoryByProcess] = useState({
        processA: [],
        processB: [],
        processC: []
    });

    const handleNewReading = useCallback((reading) => {
        setLatestByProcess(prev => ({
            ...prev,
            [reading.processId]: reading
        }));

        setHistoryByProcess(prev => {
            const processHistory = prev[reading.processId] || [];
            const updatedHistory = [...processHistory, reading].slice(-maxHistory);
            return {
                ...prev,
                [reading.processId]: updatedHistory
            };
        });
    }, [maxHistory]);

    useEffect(() => {
        if (USE_MOCK_DATA) {
            // Initialize with some historical data for better initial charts
            const initialHistory = { processA: [], processB: [], processC: [] };
            const initialLatest = {};
            const now = Date.now();

            PROCESS_IDS.forEach(pid => {
                for (let i = maxHistory; i > 0; i--) {
                    const reading = generateMockReading(pid);
                    reading.timestamp = now - (i * 2000); // 2 seconds apart
                    initialHistory[pid].push(reading);
                }
                initialLatest[pid] = initialHistory[pid][initialHistory[pid].length - 1];
            });

            setHistoryByProcess(initialHistory);
            setLatestByProcess(initialLatest);

            // Start live generation
            const interval = setInterval(() => {
                const randomProcess = PROCESS_IDS[Math.floor(Math.random() * PROCESS_IDS.length)];
                handleNewReading(generateMockReading(randomProcess));
            }, 1000); // New reading every second for one of the processes

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
                        console.error('Failed to parse WS message:', e);
                    }
                };

                ws.onclose = () => {
                    console.log('WS disconnected, reconnecting...');
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
                    ws.onclose = null; // Prevent reconnect on intentional unmount
                    ws.close();
                }
            };
        }
    }, [handleNewReading, maxHistory]);

    // Derived aggregations for analytics
    const getAggregatedStats = (processId) => {
        const history = historyByProcess[processId] || [];
        if (history.length === 0) return { totalInVolume: 0, classVolumes: { min: 0, med: 0, max: 0 } };

        let totalInVolume = 0;
        const classVolumes = { min: 0, med: 0, max: 0 };

        // Simple integration: volume = flow_rate (L/min) * time_delta (minutes)
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const curr = history[i];
            const timeDeltaMin = (curr.timestamp - prev.timestamp) / 1000 / 60; // in minutes

            const volumeIn = curr.inFlowLpm * timeDeltaMin;
            totalInVolume += volumeIn;

            const volumeOut = curr.outFlowLpm * timeDeltaMin;
            if (classVolumes[curr.class] !== undefined) {
                classVolumes[curr.class] += volumeOut;
            }
        }

        return { totalInVolume, classVolumes };
    };

    return {
        latestByProcess,
        historyByProcess,
        getAggregatedStats,
        availableProcesses: PROCESS_IDS,
        isConnected: USE_MOCK_DATA ? true : false // Real connection state would be managed in the websocket block
    };
}
