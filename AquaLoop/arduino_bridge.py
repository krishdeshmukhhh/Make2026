import asyncio
import websockets
import serial
import json
import time

# --- CONFIGURATION ---
SERIAL_PORT = 'COM3'  # Change this to your Arduino's serial port (e.g., /dev/ttyACM0 on Mac/Linux)
BAUD_RATE = 9600
WS_HOST = 'localhost'
WS_PORT = 8080
# ---------------------

def determine_class(turbidity, tds):
    if turbidity < 1.0 and tds < 50:
        return 'min' # High-grade reuse
    if turbidity < 5.0 and tds < 200:
        return 'med' # Utility Loop
    return 'max' # Discharge

async def read_serial_and_broadcast(websocket, path='/ws/aqualoop'):
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
                            "class": determine_class(turbidity, tds),
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
