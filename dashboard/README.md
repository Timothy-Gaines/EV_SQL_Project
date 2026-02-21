# EV Charging Infrastructure Dashboard

Interactive analytics dashboard built with React + TypeScript that visualizes SQL query outputs (files 1-5) from the EV charging infrastructure analysis project.

## Quick Start

```bash
cd dashboard
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Features

- **5 SQL Module Pages** — Each of your 5 SQL analysis files has a dedicated module with interactive charts, paginated tables, and a collapsible "View SQL" panel showing the original query
- **Overview Dashboard** — Summary statistics (83K+ stations analyzed) with annual growth and top-network charts
- **3D Interactive Globe** — 54,000+ station markers plotted on a WebGL globe with rotate/zoom/pan, color-coded by network, and filterable by state, network, and DC-fast presence
- **Dark Mission-Control Aesthetic** — Charcoal/navy backgrounds, electric teal accents, glass morphism cards, Outfit + DM Sans typography

## SQL Modules

| Module | Title | Charts |
|--------|-------|--------|
| SQL 1 | Infrastructure Growth & Market Momentum | Area chart, state YoY bar, stacked network bars |
| SQL 2 | Infrastructure Growth | Growth trajectory line, top states/cities bars, scatter age plot |
| SQL 3 | Market & Network Landscape | Market share bars, network dominance, free charging table |
| SQL 4 | Charger Technology & Accessibility | DC-fast/L2 stacked bars, 24/7 availability, radar chart |
| SQL 5 | Geographic Coverage & Readiness | Per-capita bars (top/bottom), ZIP hotspots, city gap scatter |

## Tech Stack

- React 18 + TypeScript
- Vite (build)
- Tailwind CSS (styling)
- Recharts (charts)
- react-globe.gl + Three.js (3D globe)
- PapaParse (CSV parsing)
- React Router v6 (routing)
- react-syntax-highlighter (SQL display)
- Lucide React (icons)

## Data

CSV results are served from `public/data/results/`. Station data for the globe is at `public/data/stations.csv`. Both are copied from the parent project's `results/` and `Data/` directories.

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server.
