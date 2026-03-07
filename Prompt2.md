# AquaLoop Operational Views Extension

## Role

Act as the same World‑Class Senior Creative Technologist and Lead Frontend Engineer described in the original Cinematic Landing Page Builder prompt. You are now extending an **existing** cinematic marketing site with an embedded, high‑fidelity **operational dashboard** experience for AquaLoop.

You are NOT rebuilding the landing page. You are adding a miniature SPA with two new routes:

- `/simulation` — animated water‑loop simulation tied to live sensor data.
- `/analytics` — deep charts, tables, and history for water reuse metrics.

These routes must visually harmonize with the original site’s design system and animation philosophy.

---

## Context

The existing site already implements:

- The NAVBAR, HERO, FEATURES, PHILOSOPHY, PROTOCOL, MEMBERSHIP/PRICING, and FOOTER sections.
- Aesthetic presets (A–D) and a fixed design system (noise overlay, rounded containers, GSAP motion, etc.).
- React 19 + Tailwind CSS + GSAP 3 stack, with Lucide icons and Unsplash imagery.

The new operational views must:

- Reuse the **selected preset’s** palette, typography, and general motion language.
- Focus on **live data visualization** (no pricing, no marketing fluff).
- Be wired so they can consume real‑time sensor data from an Arduino/ESP via a Raspberry Pi backend.

---

## New Routes & High‑Level Behavior

You will add a small React “sub‑app” mounted into the existing project that handles two routes:

- `/simulation` — primary demo view for judges and operators:
  - Animated schematic of the AquaLoop water loop (tanks + pipes + valves).
  - Light‑mode, industrial aesthetic (align with background from the preset but bias towards lighter surfaces for readability).
  - Live data driving animation: water level, active outlet, flow speed.

- `/analytics` — data‑dense view:
  - Time‑series charts of sensor values and reuse metrics.
  - Distribution charts for min/med/max classes.
  - Batch history table.

Navigation:

- The existing NAVBAR gets two new links: **Simulation** and **Analytics**.
- Clicking them uses client‑side routing (React Router) to render the appropriate view inside the main layout.

---

## Data & Real‑Time Integration

Assume a backend (e.g., Raspberry Pi) connected to Arduino/ESP sensors that exposes:

- A **WebSocket** at `ws://<BACKEND_HOST>/ws/aqualoop` sending JSON:

  ```json
  {
    "timestamp": 1719825600,
    "processId": "processA",
    "turbidity": 2.3,
    "tds": 350,
    "temp": 26.5,
    "ph": 7.2,
    "class": "med",
    "inFlowLpm": 0.8,
    "outFlowLpm": 0.8
  }
Optionally, an HTTP endpoint for historical data later (you can stub it).

Implement a single data service hook:

ts
useAquaLoopData()
Responsibilities:

Establish the WebSocket connection.

Parse readings into a Reading type.

Maintain:

latestByProcess (one live reading per process).

historyByProcess (rolling buffer per process).

Aggregated totals (total volume in, volume per class).

Expose a simple API for both /simulation and /analytics.

Include a USE_MOCK_DATA flag so the entire sub‑app can run with a synthetic generator if the backend isn’t present. Comment clearly where to switch to the real WebSocket.

Route: /simulation — Animated Loop View
The Simulation page is a cinematic control surface for the physical prototype.

Layout
Reuse the existing NAVBAR at the top (no structural changes).

Below it, create a full‑bleed Simulation Canvas with padding and rounded corners, aligned with the preset’s background colors.

Under the canvas, a strip of live sensor cards.

Animated Loop Canvas
Implement a LoopDiagram component using SVG (or a lightweight canvas), styled to match the preset’s identity:

Elements:

Tanks:

Used Water tank (left).

Sensing Tank (center).

Three Outlet Tanks (right), labeled:

High‑grade Reuse (min impurity)

Utility Loop (med)

Treatment / Discharge (max)

Pipes:

Smooth, rounded lines connecting tanks.

Subtle gradient or stroke styling tied to the preset’s primary color.

Valves:

Circular or gate icons on each outlet pipe.

Use Lucide icons if appropriate (e.g., lucide-react).

Animation behavior (driven by useAquaLoopData):

Active outlet derived from class (min/med/max) of the latest live reading for processA.

Flow animation:

Along the active pipe, render animated droplets or dashes moving from the sensing tank to the chosen outlet.

Speed approximates inFlowLpm.

Tank fill animation:

Each tank has a fill rectangle whose height interpolates based on a simple “volume” estimate from recent readings.

Use GSAP or Framer Motion for smooth interpolation.

Valve states:

Active valve appears open (filled, accent color).

Others appear closed (outlined, muted).

When the outlet changes, animate a subtle scale + opacity change for the new active valve.

Integrate the original design language:

Rounded corners (rounded-[2rem]+).

Noise overlay via the existing global CSS filter.

GSAP entrance animations (e.g., pipes and tanks slide/fade in on page load).

Live Sensor Strip
Below the loop diagram, show a row of mini cards for the live prototype process:

Each card:

Metric: Turbidity, Purity (TDS), Temperature, pH, Flow.

Current value + units.

Acceptable range.

Status badge (green/amber/red) based on thresholds.

Tiny sparkline of the last few minutes.

Interaction:

Numbers and mini charts update smoothly when new readings arrive.

On hover, cards lift slightly (translateY(-2px)), matching the existing micro‑interaction rules.

Route: /analytics — Deep Metrics View
The Analytics page is a data‑dense instrument for engineers and judges.

Layout
Reuse the NAVBAR.

Content:

Top: Process selector and time range controls.

Middle: sensor trends and reuse distribution charts.

Bottom: batch history table and optional process comparison.

Process Selector
Three pills or tabs:

Process A — “Lithography Rinse — LIVE”

Process B — “Etch Clean — SIMULATED”

Process C — “Cooling Return — SIMULATED”

Selecting a process filters all charts and tables to that processId.

Time Range Controls
Chips for: 1h, 24h, 7d, 30d, 3m, 6m, 1y, All.

For longer ranges, rely on mock historical data in the frontend until an HTTP API exists.

Charts
Use the preset’s palette and typography for chart styling.

Sensor Trends

Multi‑line chart for:

Turbidity

TDS / Purity

Temperature

pH

X‑axis: time; Y‑axis: metric values.

Include tooltips and legend; colors aligned with existing design tokens.

Reuse Distribution

Donut or stacked bar chart of volume routed to min/med/max in the selected range for the chosen process.

Next to it, a line/area chart of inflow vs reused volume vs reuse %.

Batch History Table

Columns:

Timestamp

Turbidity

TDS

Temperature

pH

Class (min/med/max, colored pill)

Destination label (“High‑grade Reuse”, “Utility Loop”, “Treatment / Discharge”)

Newest first.

Row hover states fit the site’s micro‑interaction system.

Optional Process Comparison

If time permits, a bar or radar chart comparing reuse % per process in the selected window.

Design & Motion Consistency
Continue using:

Global noise overlay.

Rounded containers (2–3rem).

GSAP gsap.context() + ScrollTrigger where appropriate.

Magnetic button hovers and link lifts.

The new routes should feel like part of the same “digital instrument”:

Same typography system.

Same color tokens (adapted for lighter backgrounds).

Same animation easing (power3.out, power2.inOut) and stagger values.

Technical Requirements (Extension‑Specific)
Keep using React 19, Tailwind CSS 3.4.17, GSAP 3.

Define all new components either inline in App.jsx or in a small components folder, consistent with the existing structure.

No placeholders: charts must be wired either to mock data via useAquaLoopData or prepared for real WebSocket data.

Responsive:

/simulation: loop diagram scales on smaller screens, sensor cards stack.

/analytics: charts stack vertically on mobile.

Implementation Tasks
Add routing for /simulation and /analytics into the existing React app.

Implement useAquaLoopData with:

WebSocket skeleton.

Mock generator behind a flag.

Build the /simulation page:

Animated LoopDiagram.

Live sensor strip.

Build the /analytics page:

Process selector.

Time range controls.

Charts and batch table.

Ensure all new views inherit the original design system and animation lifecycle.

Execution Directive: Do not create a separate project. Extend the existing cinematic site into a live operational instrument by adding these two routes and their components, wired for real‑time sensor integration.