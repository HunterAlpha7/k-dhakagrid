# GridPulse: Real-Time Utility Tracker
**Version:** 1.1.0

GridPulse is a hybrid utility tracker designed specifically for dense urban environments like Dhaka, Bangladesh. It tackles the challenge of identifying disruptions in electricity, water, and gas supplies, leveraging both passive system diagnostics and active community reporting.

---

## Part 1: User Manual

### What Does GridPulse Do?
GridPulse provides a real-time pulse of your city's utility statuses. When power, water, or gas supply goes out in your neighborhood, GridPulse ensures that both you and the authorities are instantly aware of the disruption. 

**Key Features:**
- **Automated Electricity Outage Detection:** Our "Dead Man's Switch" runs in the background. If your local power goes out, your home Wi-Fi drops. Our system automatically detects this coordinated drop and marks your area's power as offline—no manual reporting required.
- **One-Tap Water & Gas Reporting:** Since water and gas shortages don't disconnect your internet, you can manually report these disruptions using simple, one-tap buttons on the app dashboard.
- **Live Interactive Map:** A dynamic map highlights the status of various zones in the city using a color-coded matrix (Green = Normal, Yellow = Unverified/Warnings, Red = Confirmed Outage).

### How to Use the App (For Users)

1. **Accessing the App:**
   - **Web Browser:** Simply visit the provided URL.
   - **Android Device:** Download the `app-debug.apk` directly from the web interface and install it on your device.
2. **Navigating the Dashboard:**
   - Upon opening, you will see a dynamic map displaying real-time reports of utility disruptions across Dhaka.
   - At the bottom of the screen, you will find a slide-up "Report Disruption" control panel.
3. **Reporting an Outage:**
   - **Location:** The app will automatically try to use your device's precise GPS location. If GPS is unavailable, you can manually tap the map to drop a pin.
   - **Water & Gas:** Tap the **"No Water"** or **"No Gas"** buttons to submit an instant report. The button will indicate "Reported" and prevent spamming.
   - **Electricity:** You do not need to press anything. The app continuously checks your network status. If your Wi-Fi disconnects, the system logs a potential power outage automatically.
4. **Filtering Reports:** Use the filters on top of the map to exclusively view 'Water', 'Gas', or 'All' disruptions.
5. **Team Info:** Click the 'Users' icon in the top right to learn more about the developers behind GridPulse (Team GridPulse).

---

## Part 2: Technical Explanation & Architecture

This section breaks down the technology stack, system architecture, and core working flows for presentation and onboarding purposes.

### 1. Technology Stack
- **Frontend Framework:** [Next.js (App Router)](https://nextjs.org) (v16) using React 19. Exported strictly as a static Single Page Application (`output: 'export'`).
- **Styling & UI:** Tailwind CSS (v4), Shadcn/Base-UI for components, and Phosphor Icons.
- **Cross-Platform Bridge:** [Capacitor](https://capacitorjs.com/) wraps the static Next.js build into a native Android WebView, providing access to device APIs (Geolocation, Network).
- **Backend & Database:** [Supabase](https://supabase.com) (PostgreSQL). Supabase provides the REST API and WebSocket (Realtime) functionalities for client-side data fetching.
- **ORM & Infrastructure:** [Drizzle ORM](https://orm.drizzle.team) is used purely in the development environment for managing PostgreSQL schema and migrations.
- **Mapping:** `leaflet` and `react-leaflet` to display dynamic, localized maps.

### 2. User Flow & Mechanics

#### Progressive Authentication (Zero-Friction)
During an emergency, users cannot be hindered by login screens. 
- The app utilizes **Anonymous Sign-In** via Supabase Auth. 
- When the app launches, Supabase automatically provisions a unique UUID for the device. 
- Row Level Security (RLS) policies on the PostgreSQL database ensure that users can only `INSERT` reports matching their own `reporter_id`, while `UPDATE` and `DELETE` actions are strictly blocked on the client side.

#### The "Dead Man's Switch" (Electricity Flow)
Electricity disruptions are inherently difficult to report manually because home Wi-Fi routers power off, and cellular networks instantly congest.
- **Implementation:** The app utilizes Supabase Realtime `presence` APIs on a global "heartbeat" channel.
- **Trigger:** The Capacitor Network plugin listens for Wi-Fi connection states. As long as a device is on Wi-Fi, it broadcasts an "online" presence state.
- **Resolution:** If power drops, the router dies. The Supabase Realtime engine immediately detects that a cluster of devices from a specific geographical boundary dropped offline simultaneously. The system mathematically analyzes the drop ratio (e.g., > 70% offline) to confirm an outage without a single user opening the app.

#### Active One-Tap Reporting (Water/Gas Flow)
Water and Gas do not affect the network infrastructure, necessitating manual reports.
- **Implementation:** The user taps the "No Water" or "No Gas" button. 
- **Trigger:** The `reportDisruption` function in `useDhakaGrid` fetches the exact latitude/longitude (either via Capacitor Geolocation or a map pin) and pushes a new row into the `reports` table.
- **Realtime Sync:** A Supabase Postgres Changes subscription instantly pushes the new report to all active clients viewing the map, rendering it in real-time.

### 3. Threat Modeling & Safeguards

To maintain data integrity and prevent abuse, the platform enforces strict safeguards:
- **GPS Spoofing / Mock Locations:** If the Capacitor Geolocation plugin flags the coordinate as coming from a Mock Provider, the backend will silently discard the data while the UI will appear successful to the attacker.
- **Rage Tapping (Spam):** The UI enforces a debounce (30 seconds) on report buttons. Additionally, backend logic throttles limits per user UUID.
- **Time-Decay Recovery:** Manual reports don't last forever. Gas reports decay after 4 hours, and Water reports after 6 hours, automatically reverting zones back to "Normal" status unless corroborated by new reports.
- **Cluster Consensus:** A single device dropping off Wi-Fi does not trigger a power outage (the user might have just left home). The algorithm requires a high drop ratio across a baseline population in a specific zone to confirm a blackout.

### 4. Codebase Entry Points
- **`src/app/page.tsx`:** The main dashboard UI. Manages UI state, handles manual report triggering, and renders the map and sliding panel.
- **`src/hooks/useDhakaGrid.ts`:** The core engine. Initializes the Supabase client, manages Geolocation & Network permissions via Capacitor, establishes the Realtime Postgres subscriptions, and handles the heartbeat Presence sync.
- **`ignore-box/PRD.md`:** The source of truth for product requirements, architecture rules, and database schemas.

---
---

# গ্রিডপাল্স (GridPulse) - রিয়েল-টাইম ইউটিলিটি ট্র্যাকার (বাংলা)

## পার্ট ১: ইউজার ম্যানুয়াল (User Manual)

### গ্রিডপাল্স কী কাজ করে?
গ্রিডপাল্স হলো আপনার শহরের গ্যাস, বিদ্যুৎ এবং পানির খবরাখবর জানার একটি রিয়েল-টাইম প্ল্যাটফর্ম। যখন আপনার এলাকায় বিদ্যুৎ, পানি বা গ্যাসের সমস্যা হয়, গ্রিডপাল্স সাথে সাথে আপনাকে এবং সংশ্লিষ্ট কর্তৃপক্ষকে তা জানিয়ে দেয়।

**মূল ফিচারসমূহ:**
- **অটোমেটিক বিদ্যুৎ বিভ্রাট শনাক্তকরণ:** আমাদের "ডেড ম্যানস সুইচ" ব্যাকগ্রাউন্ডে কাজ করে। যদি আপনার এলাকায় বিদ্যুৎ চলে যায়, তবে আপনার বাসার ওয়াই-ফাই (Wi-Fi) সংযোগ বিচ্ছিন্ন হয়ে যায়। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে এই সংযোগ বিচ্ছিন্ন হওয়া শনাক্ত করে এবং আপনার এলাকায় বিদ্যুৎ নেই তা আপডেট করে দেয়—এর জন্য আপনাকে নিজে থেকে কিছুই রিপোর্ট করতে হবে গঠন করতে হবে না।
- **এক-ক্লিকে পানি ও গ্যাসের রিপোর্ট:** যেহেতু পানি ও গ্যাস না থাকলে আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন হয় না, তাই আপনি অ্যাপের ড্যাশবোর্ডে থাকা বাটনে এক-ক্লিক করেই খুব সহজে এগুলোর রিপোর্ট করতে পারবেন।
- **লাইভ ইন্টারঅ্যাকটিভ ম্যাপ:** আমাদের একটি ডাইনামিক ম্যাপ রয়েছে, যা বিভিন্ন রঙের মাধ্যমে শহরের বিভিন্ন এলাকার অবস্থা তুলে ধরে (সবুজ = স্বাভাবিক, হলুদ = যাচাই করা হয়নি/সতর্কতা, লাল = সমস্যা নিশ্চিত করা হয়েছে)।

### ব্যবহারকারীরা কীভাবে অ্যাপটি ব্যবহার করবেন?
১. **অ্যাপে প্রবেশ:**
   - **ওয়েব ব্রাউজার:** শুধু আমাদের দেওয়া লিংকে (URL) প্রবেশ করুন।
   - **অ্যান্ড্রয়েড ডিভাইস:** ওয়েব থেকে সরাসরি `app-debug.apk` ফাইলটি ডাউনলোড করে আপনার ফোনে ইনস্টল করে নিন।
২. **ড্যাশবোর্ড পরিচিতি:**
   - অ্যাপটি খোলার সাথে সাথেই আপনি একটি ম্যাপ দেখতে পাবেন যেখানে পুরো ঢাকার ইউটিলিটি (গ্যাস, পানি, বিদ্যুৎ) সমস্যার রিয়েল-টাইম রিপোর্ট দেখা যাবে।
   - স্ক্রিনের নিচের দিকে "Report Disruption" (সমস্যার রিপোর্ট করুন) নামের একটি প্যানেল পাবেন।
৩. **সমস্যার রিপোর্ট করা:**
   - **লোকেশন:** অ্যাপটি স্বয়ংক্রিয়ভাবে আপনার জিপিএস (GPS) লোকেশন নেওয়ার চেষ্টা করবে। যদি জিপিএস না থাকে, তবে আপনি ম্যাপে ক্লিক করে পিন বসিয়ে লোকেশন ঠিক করে দিতে পারেন।
   - **পানি ও গ্যাস:** "No Water" (পানি নেই) অথবা "No Gas" (গ্যাস নেই) বাটনে ক্লিক করে সাথে সাথে রিপোর্ট করতে পারবেন। বাটনটি "Reported" দেখাবে যাতে বারবার রিপোর্ট করা না যায়।
   - **বিদ্যুৎ:** এর জন্য আপনাকে কিছুই করতে হবে না। অ্যাপটি সবসময় আপনার নেটওয়ার্ক অবস্থা চেক করে। যদি ওয়াই-ফাই সংযোগ বিচ্ছিন্ন হয়ে যায়, তবে সিস্টেম নিজে থেকেই বিদ্যুৎ বিভ্রাটের রিপোর্ট নিয়ে নেয়।
৪. **রিপোর্ট ফিল্টার করা:** ম্যাপের ওপরের দিকের ফিল্টার অপশন ব্যবহার করে আপনি চাইলে শুধুমাত্র 'পানি', 'গ্যাস' অথবা 'সব' রিপোর্ট আলাদাভাবে দেখতে পারেন।
৫. **টিম পরিচিতি:** গ্রিডপাল্স (Team GridPulse) এর ডেভেলপারদের সম্পর্কে জানতে ওপরের ডানদিকের 'Users' আইকনে ক্লিক করুন।

---

## পার্ট ২: টেকনিক্যাল ব্যাখ্যা ও আর্কিটেকচার (Technical Explanation)

এই অংশটি অ্যাপের প্রযুক্তিগত দিক, সিস্টেম আর্কিটেকচার এবং এটি কীভাবে কাজ করে তা সহজ ভাষায় বোঝানোর জন্য।

### ১. টেকনোলজি স্ট্যাক (Technology Stack)
- **ফ্রন্টএন্ড ফ্রেমওয়ার্ক:** [Next.js (App Router)](https://nextjs.org) (v16) এবং React 19 ব্যবহার করা হয়েছে। এটি একটি স্ট্যাটিক সিঙ্গেল পেজ অ্যাপ্লিকেশন হিসেবে তৈরি করা হয়েছে।
- **ডিজাইন ও ইউআই (UI):** Tailwind CSS (v4), Shadcn/Base-UI এবং Phosphor Icons ব্যবহার করে ডিজাইন করা হয়েছে।
- **ক্রস-প্ল্যাটফর্ম ব্রিজ:** [Capacitor](https://capacitorjs.com/) ব্যবহার করে Next.js এর স্ট্যাটিক বিল্ডকে একটি অ্যান্ড্রয়েড অ্যাপে রূপান্তর করা হয়েছে, যার ফলে অ্যাপটি ফোনের জিপিএস ও নেটওয়ার্ক অ্যাক্সেস করতে পারে।
- **ব্যাকএন্ড ও ডাটাবেস:** [Supabase](https://supabase.com) (PostgreSQL) ব্যবহার করা হয়েছে, যা রিয়েল-টাইম ডাটা আদান-প্রদান করতে সাহায্য করে।
- **ওআরএম (ORM):** ডাটাবেস ম্যানেজ করার জন্য ডেভেলপমেন্ট পরিবেশে [Drizzle ORM](https://orm.drizzle.team) ব্যবহার করা হয়েছে।
- **ম্যাপিং:** ডাইনামিক ও লোকাল ম্যাপ দেখানোর জন্য `leaflet` এবং `react-leaflet` ব্যবহার করা হয়েছে।

### ২. ইউজার ফ্লো এবং কাজের প্রক্রিয়া (User Flow & Mechanics)

#### সহজ লগইন ব্যবস্থা (Progressive Authentication)
জরুরি অবস্থায় লগইন করাটা অনেক ঝামেলার। তাই এই অ্যাপে:
- Supabase Auth-এর মাধ্যমে **অ্যানোনিমাস সাইন-ইন (Anonymous Sign-In)** বা পরিচয় গোপন রেখে লগইনের ব্যবস্থা করা হয়েছে।
- অ্যাপটি ওপেন করার সাথে সাথেই সিস্টেম স্বয়ংক্রিয়ভাবে আপনার ডিভাইসের জন্য একটি ইউনিক আইডি (UUID) তৈরি করে নেয়। 
- ডাটাবেসের প্রাইভেসি (RLS) পলিসি নিশ্চিত করে যে, আপনি শুধু নিজের তৈরি করা রিপোর্টগুলোই জমা দিতে পারবেন। ক্লায়েন্ট সাইড থেকে কোনো ডাটা পরিবর্তন বা মুছে ফেলা সম্পূর্ণ বন্ধ রাখা হয়েছে।

#### ডেড ম্যানস সুইচ (বিদ্যুতের কাজের প্রক্রিয়া)
বিদ্যুৎ চলে গেলে সাধারণত ওয়াই-ফাই রাউটার বন্ধ হয়ে যায় এবং মোবাইল নেটওয়ার্কও জ্যাম হয়ে যায়। তাই বিদ্যুৎ যাওয়ার রিপোর্ট ম্যানুয়ালি করা কঠিন।
- **কাজের প্রক্রিয়া:** অ্যাপটি Supabase Realtime-এর "heartbeat" চ্যানেল ব্যবহার করে সবসময় নেটওয়ার্ক চেক করে।
- **ট্রিগার (Trigger):** Capacitor Network প্লাগইন আপনার ওয়াই-ফাই সংযোগ পর্যবেক্ষণ করে। যতক্ষণ আপনি ওয়াই-ফাইয়ে থাকেন, সিস্টেম আপনাকে "online" দেখায়।
- **সমাধান:** বিদ্যুৎ চলে গেলে রাউটার বন্ধ হয়ে যায়। তখন Supabase Realtime সিস্টেম বুঝতে পারে যে একটি নির্দিষ্ট এলাকার অনেকগুলো ডিভাইস একসাথে অফলাইন হয়ে গেছে। সিস্টেমটি স্বয়ংক্রিয়ভাবে হিসেব করে (যেমন- ৭০% ডিভাইস অফলাইন) নিশ্চিত করে যে ঐ এলাকায় বিদ্যুৎ নেই, এবং এর জন্য কাউকে অ্যাপ ওপেন করে রিপোর্ট করতে হয় না।

#### এক-ক্লিকে রিপোর্ট (পানি/গ্যাসের কাজের প্রক্রিয়া)
পানি বা গ্যাস চলে গেলে ইন্টারনেট সংযোগ ঠিক থাকে, তাই এক্ষেত্রে ম্যানুয়ালি রিপোর্ট করতে হয়।
- **কাজের প্রক্রিয়া:** ব্যবহারকারী "No Water" বা "No Gas" বাটনে ক্লিক করেন।
- **ট্রিগার (Trigger):** `useDhakaGrid` ফাইলের `reportDisruption` ফাংশনটি জিপিএস বা ম্যাপ পিনের মাধ্যমে আপনার সঠিক লোকেশন (অক্ষাংশ/দ্রাঘিমাংশ) সংগ্রহ করে ডাটাবেসে একটি নতুন রিপোর্ট জমা করে।
- **রিয়েল-টাইম আপডেট:** ডাটাবেসের পরিবর্তনের সাথে সাথেই নতুন রিপোর্টটি ম্যাপে দেখা যায়, যার ফলে সবাই রিয়েল-টাইম আপডেট পেয়ে যায়।

### ৩. নিরাপত্তা ও সুরক্ষাব্যবস্থা (Threat Modeling & Safeguards)

ভুল রিপোর্ট বা অপব্যবহার রোধ করতে সিস্টেমে কিছু কড়া নিয়ম যুক্ত করা হয়েছে:
- **ভুয়া লোকেশন (GPS Spoofing):** কেউ যদি ভুয়া লোকেশন অ্যাপ ব্যবহার করে রিপোর্ট করে, তবে সিস্টেম তা ব্যাকএন্ডে বাতিল করে দেবে, যদিও ইউজারের কাছে মনে হবে রিপোর্টটি জমা হয়েছে।
- **স্প্যামিং রোধ:** কেউ যেন বারবার বাটনে ক্লিক করে বিরক্ত করতে্বা না পারে, সেজন্য বাটনে ৩০ সেকেন্ডের বিরতি (debounce) রাখা হয়েছে। এছাড়া ব্যাকএন্ড থেকে একেকজন ইউজারের রিপোর্টের লিমিট ঠিক করে দেওয়া আছে।
- **স্বয়ংক্রিয় রিকভারি (Time-Decay):** ম্যানুয়াল রিপোর্টগুলো সারাজীবন ম্যাপে থাকে না। নতুন কোনো রিপোর্ট না এলে গ্যাসের রিপোর্ট ৪ ঘণ্টা পর এবং পানির রিপোর্ট ৬ ঘণ্টা পর ম্যাপ থেকে স্বয়ংক্রিয়ভাবে মুছে যায় এবং এলাকাটি আগের মতো "স্বাভাবিক" অবস্থায় ফিরে যায়।
- **ক্লাস্টার কনসেনসাস (Cluster Consensus):** শুধু একজনের ওয়াই-ফাই বন্ধ হলেই সিস্টেম ধরে নেয় না যে বিদ্যুৎ চলে গেছে (কারণ তিনি হয়তো বাসা থেকে বের হয়েছেন)। বিদ্যুৎ বিভ্রাট নিশ্চিত করার জন্য একটি নির্দিষ্ট এলাকার একটি বড় অংশের (যেমন- ৭০%) সংযোগ একসাথে বিচ্ছিন্ন হতে হয়।

### ৪. কোডের মূল জায়গাগুলো (Codebase Entry Points)
- **`src/app/page.tsx`:** এটি মূল ড্যাশবোর্ড ইউজার ইন্টারফেস (UI)। এটি ম্যাপ, প্যানেল এবং ম্যানুয়াল রিপোর্টের বাটনগুলো নিয়ন্ত্রণ করে।
- **`src/hooks/useDhakaGrid.ts`:** এটি অ্যাপের মূল ইঞ্জিন। এটি ডাটাবেসের (Supabase) সাথে কানেকশন, জিপিএস ও নেটওয়ার্কের পারমিশন এবং রিয়েল-টাইম ডাটা সিঙ্ক করার কাজ করে।
- **`ignore-box/PRD.md`:** এখানে প্রোজেক্টের সমস্ত নিয়মকানুন, আর্কিটেকচার এবং ডাটাবেস স্কিমার বিবরণ দেওয়া আছে।
