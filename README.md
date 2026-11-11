# 🚗 SmartPark.AI — Next-Gen AI Smart Parking & AR Navigation System

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Three.js-0.185-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/TanStack_Router-1.170-FF4154?style=for-the-badge&logo=tanstack&logoColor=white" alt="TanStack Router" />
  <img src="https://img.shields.io/badge/Tesseract.js-OCR-5C2D91?style=for-the-badge&logo=tesseract&logoColor=white" alt="Tesseract.js" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2340?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay" />
</p>

---

## 📌 Overview

**SmartPark.AI** is an enterprise-grade, full-stack Smart Parking Management System designed to eliminate urban parking congestion and streamline driver experiences. Powered by modern web technologies, AI computer vision, WebGL 3D graphics, and augmented reality, SmartPark.AI brings a cohesive "Silicon Valley startup" caliber digital ecosystem to smart cities, commercial malls, corporate campuses, and transit hubs.

---

## ✨ Key Features

### 1. 🎯 Real-Time Smart Slot Allocation & Multi-Floor Mapping
- **Interactive Multi-Level Grid**: Browse and reserve parking slots across multiple levels (Ground, Level 1, Level 2, EV Dedicated, VIP).
- **Dynamic Status Updates**: Real-time slot status tracking (`Available`, `Occupied`, `Reserved`, `Maintenance`).
- **One-Click Instant Reservation**: Automatic assignment of the closest optimal slot relative to entrance gates.

### 2. ⚡ EV Charging Hub & Live Energy Telemetry
- **Dedicated EV Slots**: Integrated slots supporting Level 2 and DC Fast Charging stations.
- **Real-Time Telemetry Simulation**: Live monitoring of battery percentage (SoC), energy consumed ($kWh$), charging duration, and dynamic power rate billing.
- **Eco-Rewards System**: Earn green parking credits on sustainable charging sessions.

### 3. 🔍 AI Computer Vision & Automated License Plate Recognition (ANPR / ALPR)
- **Real-Time Edge OCR**: Leverages **Tesseract.js** inside the browser to recognize vehicle registration plates from live webcam feeds or uploaded camera snapshots.
- **Automated Barrier Gate Simulator**: Cross-references scanned plates against active reservations in milliseconds to automatically trigger barrier gate open/close sequences.
- **Manual & Auto Verification Modes**: High-precision fallback matching to guarantee frictionless vehicular ingress and egress.

### 4. 👓 Live AR Holographic Wayfinding & 2D Indoor Navigation
- **Augmented Reality (Live AR)**: Utilizes device camera integration, WebGL, and Three.js to render animated 3D directional guidance arrows in the real world, guiding drivers directly to their allocated slot.
- **2D Floorplan Route Guidance**: Interactive overhead map with calculated distance, shortest-path routing, and walking/driving ETA.

### 5. 🎫 Contactless Dynamic QR Parking Passes
- **Encrypted QR Generation**: Instant generation of secure, cryptographically verifiable digital passes upon booking confirmation.
- **Seamless Gate Scanner**: Quick scan at exit checkpoints for contactless checkout and verification.

### 6. 💳 Digital Wallet & Integrated Payments (Razorpay)
- **Built-in Smart Wallet**: In-app balance for fast 1-click booking, instant slot extensions, and EV charging payments.
- **Razorpay Payment Gateway**: Seamless credit/debit card, UPI, and netbanking checkouts.
- **Reliable Fallback Simulation**: Built-in 1.5s simulated transaction engine to ensure zero demo downtime or payment stalls during offline/isolated environments.

### 7. 🛡️ Admin Command & Control Center
- **Executive Analytics Dashboard**: Real-time revenue figures, utilization percentages, peak usage charts, and vehicle mix ratios (EV vs Standard ICE).
- **Incident & Security Event Stream**: Real-time security feed tracking unauthorized occupancy, overtime violations, and driver-reported facility incidents.
- **User & Fleet Management**: Granular control over registered users, active parking sessions, and pricing tiers.

### 8. 🎨 Next-Generation UI/UX Engineering
- **Apple-Style Spotlight Cards**: Dynamic cursor-tracking radial spotlight glows on interactive cards.
- **Frosted Glassmorphism**: Clean, multi-layered backdrop blur surfaces tailored for both Light and Dark themes.
- **Fluid Micro-Interactions**: Smooth staggered entrance animations powered by **Framer Motion**.
- **Responsive 3D Cyber Background**: Procedural animated Three.js floating grid and particle network that dynamically adapts its color palette between Dark Mode and Light Mode.

---

## 🏗️ Architecture & Tech Stack

```text
ai-smart-parking/
├── src/
│   ├── components/
│   │   ├── app/              # Domain-specific components (StatCard, WalletCard, SlotCard, etc.)
│   │   ├── site/             # 3D Cyberpunk Three.js canvas & layout backgrounds
│   │   ├── ui/               # Reusable UI primitives (SpotlightCard, Button, Dialog, etc.)
│   │   └── theme-provider.tsx# Light / Dark / System mode controller
│   ├── lib/
│   │   ├── auth.ts           # Authentication & role-based access logic (User / Admin)
│   │   ├── store.ts          # Centralized reactive state store
│   │   ├── db.ts             # Supabase cloud database sync & camel/snake case mappers
│   │   └── useRazorpay.ts    # Razorpay SDK integration & resilient transaction fallback
│   ├── routes/               # File-based TanStack Router pages
│   │   ├── __root.tsx        # Global app layout & navigation shell
│   │   ├── index.tsx         # Landing page & feature showcase
│   │   ├── dashboard.tsx     # User Dashboard (stats, quick actions, active session)
│   │   ├── booking.tsx       # Slot booking & payment flow
│   │   ├── slots.tsx         # Real-time interactive slot browser
│   │   ├── ev-charging.tsx   # EV station dashboard & charging telemetry
│   │   ├── history.tsx       # Booking history & transaction logs
│   │   ├── profile.tsx       # User profile & registered vehicle management
│   │   ├── admin.index.tsx   # Admin command center & analytics
│   │   ├── admin.gate.tsx    # Live ANPR / OCR webcam gate simulator
│   │   ├── admin.parking.tsx # Slot allocation & pricing management
│   │   └── admin.users.tsx   # User management table
│   └── styles.css            # Tailwind CSS v4 styling & glassmorphism variables
```

### Technology Breakdown

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/), [Vite](https://vitejs.dev/) |
| **Routing & SSR** | [TanStack Router](https://tanstack.com/router), [TanStack Start](https://tanstack.com/start), [Nitro](https://nitro.unjs.io/) |
| **Styling & Animation** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **3D Graphics & AR** | [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei) |
| **Computer Vision (AI)** | [Tesseract.js](https://tesseract.projectnaptha.com/) (Edge Optical Character Recognition) |
| **State Management** | Centralized Reactive State Store & LocalStorage Persistence |
| **Database & Cloud** | [Supabase](https://supabase.com/) (PostgreSQL & Realtime) |
| **Payments** | [Razorpay](https://razorpay.com/) Payment Gateway |
| **Data Visualization** | [Recharts](https://recharts.org/) |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js) or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Bhuvanesh0621/aiparkingsystem.git
   cd aiparkingsystem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional for local simulation)*:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
   *(Note: The application has built-in offline fallbacks for local and demo evaluations).*

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 👥 Demo Access & Role Accounts

| Role | Email / Identifier | Purpose |
| :--- | :--- | :--- |
| **Admin** | `admin@smartpark.ai` | Access full command center, gate ANPR simulator, revenue charts, and slot controls. |
| **User** | `2005raghuraj@gmail.com` / Quick Sign In | Access driver dashboard, booking flow, AR/2D indoor navigation, and digital wallet. |

---

## 📸 Presentation & Live Demo Highlights

When showcasing SmartPark.AI for expos or evaluations:
1. **The Cyberpunk 3D Canvas**: Toggle between Dark and Light mode at the top bar to showcase the responsive Three.js particle and grid system.
2. **Apple Spotlight Hover**: Hover your cursor over stat cards and wallet cards to demonstrate the fluid cursor-following ambient spotlight.
3. **Live AR Wayfinding**: Click **Live AR** on an active booking to preview the first-person holographic arrow projection.
4. **Automated Gate Simulation**: Navigate to **Admin -> Gate Simulator** to showcase camera-based AI license plate OCR.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
