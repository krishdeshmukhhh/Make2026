# AquaLoop Hardware Integration Guide

This guide walks you through connecting a physical Arduino to the AquaLoop dashboard, streaming real-time sensor telemetry over a 9600-baud serial connection directly into the React components using a Python WebSocket bridge.

## 1. The Arduino Code (Transmitter)

The React dashboard expects a steady stream of sensor data. To provide this, your Arduino needs to print a specific comma-separated string to its Serial port on a regular interval (e.g., every 1 second).

The string **must** contain exactly 6 values in the following order:
```
Turbidity, TDS, Temperature, pH, inflowLPM, outflowLPM
```

### Example Arduino Sketch
Here is a skeleton sketch reflecting how you should format your `void loop()` outputs.

```cpp
// Define sensor pins/variables
float turbidity = 1.25;
int tds = 45;
float temp = 24.5;
float ph = 7.1;
float inFlow = 0.85;
float outFlow = 0.85;

void setup() {
  // Initialize Serial at 9600 baud to match the Python bridge
  Serial.begin(9600);
}

void loop() {
  // 1. Read your physical sensors here
  // turbidity = readTurbiditySensor();
  // tds = readTdsSensor();
  // etc...

  // 2. Format the output exactly as required:
  Serial.print(turbidity);
  Serial.print(",");
  Serial.print(tds);
  Serial.print(",");
  Serial.print(temp);
  Serial.print(",");
  Serial.print(ph);
  Serial.print(",");
  Serial.print(inFlow);
  Serial.print(",");
  Serial.println(outFlow); // ALWAYS use println for the final value to output a newline character

  // 3. Wait before next reading
  delay(1000); // Send an update every 1 second
}
```

---

## 2. The Python WebSocket Bridge (Middleman)

Web browsers cannot read physical COM/Serial ports directly for security reasons. To fix this, we created `arduino_bridge.py`. This script reads the raw Arduino serial data, converts it into nicely formatted JSON with timestamps, maps the water to a 'class' (MIN, MED, MAX impurity), and hosts a local WebSocket server that the React dashboard connects to.

### Setup Process
1. **Find your Arduino COM Port:** Check the Arduino IDE (Tools > Port) to see which port your Arduino is on (e.g., `COM3` on Windows, or `/dev/tty.usbmodem14101` on Mac).
2. **Update the Bridge File:** Open `arduino_bridge.py` in your code editor.
3. On line 8, change `SERIAL_PORT = 'COM3'` to match your actual Arduino port.
4. **Install Requirements:** Open a new terminal and install the required python packages:
   ```bash
   pip install pyserial websockets
   ```

### Running the Bridge
Close the Arduino IDE's Serial Monitor (you cannot have the IDE and Python reading the serial port at the same time). Run the script from the AquaLoop repository:
```bash
python arduino_bridge.py
```
You should see:
```text
[*] Starting AquaLoop WebSocket bridge on ws://localhost:8080/ws/aqualoop
[*] Waiting for React dashboard to connect...
```

---

## 3. The React Dashboard (Receiver)

Now that the bridge is running, we just need to tell the AquaLoop React frontend to stop generating fake simulation data and connect to the live Python WebSocket instead.

1. Open `src/hooks/useAquaLoopData.js`.
2. Look at **line 3**.
3. Change `USE_MOCK_DATA` from `true` to `false`.

```javascript
// Change this line:
const USE_MOCK_DATA = false; 
```

### Finishing Up
Save `useAquaLoopData.js` and look at your browser. The dashboard should instantly establish a connection. Look back at the terminal running the Python bridge; it should verify the connection and begin printing the `--> Sending: {"processId": ...}` JSON bundles.

The Live Sensor Strip, the animated Loop Diagram pipelines, and the Analytics Batch History will now scale and act dynamically based wholly on your physical AquaLoop hardware readings!
