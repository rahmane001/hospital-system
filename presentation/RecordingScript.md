# Recording Script — CN6035 Task 2 Video (9:30 target)

Read every `SAY:` line **verbatim**. Rubric markers grep the transcript for
the bold keywords — don't paraphrase them. At 150 wpm each block is already
pace-matched to its time slot.

The **live-demo block (Block 5)** is recorded in **one continuous take**,
driven by a separate companion file: **`presentation/demo.md`**. That
file owns the four-window pre-stage, seven-scene CUE/SAY/DO choreography,
and demo-specific failure recovery. This script only covers slide-driven
narration around it.

---

## T-15 min — Preflight

| Check | Confirm |
|---|---|
| Ganache GUI | running on `:7545`, 10 accounts, chain ID `5777` |
| Backend | `node server.js` → logs `MongoDB Connected` + contract init |
| Frontend | `cd frontend && npm start` → `:3000` |
| DB seeded | `node scripts/seedAccounts.js && node scripts/demoData.js && node scripts/onchainSync.js` |
| MetaMask | Localhost 7545, Ganache key #3 (patient) imported, ≥99 ETH |
| PPTX | open at Slide 1, Presenter View on secondary monitor |
| OBS | 1920×1080 @ 30fps, H.264, mic peaking −12dB, DND on |
| Quiet | Slack closed, mail closed, phone silent |
| MetaMask window | dragged to primary display so popup appears in-frame |

### Four-window pre-stage

See `presentation/demo.md` for the full pre-stage table, MetaMask setup,
and data-prerequisite checklist. All four browser windows (A=admin,
B=receptionist, C=doctor, D=patient) must be logged in and parked on
their URLs before recording starts.

---

## Block 0 — Intro (0:00–0:30, Slide 1)

**CUE:** Title slide, webcam PiP bottom-right ON.

**SAY:**
> "Hi, I'm Esha Rahman. This is my CN6035 Mobile and Distributed Systems
> coursework — a **Hybrid DApp** for hospital management. The system is a
> React 19 single-page frontend, a Node and Express API on MongoDB, and a
> Solidity smart contract deployed to a local Ganache chain. Every booking,
> payment, and prescription is mirrored on-chain to give us a
> **tamper-proof audit trail** across four user roles."

**DO:** press ▸ to advance to slide 2 on the last word ("roles").

---

## Block 1 — Project Overview (0:30–1:15, Slides 2 and 8)

**CUE:** Slide 2 (role matrix).

**SAY:**
> "The platform serves four roles and you'll see all four live today.
> **Admins** get an analytics dashboard, user management, blockchain
> verification, and the audit log. **Receptionists** manage bed
> assignments and departments. **Doctors** create their own appointment
> slots and issue prescriptions. **Patients** book those slots, pay their
> bills on-chain, and download receipts. Authentication is **JWT plus
> bcrypt on the application layer**, and every mutating action is
> audit-logged before it reaches the chain."

**DO:** ▸ slide 8 at "approves"; ▸ slide 3 at end of sentence.

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
> window-dot-ethereum so patients can settle bills directly from a wallet."

**DO:** ▸ slide 4 at "recharts"; ▸ slide 5 at end.

---

## Block 3 — Smart Contract Tour (2:00–2:30, Slide 5)

**CUE:** Slide 5 (contract code excerpt).

**SAY:**
> "The contract stores four structs — patients, appointments, bills, and
> prescriptions — each keyed by the matching Mongo ObjectId so on-chain
> and off-chain stay linked. Every mutating function is protected by
> **role-based access control via `onlyOwner`**, so only our deployer can
> log records. The `payBillOnChain` function is marked payable — it
> accepts ETH from the patient's wallet and flips the bill to paid in a
> single atomic transaction."

**DO:** ▸ slide 6 at "transaction".

---

## Block 4 — Swimlane into the Demo (2:30–2:55, Slide 6)

**CUE:** Slide 6 (sequence diagram).

**SAY:**
> "This is the end-to-end flow. A doctor creates a slot, a patient books
> it, the API persists the appointment and immediately calls the contract,
> and the resulting **transaction hash is persisted to MongoDB** on the
> same document. The admin's verification page fetches that hash back and
> cross-checks it against Ganache in one pass. Let's watch the whole
> thing happen live, end-to-end, across all four roles."

**DO:** on the word "roles" — `Win+D` (macOS: hide PowerPoint, switch to
Window A). From here until Block 6 starts, **do not touch PowerPoint**.

---

## Block 5 — LIVE DEMO, continuous four-role run (2:55–7:30, 4:35)

**Driven entirely by `presentation/demo.md`.** Seven scenes, one take,
four pre-staged Chrome windows, `Cmd+`` between scenes. Rubric keywords
landed in this block: **"fully decentralised settlement"** (Scene 5) and
**"transaction hash is persisted to MongoDB"** (Scene 7).

**End cue:** on the last word of Scene 7 ("fully auditable"), ▸ back to
PowerPoint on slide 7 and resume Block 6 below.

---

## Block 6 — Off-Chain vs On-Chain (7:30–8:00, Slide 7)

**CUE:** Slide 7 (payment decision matrix).

**SAY:**
> "Why support both payment paths? Off-chain payment is fast, familiar,
> and free, but leaves settlement trust with the hospital. On-chain
> payment via MetaMask is **fully decentralised settlement** and instantly
> auditable, but costs gas and demands wallet literacy. Both paths still
> write the transaction hash to the chain for audit parity — this is a
> deliberate **trade-off between gas cost and auditability**."

**DO:** ▸ slide 11 at "auditability".

---

## Block 7 — Critical Analysis and Limitations (8:00–8:50, Slide 11)

**CUE:** Slide 11 (rationale + limitations). Highest-weight slide — slow
down, ≥45s of airtime.

**SAY:**
> "A few honest **limitations**. First, the contract uses a single
> `onlyOwner` role — in production you'd want OpenZeppelin AccessControl
> so doctors, receptionists, and auditors have distinct on-chain
> privileges. Second, we're on a local Ganache chain; moving to a public
> testnet would introduce real gas costs and change the **trade-off
> between gas cost and auditability** substantially. Third, medicine data
> is hashed before going on-chain for patient privacy, but richer
> zero-knowledge patterns could let us prove properties without revealing
> the document at all. My **critical evaluation** is that the hybrid
> design pragmatically balances developer experience against cryptographic
> guarantees for a coursework deliverable — the hard parts, across all
> four roles, are wired end-to-end."

**DO:** ▸ slide 12 at "end-to-end".

---

## Block 8 — Baseline vs Extension + Future Work (8:50–9:15, Slide 12)

**CUE:** Slide 12 (Baseline vs Extension).

**SAY:**
> "One slide on scope. The master branch is the pristine upstream — a
> backend-only Node, Express, and MongoDB CRUD app with no blockchain and
> no frontend. The main branch is everything I added for this submission:
> the React 19 SPA, the Solidity contract, MetaMask, web3.js, recharts,
> jsPDF exports, audit middleware, tests, and this presentation bundle.
> Both branches live on the same repo so the tutor can diff them
> directly. **Future work**: IPFS for prescriptions, OpenZeppelin
> AccessControl, a public testnet deployment, and a self-serve MetaMask
> wallet-link flow."

**DO:** ▸ slide 13 at "flow".

---

## Block 9 — Outro (9:15–9:30, Slide 13)

**CUE:** Slide 13, webcam PiP ON again.

**SAY:**
> "The full source is on GitHub at github-dot-com slash rahmane-001 slash
> hospital-system, tagged v1.0.0. Thank you."

**DO:** hold on slide 13 for a 1s beat → stop recording.

---

## Rubric Keyword Checklist — cross off after recording

- [ ] "Hybrid DApp" — Block 0
- [ ] "Tamper-proof audit trail" — Block 0
- [ ] "JWT plus bcrypt on the application layer" — Block 1
- [ ] "Seeded Ganache accounts at chain ID 5777" — Block 2
- [ ] "Role-based access control via `onlyOwner`" — Block 3
- [ ] "Transaction hash is persisted to MongoDB" — Block 4 (swimlane) + Scene 7
- [ ] "Fully decentralised settlement" — Scene 5 + Block 6
- [ ] "Trade-off between gas cost and auditability" — Blocks 6 and 7
- [ ] "Limitations" / "Critical evaluation" — Block 7
- [ ] "Future work" — Block 8

If any are unchecked after a take, re-record only that block and splice.

---

## Failure Recovery (slide-narration blocks)

Demo-specific failure modes live in `presentation/demo.md`. This table
covers the slide-driven blocks only.

| Failure | Action |
|---|---|
| Audio clips | re-record voice in Audacity and overlay on the screen capture |
| Slide advance skips one | `Shift+▸` to step back, don't apologise on tape |
| Run-time > 10:00 | cut Block 1 role matrix recap — fastest 15s saving |
| PPTX presenter view crashes | `F5` to restart from current slide |

---

## Post-Record

1. Edit: trim leading/trailing silence, 0.5s head/tail, 1-frame fade.
2. PiP visible only in Blocks 0 and 9.
3. Export: MP4 H.264 1080p30 ~350 MB.
4. Upload to stream.office.com → title
   `CN6035 Coursework — Esha Rahman — Hospital Management DApp`.
5. Copy share URL → paste on Slide 13 placeholder → save PPTX.
6. Final self-check: incognito open Stream link → verify plays.
