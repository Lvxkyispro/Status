# Climate Risk Information System (CRIS)

A responsive web prototype that helps users understand climate-related risks for a selected location.
Built as a **B.Tech Information Technology PBL (Project Based Learning)** project.

**Team:** Purvik Vanjara · Manjot Singh · Sharaz Ali · Piyush Raina

```
Climate Data  →  Risk Analysis  →  Risk Visualization  →  Alerts  →  User Awareness
```

The project brings four things together in one system:

1. **Climate information:** temperature, rainfall, humidity and wind speed
2. **Location-based risk visualization:** an interactive map of flood, heat, heavy-rainfall and drought hotspots
3. **A user-friendly dashboard:** risk levels, statistic cards and trend charts
4. **Climate risk alerts:** Low / Moderate / High alerts with safety actions

> ⚠️ **Demo data:** all climate values, risk zones and alerts are **sample data** prepared for the
> demonstration. Pages show a yellow **DEMO DATA** label so no one mistakes them for real-time measurements.

---

## Features

| Page | What it shows |
|---|---|
| **Dashboard** | Selected location, overall risk level, temperature, rainfall, humidity, wind speed, active alerts, 7-day trend chart, hazard scores, top hotspots, system flow |
| **Risk Map** | Leaflet/OpenStreetMap map with Flood, Heat, Heavy Rainfall and Drought markers. Click a marker (or a hotspot in the list) to see a popup. Category filters and a legend |
| **Climate Trends** | Temperature, rainfall and humidity charts with a **7 Days / 30 Days / 1 Year** switch |
| **Alerts** | Alerts sorted by severity, with a severity filter, "What should I do?" safety actions, a severity guide and emergency helplines |
| **How It Works** | System flow, key novelty, architecture, risk method, plan for connecting real APIs, team |

**Locations:** Mumbai (default), Rajkot, Delhi, Chennai and Bengaluru. Use the location selector at the top right; every page updates.

---

## Requirements

- **Node.js 20.19 or newer** (Node 22 LTS recommended). Download it from https://nodejs.org
- npm (comes with Node.js)

Check your versions:

```bash
node -v
npm -v
```

## Install and run

```bash
# 1. Get the code
git clone https://github.com/Lvxkyispro/Status.git
cd Status
git checkout claude/delete-repo-contents-dklf4u   # branch that contains this project

# 2. Install dependencies (first time only)
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser (it usually opens on its own).

### Production build (optional)

```bash
npm run build      # creates the optimised site in dist/
npm run preview    # serves dist/ at http://localhost:4173
```

### Internet connection

- The app, its data, charts and fonts all work **offline**.
- The map *background tiles* come from OpenStreetMap and need internet. Without internet the
  risk markers and popups still work, and the map shows a small notice.

---

## Suggested demo flow

1. Open the **Dashboard**. Mumbai shows **High** overall risk (dominant hazard: Flood).
2. Point out the climate indicator cards and the 7-day trend chart.
3. Change the location to **Rajkot** (High: drought and heat), **Chennai** (Moderate) or **Bengaluru** (Low).
4. Show that the risk level, hazard scores and alerts update.
5. Open **Risk Map** and use the category filter chips.
6. Click a risk marker to open its information popup.
7. Open **Climate Trends** and switch between 7 Days, 30 Days and 1 Year.
8. Open **Alerts**, filter by severity and expand "What should I do?".
9. Open **How It Works** to explain the architecture and how to connect real APIs.

---

## How the risk analysis works (prototype model)

`src/services/riskEngine.js` turns climate indicators into hazard scores from 0 to 100.
Each score is weighted by the location's vulnerability:

| Hazard | Based on |
|---|---|
| Heat | Temperature and heat index (feels-like) vs. heat-wave thresholds |
| Heavy rainfall | 24-hour rainfall vs. IMD heavy / very heavy categories |
| Flood | 24-hour intensity + 30-day accumulated rainfall |
| Drought | 30-day rainfall deficit vs. normal + dry air |

Levels: **Low 0–33 · Moderate 34–66 · High 67–100**. The overall risk is the highest hazard score.
`src/services/alertEngine.js` then creates alerts and safety actions for every hazard that scores 15 or more.

This is a simple, explainable educational model, not an operational forecast.

---

## Connecting real climate APIs and databases

The pages never read the demo data directly. Everything goes through
**`src/services/climateService.js`**. To connect a real source, replace a function there and keep the returned data shape
the same. The dashboard, map, charts and alerts then update without any UI changes.

| Data | Possible real source | Replace |
|---|---|---|
| Current weather | Open-Meteo (free, no key) | `getCurrentConditions()` (**already implemented**, see below) |
| Historical trends | Open-Meteo Archive, NASA POWER, IMD gridded data | `generateTrend()` |
| Official warnings | IMD warnings, NDMA SACHET CAP feeds | `generateAlerts()` |
| GIS risk layers | ISRO Bhuvan, NDMA hazard maps | `getRiskZones()` |
| Storage | PostgreSQL + PostGIS / MongoDB behind a Node/Express API | `climateService.js` |

### Try live weather (optional)

Create a file named `.env.local` in the project folder containing:

```
VITE_DATA_MODE=live
```

Restart `npm run dev`. Current temperature, humidity, wind and rainfall now come from the free
**Open-Meteo** API, and the badge changes to **LIVE · OPEN-METEO**. If the API cannot be reached,
the app falls back to demo data automatically. Keep the default demo mode for presentations so the
values are predictable.

---

## Project structure

```
src/
├── App.jsx                  Routes
├── main.jsx                 Entry point, global styles
├── components/              Layout (sidebar/topbar/footer), cards, badges, charts, alerts, pipeline
├── context/ClimateContext   Selected location + loaded data shared by all pages
├── data/
│   ├── locations.js         DEMO data: cities, climate snapshot, climatology, risk zones
│   └── riskTypes.js         Hazard categories, colours, severity levels
├── pages/                   Dashboard, RiskMap, Trends, Alerts, About
├── services/
│   ├── climateService.js    ⭐ Single data-integration point (demo / live)
│   ├── riskEngine.js        Risk analysis (hazard scoring)
│   ├── alertEngine.js       Alert generation + safety actions
│   └── trendGenerator.js    Deterministic sample time series
└── styles/                  base, layout, components, pages CSS
```

## Tech stack

React 19 · JavaScript · CSS · Vite · Recharts · Leaflet + React-Leaflet (OpenStreetMap) · React Router · Lucide icons

---

Climate Risk Information System | B.Tech IT PBL
