# 🌾 LocalHaat — Rural & Semi-Urban Commerce and Logistics Platform

LocalHaat is a scalable, modular platform designed to empower rural artisans, farmer producer organizations (FPOs), local transporters, and village haat drop agents. It features a decentralized logistics mesh, multi-carrier custody handovers, intelligent route matching, and physical zero-trust security.

---

## 🏗️ Technical Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **UI & Styling:** Tailwind CSS + shadcn/ui component architecture + Lucide Icons
- **Backend:** Node.js + Express.js + TypeScript (Modular Layered Architecture)
- **Database:** MongoDB + Mongoose (22 Production-Ready Data Models) with automatic embedded in-memory database fallback for zero-friction local execution
- **Authentication:** Mobile OTP + Role-Based Access Control (RBAC) + JWT
- **Realtime:** Socket.IO (Live Tracking Rooms, Carrier GPS Telemetry, Real-time Alerts)
- **Maps & Routes:** Intelligent Logistics Route Matching Engine & GPS Telemetry Broadcasts
- **Payments:** Razorpay & Cash on Delivery (COD) Accounting
- **Notifications:** Multi-channel notification pipeline (In-App, SMS, WhatsApp, Push)
- **Deployment:** Vercel-ready frontend & containerizable Node.js Express backend

---

## 📦 All 22 Production MongoDB / Mongoose Entities

Every entity requested in your specification is implemented with schema validation, indexing, and relational hooks:

| # | Entity | File | Key Capabilities & Attributes |
|---|---|---|---|
| 1 | `User` | [`backend/src/models/User.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/User.ts) | Mobile OTP authentication, 5 RBAC roles, KYC status, default addresses |
| 2 | `Product` | [`backend/src/models/Product.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Product.ts) | Village origins, weight in kg, pricing, organic certification, inventory |
| 3 | `Category` | [`backend/src/models/Category.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Category.ts) | Hierarchy, slugs, custom icons, display priority |
| 4 | `Order` | [`backend/src/models/Order.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Order.ts) | Order numbering, delivery address, 4-digit Delivery PIN, payment states |
| 5 | `OrderItem` | [`backend/src/models/OrderItem.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/OrderItem.ts) | Line items, seller references, quantity, weights, subtotals |
| 6 | `Parcel` | [`backend/src/models/Parcel.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Parcel.ts) | Tracking number, pickup codes, handover codes, delivery PIN, leg pointers |
| 7 | `ParcelEvent` | [`backend/src/models/ParcelEvent.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/ParcelEvent.ts) | Granular state milestones with geographic location, actor role, timestamp |
| 8 | `LogisticsPartner` | [`backend/src/models/LogisticsPartner.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/LogisticsPartner.ts) | Fleet rating, service areas, vehicle assignments, rate per km |
| 9 | `PartnerRoute` | [`backend/src/models/PartnerRoute.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/PartnerRoute.ts) | Inter-village corridors, departure times, capacity in kg, waypoints |
| 10 | `Vehicle` | [`backend/src/models/Vehicle.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Vehicle.ts) | Registration numbers, models, payload limits, GPS coordinates |
| 11 | `VillageAgent` | [`backend/src/models/VillageAgent.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/VillageAgent.ts) | Village Haat hub codes, serving villages, commission accounting, cash in hand |
| 12 | `Location` | [`backend/src/models/Location.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Location.ts) | Subdocument & model with village, district, state, pin, coordinates |
| 13 | `Shipment` | [`backend/src/models/Shipment.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Shipment.ts) | Consolidated multi-parcel haul movements |
| 14 | `ShipmentLeg` | [`backend/src/models/ShipmentLeg.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/ShipmentLeg.ts) | First-Mile Pickup, Mid-Mile Corridor Haul, and Last-Mile Village Delivery |
| 15 | `HandoverRecord` | [`backend/src/models/HandoverRecord.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/HandoverRecord.ts) | Audit-proof chain of physical custody transfer verification |
| 16 | `TrackingEvent` | [`backend/src/models/TrackingEvent.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/TrackingEvent.ts) | Fast indexed timeline records for public tracking |
| 17 | `Earning` | [`backend/src/models/Earning.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Earning.ts) | Partner and agent commission ledger (base fee + km distance bonuses) |
| 18 | `Payout` | [`backend/src/models/Payout.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Payout.ts) | UPI and Bank transfer withdrawal disbursements |
| 19 | `Payment` | [`backend/src/models/Payment.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Payment.ts) | Razorpay order IDs, signatures, COD payment records |
| 20 | `Notification` | [`backend/src/models/Notification.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/Notification.ts) | Multi-channel dispatch records with Socket.IO alerts |
| 21 | `KycDocument` | [`backend/src/models/KycDocument.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/KycDocument.ts) | Aadhaar, PAN, Trade License, Driving License compliance verification |
| 22 | `BusinessAccount` | [`backend/src/models/BusinessAccount.ts`](file:///e:/2026/project/localhaat/part1loalhaat/backend/src/models/BusinessAccount.ts) | Farmer producer enterprises, artisans, GSTIN, bank details, ratings |

---

## 🏛️ The Five Specialized Portals

LocalHaat includes 5 dedicated portals equipped with Role-Based Access Control (RBAC):

### 1. 🛒 Customer Portal (`/customer`)
- Browse organic village produce, stone-ground grains, cold-pressed oils, and terracotta crafts.
- Filter by village origin and product category.
- Shopping basket with real-time weight estimation and delivery fee calculation.
- Checkout with **Cash on Delivery (COD)** or **Razorpay / UPI**.
- **Customer Confidential PIN:** Generates and displays a secure 4-digit Delivery PIN required to accept final package handover.

### 2. 🚚 Logistics Partner Portal (`/partner`)
- View assigned shipment legs across rural routes.
- **First-Mile Verification:** Partner verifies the 6-digit **Pickup Code** provided by the artisan/seller to take custody.
- **Scheduled Route Corridors:** Register daily corridors (e.g. Sonapur <-> Ramnagar) with departure times and capacity.
- **Route Matching Engine:** Query matching routes based on origin/destination coordinates and parcel weight.
- **Live Fleet GPS Telemetry:** Interactive GPS Beacon simulator broadcasting realtime lat/lng pings to Socket.IO.
- **Transporter Earnings Wallet:** Track distance-based earnings (₹/km) and request UPI payout disbursements.

### 3. 🌾 Village Agent Portal (`/agent`)
- Hub management for Village Haat drop points (e.g., Sonapur Haat Drop Hub `VH-UP-0042`).
- **Mid-Mile Hub Handover:** Agent enters the 6-digit **Handover Code** provided by the arriving transporter to intake parcels.
- **Last-Mile Customer Handover:** Agent enters the customer's secret 4-digit **Delivery PIN** at the doorstep to verify delivery.
- **Cash-in-Hand Register:** Track cash collected from COD parcels.

### 4. 🏪 Business / Seller Portal (`/business`)
- Enterprise overview for rural artisans, farmers, and self-help groups.
- Product catalog management: Add products with origin village, weight, units, and organic certification.
- **Dispatch Queue:** Prepares parcels and reveals the 6-digit **Pickup Code** to be given to the arriving logistics partner.
- Real-time sales analytics and GMV tracking.

### 5. 🛡️ Platform Admin Portal (`/admin`)
- Platform-wide KPIs: Gross Merchandise Value (GMV), active shipments, users count, and partner fleet metrics.
- User directory with role filters and account status toggles.
- **KYC Compliance Queue:** Review uploaded identity documents (Driving Licenses, Trade Licenses, Aadhaar) with 1-click **Approve** or **Reject**.
- **Financial Disbursements:** Review partner and agent withdrawal requests and mark payouts processed via UPI.

---

## 🔐 3-Tier Zero-Trust Physical Verification Lifecycle

To solve lost packages and disputes in rural multi-carrier networks, LocalHaat implements cryptographic single-use verification codes at every custody transition point:

```
[ Rural Artisan / Seller ]
           │
           │  Stage 1: First-Mile Pickup
           │  (Seller gives 6-digit Pickup Code to Logistics Partner)
           ▼
[ Logistics Transporter Fleet ]
           │
           │  Stage 2: Mid-Mile Corridor Haul
           │  (Partner gives 6-digit Handover Code to Village Agent Hub)
           ▼
[ Village Haat Drop Hub Agent ]
           │
           │  Stage 3: Last-Mile Delivery
           │  (Customer gives 4-digit Delivery PIN to Village Agent)
           ▼
[ Customer Doorstep ]
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v20.x` or higher
- NPM `v10.x` or higher

### 1. Installation
In the project root, install backend and frontend dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Seed Database
Seed the database with all 22 entities, demo accounts, active routes, and test parcels:
```bash
cd backend
npm run seed
cd ..
```

### 3. Start Backend & Frontend
In separate terminal windows:

**Terminal 1 (Backend API & Socket.IO Server):**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 (Next.js Frontend):**
```bash
cd frontend
npm run dev
# Application will run on http://localhost:3000
```

---

## 🔑 Pre-Seeded Demo Accounts for Immediate Testing

In development mode, enter any of these phone numbers with the universal OTP **`123456`**, or click the 1-click test buttons in the top tester bar:

| Role | Name | Mobile Number | Dev OTP | Portal URL |
|---|---|---|---|---|
| **Platform Admin** | Devendra Pratap | `9999900001` | `123456` | `http://localhost:3000/admin` |
| **Business / Seller** | Rameshwar Mahato | `9999900002` | `123456` | `http://localhost:3000/business` |
| **Logistics Partner** | Balwant Singh | `9999900003` | `123456` | `http://localhost:3000/partner` |
| **Village Agent** | Sudhir Kumar | `9999900004` | `123456` | `http://localhost:3000/agent` |
| **Customer** | Priya Sharma | `9999900005` | `123456` | `http://localhost:3000/customer` |

---

## 📡 Live Consignment Tracking Demo Codes

You can track consignments live on `http://localhost:3000/track/<trackingNumber>`:
- **Consignment 1:** `LH-TRK-904128` (Pickup Code: `841295` | Handover Code: `572914` | Customer PIN: `4826`)
- **Consignment 2:** `LH-TRK-710492` (Delivery PIN: `9173` | Handover Code: `662194`)
