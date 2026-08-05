# Product Requirements Document (PRD)

**Product Name:** DhakaGrid (Real-Time Utility Tracker)  
**Version:** 1.1.0  
**Target Platforms:** Cross-Platform (Web Browser & Android APK via Capacitor)  
**Target Market:** Dhaka, Bangladesh  
**Document Status:** Final Draft  

---

## 1. Executive Summary & Core Value Proposition

In dense urban environments like Dhaka, utility disruptions—specifically electricity load shedding, water supply outages, and low gas line pressure—cause significant daily friction. Traditional reporting systems fail because power outages disable home Wi-Fi routers while simultaneously causing cellular towers to congest.

**DhakaGrid** solves this core connectivity dilemma through a hybrid reporting architecture:

1. **Electricity (Automated "Dead Man's Switch"):** Uses a passive background heartbeat system over home Wi-Fi. When power fails and routers go dark, the server detects the sudden, synchronized loss of pings across a micro-grid and automatically marks the area as "Power Out." The offline user performs zero manual actions.
2. **Water & Gas (Active One-Tap Reporting):** Because water and gas disruptions do not disrupt electrical infrastructure or Wi-Fi routers, users utilize frictionless one-tap manual reporting buttons.

---

## 2. Technical Architecture & Stack

### 2.1. Cross-Platform Frontend: Next.js (App Router)

A single Next.js codebase will serve both the Web and Android platforms.

* **Web Deployment:** Deployed statically to Vercel or Cloudflare Pages for instant browser access.
* **Android Deployment:** Wrapped using Capacitor by Ionic (`@capacitor/core`). Capacitor serves the exported static files (`HTML/CSS/JS`) out of the `out/` directory inside a native Android WebView.
* **Build Constraint:** `next.config.js` MUST set `output: 'export'`. Next.js API Routes, Server Actions, and Server-Side Rendering are strictly forbidden.

### 2.2. Native Bridge (Capacitor Plugins)

* `@capacitor/geolocation`: High-accuracy device coordinate fetching during manual utility reports.
* `@capacitor/network`: Evaluates whether the device is connected to home Wi-Fi vs. Cellular before initiating heartbeats.
* `@capacitor/background-runner`: Schedules silent, background execution tasks for heartbeat management.

### 2.3. Backend, ORM & Client Integration

To maintain strict security within a static Android APK, database operations are split between development infrastructure and client runtime.

* **Database Host:** Supabase (PostgreSQL).
* **Schema Management (Development):** **Drizzle ORM**. Used strictly as Infrastructure as Code. Drizzle defines the schema locally (`schema.ts`) and handles migrations via `drizzle-kit` using the secure, private Postgres connection string.
* **Client Data Fetching (Production):** **Supabase Client Library (`@supabase/supabase-js`)**. The Next.js frontend connects exclusively via the Supabase REST API using the `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Exposing the Anon Key in the APK is 100% safe, as all operations are strictly governed by the database's Row Level Security (RLS).
* **Realtime Engine:** The frontend utilizes the Supabase client's `.channel()` and `presence` WebSocket APIs to maintain the "Dead Man's Switch." It tracks connected devices and instantly detects when a router dies, dropping the device offline without requiring a custom API polling interval.

---

## 3. Authentication & Security

To maintain a zero-friction user experience while preserving database integrity and Trust Scores, the platform utilizes a progressive authentication strategy.

* **Primary MVP Auth (Anonymous Sign-In):** When a user opens the app or website for the first time, Supabase Auth automatically generates a unique UUID behind the scenes. The user never sees a login screen, ensuring zero friction during an emergency outage.
* **Row Level Security (RLS):**
  * `SELECT` queries on `zones` and `reports` are public to authenticated (including anonymous) users.
  * `INSERT` commands on the `reports` table strictly require the user's Auth UUID to match the `reporter_id`.
  * `UPDATE` and `DELETE` commands are strictly blocked for all frontend clients.

---

## 4. Database Schema (Drizzle ORM Definition)

The underlying PostgreSQL schema defined via Drizzle ORM:

* **`users` Table:**
  * `id` (UUID, Primary Key)
  * `device_uuid` (String, unique to the device/browser)
  * `trust_score` (Integer, defaults to 1)
* **`zones` Table:**
  * `id` (UUID)
  * `zone_name` (String, e.g., "Uttara Sector 11")
  * `boundary` (PostGIS Polygon)
  * `current_status` (Enum: Green, Yellow, Red)
* **`reports` Table:**
  * `id` (UUID)
  * `zone_id` (Foreign Key -> `zones.id`)
  * `utility_type` (Enum: Electricity, Water, Gas)
  * `reporter_id` (Foreign Key -> `users.id`)
  * `created_at` (Timestamp)

---

## 5. UI & Mapping Stack

The visual representation of Dhaka's neighborhoods requires balancing performance with visual clarity across both web browsers and low-end Android devices.

* **The Map Strategy:** Custom Interactive SVG map embedded directly into the Next.js component.
* **Mechanics:** Each sector (e.g., Mirpur, Dhanmondi, Gulshan) is a distinct `<path>` element. React state dictates the `fill` color of each path based on the real-time Supabase subscription.
* **Dashboard Status Matrix:**
  * **Normal (Green):** Active baseline heartbeats; < 2 manual reports.
  * **Unverified (Yellow):** 1–2 unconfirmed manual reports OR drop ratio between 30%–69%.
  * **Confirmed Outage (Red):** Drop ratio $\ge 70\%$ OR 3+ verified manual reports within 15 mins.

---

## 6. Threat Modeling & Edge Case Handling

| Threat Scenario | Attack Vector | Architectural Mitigation |
| :--- | :--- | :--- |
| **GPS Spoofing** | User uses "Mock Location" apps to drop false reports. | Intercept `@capacitor/geolocation`. If `isFromMockProvider === true`, accept the payload on UI but discard it on the backend. |
| **Rage Tapping** | User repeatedly taps "No Gas" 30 times. | **Debounce UI:** Disable button for 30s. **Rate Limiting:** Backend limits 1 vote per user per 30 minutes. |
| **Trolling Syndicate** | Coordinated group falsely reports a water outage. | **Trust Score Engine:** Corroborated reports increase score. Isolated reports drop the score to 0, permanently **shadowbanning** the user. |
| **Leaving Home** | User turns off Wi-Fi and leaves home, mimicking an outage. | Single device drops are ignored. Outages strictly require **Cluster Consensus** (>70% drop rate across baseline population). |

---

## 7. Automatic Recovery System (Time-Decay)

* **Electricity Recovery:** As grid power returns, home Wi-Fi routers reboot. Supabase Realtime detects the cluster wave of returning device connections and automatically toggles the zone back to **Normal (Green)**.
* **Gas Outage Decay:** Manual "Gas" reports automatically expire after **4 hours** without new corroborating reports.
* **Water Outage Decay:** Manual "Water" reports automatically expire after **6 hours** without new corroborating reports.
