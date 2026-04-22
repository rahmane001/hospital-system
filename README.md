# Hospital Management System — Full-Stack DApp

A full-stack hospital management decentralised application (DApp) built on top of the original Node.js/Express/MongoDB backend (`master` branch). It extends the system with a React 19 single-page frontend, a Solidity smart contract deployed to a local Ganache chain for tamper-proof audit trails, role-based dashboards for admin/doctor/patient/receptionist, and a MetaMask-aware wallet flow.

Built for **CN6035 — Mobile and Distributed Systems**.

> **Branch layout**
> - **`master`** — the original backend-only baseline (imported from the upstream fork) kept untouched for comparison.
> - **`main`** — this branch: full-stack build. See [`master...main`](../../compare/master...main) to inspect everything that was added.

---

## Architecture

```
┌─────────────────┐       REST/JWT       ┌──────────────────┐       Web3       ┌──────────────┐
│  React 19 SPA   │ ───────────────────> │  Node/Express    │ ───────────────> │   Ganache    │
│  (frontend/)    │ <─────────────────── │  API + MongoDB   │ <─────────────── │  (Solidity)  │
│  + MetaMask     │                      │  (src/)          │                  │ blockchain/  │
└─────────────────┘                      └──────────────────┘                  └──────────────┘
         │                                         │
         │ recharts dashboards                     │ Mongoose schemas
         │ jsPDF exports                           │ audit + notification pipelines
         └── role-based routing                    └── on-chain logging for appointments,
                                                       billing, and prescriptions
```

Every booking, payment, and prescription is mirrored to the on-chain `HospitalRecords` contract. The resulting transaction hash is persisted on the corresponding MongoDB document so the Blockchain Verification page can independently re-fetch and prove the record from Ganache.

---

## Technology Stack

### Backend (`src/`)
- **Node.js** + **Express 4**
- **MongoDB** with **Mongoose**
- **JWT** auth, **bcryptjs** password hashing
- **node-cron** for scheduled cleanup jobs
- **web3.js** client for contract interaction
- **morgan** logging, **cors**, **dotenv**
- **swagger-jsdoc** + **swagger-ui-express** for API docs

### Frontend (`frontend/`)
- **React 19** with **React Router v6**
- **recharts** for admin analytics
- **jsPDF** for exportable bill / prescription receipts
- **web3.js** + **MetaMask** detection (via `window.ethereum`)
- Plain CSS (NHS-inspired palette)

### Blockchain (`blockchain/`)
- **Solidity 0.8.19**
- **Truffle v5** with **Ganache** (chain id 5777, RPC :7545)
- Contract: `HospitalRecords` — stores appointment, billing, and prescription events keyed by their Mongo ObjectId strings, emits events for off-chain indexing.

---

## Features

| Role | Capabilities |
|------|--------------|
| **Admin** | Overview dashboard, analytics (revenue trend, per-doctor, top diagnoses, on-chain coverage), manage users / departments / beds, approve doctor registrations, view all appointments / bills / prescriptions, blockchain verification page, audit log viewer |
| **Doctor** | Manage appointment slots, view booked patients, create prescriptions, view billing for own patients |
| **Patient** | Browse doctors, book / cancel appointments, view bills with paid/pending status, pay bills (triggers on-chain update), view prescriptions, notification inbox |
| **Receptionist** | Manage bed assignments and department allocations |

### Cross-cutting features
- **JWT auth** with doctor approval workflow (registrations start `pending`)
- **Audit logging** middleware writes to `AuditLog` on every mutating action
- **Notifications**: in-app bell (polls every 30s) fires on booking confirmation, payment success, prescription issued
- **Blockchain verification**: every booking/payment is logged on-chain, tx hash stored on the `Bill` document, admin page cross-checks against Ganache
- **PDF exports**: bills and prescriptions exportable via jsPDF
- **MetaMask bar**: detects injected wallet, shows connected account + balance

---

## Project Structure

```
hospital-system-main/
├── .env.example               # Copy to .env and fill in
├── server.js                  # Entry point — starts Express
├── swagger.yaml
├── package.json
│
├── src/                       # ── BACKEND ──
│   ├── app.js
│   ├── config/
│   │   ├── db.js              # Mongoose connection
│   │   └── blockchain.js      # Web3 + contract instance
│   ├── models/                # User, Doctor, Patient, Appointment, Bill,
│   │                          # Prescription, Department, Bed,
│   │                          # AuditLog, Notification
│   ├── controllers/           # One per resource
│   ├── routes/                # Mounted under /api
│   ├── middleware/            # authMiddleware + auditMiddleware
│   └── jobs/cronJobs.js       # Scheduled cleanup of stale slots
│
├── frontend/                  # ── REACT SPA ──
│   └── src/
│       ├── App.js             # Route tree
│       ├── context/AuthContext.js
│       ├── utils/             # api.js, blockchain.js, metamask.js, pdfGenerator.js
│       ├── components/        # Sidebar, MetaMaskBar, NotificationBell
│       └── pages/
│           ├── Landing.js / Auth.js
│           ├── admin/         # AdminDashboard + BlockchainPage + AuditPage
│           ├── doctor/
│           ├── patient/
│           └── receptionist/
│
├── blockchain/                # ── SMART CONTRACT ──
│   ├── contracts/HospitalRecords.sol
│   ├── migrations/
│   ├── test/
│   ├── truffle-config.js
│   └── build/contracts/*.json # Compiled ABI + address (consumed by backend & frontend)
│
└── scripts/
    └── seedAccounts.js        # Creates admin/doctor/patient with pre-wired Ganache wallets
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on `:27017`
- Ganache GUI or CLI running on `:7545` (chain id 5777)
- Optional: MetaMask extension configured against the Ganache RPC

### 1 — Clone and install
```bash
git clone https://github.com/rahmane001/hospital-system.git
cd hospital-system
npm install
cd frontend && npm install && cd ..
```

### 2 — Deploy the smart contract
```bash
cd blockchain
npx truffle migrate --reset --network development
# Note the deployed address printed at the end.
cd ..
```

### 3 — Environment
```bash
cp .env.example .env
# Edit .env and set:
#   CONTRACT_ADDRESS=<address from truffle migrate>
#   DEPLOYER_ACCOUNT=<one of Ganache's unlocked accounts>
#   JWT_SECRET=<any long random string>
```

### 4 — Seed development accounts
```bash
node scripts/seedAccounts.js
# Creates:
#   admin@hms.com    / Password123!
#   doctor@hms.com   / Password123!   (doctorStatus: approved)
#   patient@hms.com  / Password123!
```

### 5 — Run backend and frontend
```bash
# Terminal 1
node server.js                        # API on http://localhost:8000

# Terminal 2
cd frontend && npm start              # React app on http://localhost:3000
```

Visit `http://localhost:3000`, log in with any seeded account, and the full flow (booking → billing → on-chain logging → blockchain verification) is available end-to-end.

---

## API

Swagger UI is mounted at `http://localhost:8000/api-docs` once the server is running.

Key endpoint groups:
- `/api/auth` — register, login
- `/api/users` — list (role-filtered), update profile
- `/api/appointments` — doctor CRUD, patient booking, admin listing
- `/api/bills` — patient bills, payment, doctor's bills, admin listing
- `/api/prescriptions` — doctor CRUD, patient view
- `/api/departments` / `/api/beds` — hospital inventory
- `/api/notifications` — bell inbox
- `/api/audit` — admin-only audit trail

---

## Version Control Notes

The `master` branch is kept at the pristine upstream backend (`05bea1d`) so that [`master...main`](../../compare/master...main) on GitHub shows exactly what was added for this coursework submission. The `main` history is broken into 21 topic commits — foundation → blockchain → frontend → four late bug-fixes — rather than a single dump, so the progression is legible to a marker.

---

## License

Released under the [MIT License](./LICENSE). Copyright (c) 2026 Esha Rahman.
