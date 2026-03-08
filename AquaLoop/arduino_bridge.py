import asyncio
import websockets
import serial
import json
import time

# --- CONFIGURATION ---
SERIAL_PORT = '/dev/cu.usbmodem11101'  # Change this to your Arduino's serial port (e.g., /dev/ttyACM0 on Mac/Linux)
BAUD_RATE = 115200
WS_HOST = 'localhost'
WS_PORT = 8080
# ---------------------

def determine_class(turbidity, tds, temp, ph):
    """
    Multi-feature water quality scoring.
    Returns 'min' (High-grade Reuse), 'med' (Utility Loop), or 'max' (Treatment/Discharge).

    Scoring uses WHO-aligned thresholds:
      - Turbidity: < 1 NTU excellent, < 4 NTU acceptable, > 4 degraded
      - TDS: < 300 ppm excellent, < 500 acceptable (WHO limit), > 500 poor
      - Temp: 15-30°C ideal, outside that range penalized
      - pH: 6.5-8.5 safe, outside that range penalized
    """
    score = 0.0

    # --- Turbidity (40% weight) ---
    if turbidity < 1.0:
        score += 40       # excellent clarity
    elif turbidity < 4.0:
        score += 25       # acceptable
    elif turbidity < 7.0:
        score += 10       # degraded
    # else: 0 — very turbid

    # --- TDS (25% weight) ---
    if tds < 300:
        score += 25       # excellent
    elif tds < 500:
        score += 18       # normal tap water (WHO safe)
    elif tds < 800:
        score += 8        # elevated
    # else: 0 — very high

    # --- Temperature (15% weight) ---
    if 15 <= temp <= 30:
        score += 15       # ideal process range
    elif 10 <= temp <= 40:
        score += 8        # acceptable
    # else: 0 — extreme

    # --- pH (20% weight) ---
    if 6.5 <= ph <= 8.5:
        score += 20       # safe
    elif 5.5 <= ph <= 9.5:
        score += 10       # borderline
    # else: 0 — dangerous

    # --- Classify ---
    if score >= 70:
        return 'min'  # High-grade Reuse
    elif score >= 40:
        return 'med'  # Utility Loop
    else:
        return 'max'  # Treatment / Discharge

async def read_serial_and_broadcast(websocket):
    print(f"\n[+] Frontend connected! Opening {SERIAL_PORT} at {BAUD_RATE} baud...")
    
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        # Give Arduino time to reset after opening serial
        time.sleep(2) 
    except Exception as e:
        print(f"[-] Error opening serial port: {e}")
        return

    try:
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                if line:
                    try:
                        # Assuming Arduino sends a simple comma-separated string:
                        # turbidity,tds,temp,ph,inFlow,outFlow
                        # Example: 1.25,45,24.5,7.1,0.85,0.85
                        
                        parts = line.split(',')
                        if len(parts) >= 6:
                            turbidity = float(parts[0])
                            tds = int(parts[1])
                            temp = float(parts[2])
                            ph = float(parts[3])
                            in_flow = float(parts[4])
                            out_flow = float(parts[5])
                        else:
                            # If it's not CSV, you could also parse JSON here if your Arduino sends JSON strings
                            print(f"[!] Skipping malformed line: {line}")
                            continue

                        # Construct the exact JSON payload the React frontend expects
                        payload = {
                            "processId": "processA",
                            "timestamp": int(time.time() * 1000),
                            "turbidity": turbidity,
                            "tds": tds,
                            "temp": temp,
                            "ph": ph,
                            "class": determine_class(turbidity, tds, temp, ph),
                            "inFlowLpm": in_flow,
                            "outFlowLpm": out_flow
                        }
                        
                        json_str = json.dumps(payload)
                        print(f"--> Sending: {json_str}")
                        await websocket.send(json_str)
                        
                    except Exception as parse_err:
                        print(f"[-] Error parsing line '{line}': {parse_err}")
                        
            # Yield control to the event loop to prevent blocking
            await asyncio.sleep(0.01) 
            
    except websockets.exceptions.ConnectionClosed:
        print("\n[-] Frontend disconnected.")
    finally:
        ser.close()

async def main():
    print(f"[*] Starting AquaLoop WebSocket bridge on ws://{WS_HOST}:{WS_PORT}/ws/aqualoop")
    print(f"[*] Waiting for React dashboard to connect...")
    async with websockets.serve(read_serial_and_broadcast, WS_HOST, WS_PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[*] Shutting down bridge.")
