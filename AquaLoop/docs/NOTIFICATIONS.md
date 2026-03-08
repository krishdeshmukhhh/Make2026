# Threshold & Action Notifications

When a sensor reading exceeds the configured thresholds (TDS, Turbidity, Temp, pH), AquaLoop notifies the user in two ways so alerts work in real user contexts.

## 1. In-app toasts (AlertToast)

- **When**: User is on the dashboard (any page).
- **Where**: Fixed top-right toasts; show last 3 alerts, auto-dismiss after 8s.
- **Best for**: Immediate feedback while the user is looking at the app.

## 2. Browser notifications

- **When**: A threshold is crossed; permission is requested on first alert if not yet granted.
- **Where**: OS-level notifications (system tray / notification center).
- **Best for**: User has another tab or app focused; they still see “AquaLoop: critical” (or warning) with metric and value.
- **Critical** alerts use `requireInteraction: true` where supported so they stay until dismissed.

## Best way to get those notifications (user context)

| User context              | What they get                                      |
|---------------------------|----------------------------------------------------|
| Dashboard tab focused     | In-app toasts + optional browser notification      |
| Another tab / app open    | Browser notification only (if permission granted) |
| Tab closed                | No live notifications (reconnect to see new data) |

Recommendation: **keep both**. In-app toasts handle “I’m watching the dashboard”; browser notifications handle “I’m doing something else but need to know when something’s wrong.” For critical thresholds, the app sends one browser notification per spike batch (first alert in the batch) to avoid spam.

## Thresholds (useAquaLoopData.js)

- **Turbidity**: warn 5 NTU, critical 8 NTU  
- **TDS**: warn 400 ppm, critical 700 ppm  
- **Temp**: warn 35 °C, critical 42 °C  
- **pH low**: warn 5.5, critical 4.5  
- **pH high**: warn 9.0, critical 10.0  

Adjust `SPIKE_THRESHOLDS` in `src/hooks/useAquaLoopData.js` to match your process and compliance needs.
