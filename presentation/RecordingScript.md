# Recording Script — CN6035 Task 2 Video (9:30 target)

Read every `SAY:` line **verbatim**. Rubric markers grep the transcript for
the bold keywords — don't paraphrase them. At 150 wpm each block is already
pace-matched to its time slot.

---

## T-15 min — Preflight

| Check | Confirm |
|---|---|
| Ganache GUI | running on `:7545`, 10 accounts, chain ID `5777` |
| Backend | `node server.js` → logs `MongoDB Connected` + contract init |
| Frontend | `cd frontend && npm start` → `:3000` |
| DB seeded | `node scripts/seedAccounts.js && node scripts/demoData.js && node scripts/onchainSync.js` |
| MetaMask | Localhost 7545, Ganache key #3 (patient) imported, ≥99 ETH |
| Browser | 3 profiles pre-logged: **A = admin** / **B = doctor** / **C = patient** |
| PPTX | open at Slide 1, Presenter View on secondary monitor |
| OBS | 1920×1080 @ 30fps, H.264, mic peaking −12dB, DND on |
| Quiet | Slack closed, mail closed, phone silent |
| MetaMask window | dragged to primary display so popup appears in-frame |

---

## Block 0 — Intro (0:00–0:30, Slide 1)

**CUE:** Title slide, webcam PiP bottom-right ON.

**SAY:**
> "Hi, I'm Esha Rahman. This is my CN6035 Mobile and Distributed Systems
> coursework — a **Hybrid DApp** for hospital management. The system is a
> React 19 single-page frontend, a Node and Express API on MongoDB, and a
> Solidity smart contract deployed to a local Ganache chain. Every booking,
> payment, and prescription is mirrored on-chain to give us a
> **tamper-proof audit trail**."

**DO:** press ▸ to advance to slide 2 on the last word ("trail").

---

## Block 1 — Project Overview (0:30–1:15, Slides 2 and 8)

**CUE:** Slide 2 (role matrix).

**SAY:**
> "The platform serves four roles. **Admins** get an analytics dashboard,
> user management, blockchain verification, and the audit log.
> **Doctors** manage their own appointment slots and issue prescriptions.
> **Patients** book appointments, pay their bills, and view prescriptions
> with jsPDF exports. **Receptionists** manage bed assignments and
> departments. Authentication is **JWT plus bcrypt on the application
> layer**, and doctor registrations start as pending until an admin
> approves them."

**DO:** ▸ advance to slide 8 at "pending"; ▸ again at end of sentence back to slide 3.

---

## Block 2 — Architecture and Stack (1:15–2:00, Slides 3 and 4)

**CUE:** Slide 3 (architecture diagram).

**SAY:**
> "Architecturally the React client talks to the Express API over REST
> with JWT cookies. The API persists to MongoDB via Mongoose, and mirrors
> every mutating event to the **HospitalRecords** smart contract using
> web3.js. Ganache runs locally on port 7545 — we're using **seeded
> Ganache accounts at chain ID 5777**. On the frontend side, recharts
> drives the analytics, and MetaMask is detected through
> window-dot-ethereum so patients can pay bills directly with a wallet."

**DO:** ▸ slide 4 at "recharts"; ▸ slide 5 at the end.

---

## Block 3 — Smart Contract Tour (2:00–2:45, Slide 5)

**CUE:** Slide 5 (contract code excerpt). Have VSCode with
`blockchain/contracts/HospitalRecords.sol` open on the second monitor in
case you need to fall back.

**SAY:**
> "The contract stores four structs: patient records, appointments, bills,
> and prescriptions — each keyed by the matching Mongo ObjectId so
> on-chain and off-chain stay linked. Writes emit events for
> off-chain indexing, and every mutating function is protected by
> **role-based access control via `onlyOwner`**, so only our deployer
> account can log records. The payBillOnChain function is marked payable
> — it accepts ETH from the patient's wallet and flips the bill status
> to paid in the same transaction."

**DO:** ▸ slide 6 at "same transaction".

---

## Block 4 — Swimlane (2:45–3:15, Slide 6)

**CUE:** Slide 6 (sequence diagram, patient → API → chain).

**SAY:**
> "This is the end-to-end flow for a booking. The patient hits the React
> booking page; the API validates the slot, persists the appointment in
> MongoDB, and immediately calls logAppointment on the contract. The
> resulting **transaction hash is persisted to MongoDB** on the same
> document, so the verification page can later fetch it back and prove
> the booking exists on-chain. Let's see it happen live."

**DO:** on the word "live" — press `Win+D` (or `F11` on the browser) to
hide PowerPoint and bring up Browser Profile A (admin, already on
`/admin`).

---

## Block 5 — LIVE DEMO Part 1 (3:15–5:45)

Three segments. Keep the cursor slow and deliberate. If you fumble,
freeze on a stable slide and splice later.

### 5a — Admin tour (3:15–3:55, 40s)

**CUE:** Browser Profile A on `/admin`.

**DO:** pause 3s on recharts panels so the animated counters finish.

**SAY:**
> "This is the admin dashboard. Four live counters — patients, appointments,
> bills, prescriptions — animate up from zero each render. Below them are
> the recharts panels: a revenue trend, per-doctor breakdown, top diagnoses,
> and an on-chain coverage panel that cross-references MongoDB rows
> against the smart contract."

**DO:** click **Analytics** in the sidebar. Pause 4s.

**SAY:**
> "Analytics is the deeper view — same data, bigger surface. Notice the
> palette and dark glass panels match the Web3 aesthetic across the app."

**DO:** click **Audit Log**. Pause 3s. Scroll one page.

**SAY:**
> "Every mutating action runs through our audit middleware, so logins,
> creations, payments, and approvals are all captured with a user, a
> resource, and a timestamp."

### 5b — Patient books (3:55–4:50, 55s)

**DO:** switch to Browser Profile C (patient), already on `/patient`.

**SAY:**
> "Switching to the patient view. I'll book a new appointment live."

**DO:** click **Find Doctors** → click **View Available Slots** on
Dr. Sarah Smith → click **Book Appointment** on the 24 April 10:00 slot.

**SAY:**
> "The API just created the appointment row, logged it to the contract,
> and returned the transaction hash. In MongoDB it's now stored alongside
> the row; the bell icon in the corner just fired a confirmation
> notification."

**DO:** click the notification bell. Pause on the dropdown 2s. Close it.

### 5c — Admin verifies (4:50–5:45, 55s)

**DO:** switch to Browser Profile A → click **Blockchain Logs** in the
sidebar.

**SAY:**
> "Back on the admin side. The On-Chain Record Counts panel pulls
> counters directly from the smart contract — patients, appointments,
> bills, prescriptions. Because we just added one, the appointments
> counter has incremented."

**DO:** click **Run Verification**. Wait for the green badges.

**SAY:**
> "Run Verification iterates every database row, pulls the stored
> transaction hash, re-fetches the receipt from Ganache, and confirms
> the on-chain entry matches. Green means verified — and the
> **transaction hash is persisted to MongoDB**, fully auditable."

**DO:** ▸ bring slide 7 back for Block 7 — no, stay on demo, go to Block 6.

---

## Block 6 — LIVE DEMO Part 2 (5:45–7:15)

### 6a — MetaMask payment (5:45–6:45, 60s)

**DO:** switch to Browser Profile C (patient) → click **My Bills**.

**SAY:**
> "Now the payment path. Patients see their bills here with paid and
> pending statuses. I'll pay a pending one with MetaMask."

**DO:** click **Pay with MetaMask** on the first pending bill.

**SAY (while popup appears):**
> "MetaMask intercepts the call, shows the ETH amount, the gas estimate,
> and the target contract address."

**DO:** confirm in MetaMask.

**SAY:**
> "This is **fully decentralised settlement** — funds move from the
> patient's Ganache wallet into the contract, which flips the bill's
> paidOnChain flag in the same transaction."

**DO:** switch to Ganache GUI → **Transactions** tab → top row.

**SAY:**
> "Here's the transaction in Ganache — same block, same hash, and the
> To field is our HospitalRecords contract address."

### 6b — Audit cross-check (6:45–7:00, 15s)

**DO:** switch to Profile A → refresh **Blockchain Logs** → the paid
bill shows verified.

**SAY:**
> "Admin verification now shows the bill as verified on both MongoDB and
> the chain."

### 6c — Prescription PDF (7:00–7:15, 15s)

**DO:** switch to Profile C → click **Prescriptions** → click
**Download PDF** on the Type 2 Diabetes prescription → open the file.

**SAY:**
> "PDFs are generated client-side with jsPDF and include the patient,
> doctor, diagnosis, medicines, and the on-chain transaction hash in
> the footer. The record is portable and cryptographically tied to the
> chain entry."

**DO:** ▸ back to PowerPoint, slide 7.

---

## Block 7 — Off-Chain vs On-Chain (7:15–8:00, Slide 7)

**CUE:** Slide 7 (payment decision matrix).

**SAY:**
> "Why support both payment paths? Off-chain payment is fast, familiar,
> and free, but leaves settlement trust with the hospital. On-chain
> payment via MetaMask is **fully decentralised settlement** and
> instantly auditable, but costs gas and requires wallet literacy.
> Offering both lets patients pick — and both paths still write the
> transaction hash to the chain for audit parity. This is a deliberate
> **trade-off between gas cost and auditability**."

**DO:** ▸ slide 11 at "auditability".

---

## Block 8 — Critical Analysis and Limitations (8:00–9:00, Slide 11)

**CUE:** Slide 11 (rationale + limitations). This is the highest-weight
slide — slow down, 60s of airtime minimum.

**SAY:**
> "A few honest **limitations** of the current build. First, the
> HospitalRecords contract uses a single onlyOwner role — in production
> you'd want a richer access-control scheme, probably OpenZeppelin's
> AccessControl, so doctors and auditors have distinct on-chain
> privileges. Second, we're on a local Ganache chain; moving to a public
> testnet would introduce real gas costs and change the
> **trade-off between gas cost and auditability** substantially.
> Third, medicine data is hashed before going on-chain for patient
> privacy, but richer zero-knowledge patterns could let us prove
> properties without revealing the document at all. My **critical
> evaluation** is that the hybrid design pragmatically balances
> developer experience against cryptographic guarantees for a
> coursework deliverable — the hard parts are wired end-to-end."

**DO:** ▸ slide 13 (references) at "end-to-end".

---

## Block 9 — Baseline vs Extension + Future Work (9:00–9:30, Slides 12 and 14)

**CUE:** Slide 12 (Baseline vs Extension).

**SAY:**
> "One slide on scope. The master branch is the pristine upstream —
> a backend-only Node, Express, and MongoDB CRUD app with no
> blockchain and no frontend. The main branch is everything I added
> for this submission: the React 19 SPA, the Solidity contract,
> MetaMask, web3.js, recharts analytics, jsPDF exports, audit
> middleware, tests, and the full presentation bundle. Both branches
> live on the same repo so the tutor can diff them directly. **Future
> work**: IPFS for prescriptions, OpenZeppelin AccessControl, a
> public testnet deployment, and a self-serve MetaMask wallet-link
> flow."

**DO:** ▸ slide 13 (video) at "flow".

---

## Block 10 — Outro (9:30–9:45, Slide 13)

**CUE:** Slide 13, webcam PiP ON again.

**SAY:**
> "The full source is on GitHub at github-dot-com slash rahmane-001
> slash hospital-system, tagged v1.0.0. Thank you."

**DO:** hold on slide 13 for a 1s beat → stop recording.

---

## Rubric Keyword Checklist — cross off after recording

- [ ] "Hybrid DApp" — Intro (Block 0)
- [ ] "Tamper-proof audit trail" — Intro (Block 0)
- [ ] "JWT plus bcrypt on the application layer" — Block 1
- [ ] "Seeded Ganache accounts at chain ID 5777" — Block 2
- [ ] "Role-based access control via `onlyOwner`" — Block 3
- [ ] "Transaction hash is persisted to MongoDB" — Block 5c
- [ ] "Fully decentralised settlement" — Block 6a and Block 7
- [ ] "Trade-off between gas cost and auditability" — Blocks 7 and 8
- [ ] "Limitations" / "Critical evaluation" — Block 8
- [ ] "Future work" — Block 9

If any are unchecked after a take, re-record only that block and splice.

---

## Failure Recovery

| Failure | Action |
|---|---|
| MetaMask popup off-screen | resize MM popup to primary monitor, retry the click |
| Ganache freezes | keep a second Ganache on `:7546` open; if needed stop and remigrate the contract |
| Any live step fumbles | freeze on the last stable slide, cut in post on that transition |
| Audio clips | re-record voice in Audacity and overlay on the screen capture |
| Run-time > 10:00 | cut Block 1b (role matrix recap) — fastest 15s saving |

---

## Post-Record

1. Edit: trim leading/trailing silence, 0.5s head/tail, 1-frame fade.
2. PiP visible only in Blocks 0 and 10.
3. Export: MP4 H.264 1080p30 ~350 MB.
4. Upload to stream.office.com → title
   `CN6035 Coursework — Esha Rahman — Hospital Management DApp`.
5. Copy share URL → paste on Slide 12 placeholder → save PPTX.
6. Final self-check: incognito open Stream link → verify plays.
