<div align="center">
  <h1>⚡ DhakaGrid</h1>
  <p><strong>Real-Time Utility Disruption Tracker for Dhaka, Bangladesh</strong></p>
</div>

---

DhakaGrid is a hybrid web and Android application designed to crowdsource and automatically detect utility disruptions (Electricity, Water, and Gas) across the dense urban environment of Dhaka.

## ✨ Key Features

* 🔌 **Automated Power Outage Detection (Dead Man's Switch):** Automatically detects power outages when a cluster of home Wi-Fi routers drops offline—no manual reporting needed.
* 💧🔥 **One-Tap Reporting:** Frictionless manual reporting buttons for Water and Gas shortages.
* 🗺️ **Live Interactive Map:** A dynamic map of Dhaka that visualizes live disruptions via a color-coded matrix (Normal, Unverified, Confirmed Outage).
* 🔐 **Anonymous, Zero-Friction Auth:** Progressive authentication ensuring you don't have to log in during an emergency.
* 🛡️ **Abuse Protection:** Built-in safeguards like GPS Mock Location filtering, spam debouncing, and time-decay recovery to prevent false reports.

## 🛠️ Technology Stack

* **Frontend:** [Next.js 16](https://nextjs.org) (App Router), React 19, Tailwind CSS v4
* **Mobile Bridge:** [Capacitor](https://capacitorjs.com/) (Geolocation, Network) for native Android export
* **Backend & Realtime Engine:** [Supabase](https://supabase.com) (PostgreSQL, Realtime Presence)
* **Database Schema:** [Drizzle ORM](https://orm.drizzle.team)
* **Mapping:** Leaflet & React-Leaflet

## 🚀 Getting Started

First, install dependencies and run the development server:

```bash
npm install
# then
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📖 Documentation

For a detailed explanation of the architecture, user flows, and a complete user manual (Available in **English** and **Bengali**), please read the [dhakagrid_documentation.md](./dhakagrid_documentation.md) file.

## 👥 Team GridPulse
Developed by:
- **Seyam Bin H Rahman** (U177)
- **Muhammad Al-Efad** (U147)

*Batch-1*
