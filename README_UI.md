# Federated Edge AI Platform — UI / Frontend

A modern, research-grade web dashboard for the Federated Edge AI Platform.
Built with React 18, Tailwind CSS, Framer Motion, and Recharts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark cyber theme) |
| Animations | Framer Motion 11 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Routing | React Router 6 |
| Backend API | Flask 3 + flask-cors |

---

## File Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js          # Proxy /api → localhost:5000
├── tailwind.config.js      # Cyber dark theme tokens
├── postcss.config.js
└── src/
    ├── main.jsx            # Entry point
    ├── App.jsx             # Router + layout shell
    ├── index.css           # Global styles + components
    ├── api/
    │   └── client.js       # fetch wrappers + MOCK fallback data
    ├── hooks/
    │   ├── usePolling.js   # Generic polling hook
    │   └── useMetrics.js   # useMetrics, useClients, useSecurity, useCommunication
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   └── shared/
    │       ├── GlowCard.jsx        # Glassmorphism animated card
    │       ├── MetricCard.jsx      # KPI card with animated counter
    │       ├── AnimatedCounter.jsx # Smooth number animation
    │       ├── StatusBadge.jsx     # Online / Quarantined / Warning badges
    │       └── ProgressBar.jsx     # Trust bars + progress bars
    └── pages/
        ├── LandingPage.jsx         # Hero with canvas particles
        ├── DashboardPage.jsx       # Live FL metrics
        ├── CMAPSSPage.jsx          # Industrial engine monitoring
        ├── COCOPage.jsx            # Surveillance scene analytics
        ├── ClientsPage.jsx         # Client network + trust scores
        ├── SecurityPage.jsx        # Byzantine detection + events
        ├── CommunicationPage.jsx   # Bandwidth & compression
        ├── ResultsPage.jsx         # JSON results + PNG gallery
        ├── ArchitecturePage.jsx    # Animated system diagram
        └── AboutPage.jsx           # Research info + references

backend/
├── api.py                  # Flask REST API (7 endpoints)
└── requirements_api.txt    # flask + flask-cors
```

---

## Quick Start

### 1. Start the Flask Backend

```bash
# From project root
pip install flask flask-cors
python backend/api.py
# → running on http://localhost:5000
```

### 2. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
# → running on http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to `localhost:5000`.
If the backend is offline, the UI falls back to built-in mock data automatically.

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, stats, feature cards |
| `/dashboard` | FL Dashboard | Live round metrics, charts |
| `/cmapss` | CMAPSS | Engine health, RUL predictions |
| `/coco` | COCO | Scene classification analytics |
| `/clients` | Clients | Network topology, trust scores |
| `/security` | Security | Byzantine detection log |
| `/communication` | Communication | Compression analytics |
| `/results` | Results | Metrics table + image gallery |
| `/architecture` | Architecture | Animated system diagram |
| `/about` | About | Research info, references |

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Backend health check |
| `/api/metrics` | GET | All FL metrics (industrial, surveillance, traffic) |
| `/api/results` | GET | Raw JSON results files |
| `/api/clients` | GET | Client list with trust scores |
| `/api/security` | GET | Events, trust history, anomaly scores |
| `/api/communication` | GET | Compression stats per round |
| `/api/visualizations` | GET | List of PNG files |
| `/api/visualizations/<filename>` | GET | Serve PNG image |
| `/api/run-experiment` | POST | Trigger experiment (stub) |

---

## Build for Production

```bash
cd frontend
npm run build       # outputs to frontend/dist/
npm run preview     # preview the production build locally
```

---

## Docker (Optional)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install flask flask-cors
EXPOSE 5000
CMD ["python", "backend/api.py"]
```

```yaml
# docker-compose.yml
version: "3.9"
services:
  backend:
    build: .
    ports: ["5000:5000"]
    volumes: ["./results:/app/results", "./visualizations:/app/visualizations"]
  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes: ["./frontend:/app"]
    ports: ["3000:3000"]
    command: sh -c "npm install && npm run dev -- --host"
    environment:
      - VITE_API_BASE=http://backend:5000
```

---

## Design System

### Colors

| Token | Hex | Usage |
|---|---|---|
| `cyber-900` | `#0a0e1a` | Page background |
| `cyber-750` | `#0f1626` | Card background |
| `cyber-500` | `#1e2d4a` | Borders |
| `neon-cyan` | `#00d4ff` | Primary accent |
| `neon-purple` | `#a855f7` | Secondary accent |
| `neon-green` | `#10b981` | Success / Online |
| `neon-orange` | `#f59e0b` | Warning / Industrial |
| `neon-red` | `#ef4444` | Error / Byzantine |

### CSS Classes

```css
.glass-card           /* glassmorphism panel */
.btn-primary          /* neon cyan CTA */
.btn-secondary        /* outline cyan */
.btn-ghost            /* muted outline */
.text-gradient-hero   /* cyan → purple → pink gradient text */
.section-label        /* uppercase mono subtitle */
.tag-cyan / .tag-red  /* small colored badges */
.cyber-grid-bg        /* subtle grid background pattern */
```
