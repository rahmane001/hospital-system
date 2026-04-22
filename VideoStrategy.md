# Video Presentation Strategy — CN6035 Task 2 (30%)

**Project:** Hospital Management System — Hybrid DApp
**Deliverable:** 10-minute demonstration video uploaded to MS Stream, link embedded on Slide 12 of `HMS_DApp_Presentation.pptx`.
**Rubric targets:** Visual Presentation (5) · Technical Depth & Demonstration (10) · Critical Analysis & Evaluation (10) · Communication & Delivery (5)

---

## 1. Time Budget (10:00 hard cap)

Target total: **9:30** so you have a 30s safety buffer. At ≈150 wpm a minute is ~150 words.

| Time          | Segment                                                                     | Slide(s)      | ~Words | Rubric hit                        |
|---------------|-----------------------------------------------------------------------------|---------------|--------|-----------------------------------|
| 0:00–0:30     | Intro — name, student ID, module, one-line project pitch                    | 1             | 75     | Communication                     |
| 0:30–1:15     | Project overview + role matrix (who does what)                              | 2, 8          | 110    | Visual Presentation               |
| 1:15–2:00     | Architecture walkthrough + tech-stack justification                         | 3, 4          | 110    | Technical Depth                   |
| 2:00–2:45     | Smart contract tour — structs, functions, `payBillOnChain` snippet          | 5             | 110    | Technical Depth                   |
| 2:45–3:15     | Blockchain interaction swimlane (patient booking end-to-end)                | 6             | 75     | Technical Depth                   |
| 3:15–5:45     | **LIVE DEMO Part 1** — admin dashboard → book appointment as patient → show tx hash appearing in Admin ▸ Blockchain Verification | *screen share* | 375 | Technical Demonstration           |
| 5:45–7:15     | **LIVE DEMO Part 2** — pay bill via MetaMask (`payBillOnChain`) → confirm in Ganache → audit log → PDF export | *screen share* | 225 | Technical Demonstration           |
| 7:15–8:00     | Off-chain vs on-chain payment analysis (why we support both)                | 7             | 110    | Critical Analysis                 |
| 8:00–9:00     | Design rationale, trade-offs, limitations                                   | 11            | 150    | **Critical Analysis** (high-weight) |
| 9:00–9:30     | Future work + references                                                    | 11, 13        | 75     | Critical Analysis                 |
| 9:30–9:45     | Thank-you, MS Stream sign-off                                               | 12            | 40     | Communication                     |

**Total words ≈ 1,455** — comfortably below the 1,500-word ceiling at 150 wpm.

---

## 2. Talking-Point Emphasis (rubric keyword hits)

Say these phrases verbatim at least once — markers grep for them in memory:

| Phrase                                                 | Where to drop it                    |
|--------------------------------------------------------|-------------------------------------|
| "**Hybrid DApp**"                                      | Intro + Rationale                   |
| "**Tamper-proof audit trail**"                         | Smart-contract tour + Rationale     |
| "**Transaction hash is persisted to MongoDB**"         | Demo Part 1 (verification moment)   |
| "**Trade-off between gas cost and auditability**"      | Rationale slide                     |
| "**Role-based access control via `onlyOwner`**"        | Smart-contract tour                 |
| "**Critical evaluation**" / "**limitations**"          | Rationale slide                     |
| "**Future work**"                                      | Closing slide                       |
| "**Fully decentralised settlement**"                   | Slide 7 (MetaMask path)             |
| "**JWT + bcrypt on the application layer**"            | Architecture slide                  |
| "**Seeded Ganache accounts at chain ID 5777**"         | Demo setup                          |

---

## 3. Recording Setup (do this the morning of recording)

### Hardware / Software
- **Recorder:** OBS Studio (preferred — supports scene switching) or macOS QuickTime screen-record
- **Resolution:** 1920×1080 @ 30 fps, H.264, ~8 Mbps
- **Audio:** external USB mic if available; levels peaking at **-12 dB**; enable noise suppression
- **Webcam PiP (optional):** 320×180 bottom-right, visible only for intro (0:00–0:30) and outro (9:30–end)
- **Cursor:** enable click-highlight (OBS: "Display Capture" + "Cursor highlight" plugin, or use macOS System Settings ▸ Accessibility ▸ Pointer size 1.5×)

### Pre-flight checklist (run ~15 min before recording)
- [ ] **Ganache** running on port 7545 (chain ID 5777) with 10 unlocked accounts
- [ ] **Backend**: `npm run dev` — logs showing `MongoDB connected` + `Blockchain initialised: <contract address>`
- [ ] **Frontend**: `cd frontend && npm start` on http://localhost:3000
- [ ] **MongoDB**: seeded via `node src/utils/seed.js`
- [ ] **MetaMask**: connected to Localhost 7545, imported one Ganache private key, ≥99 ETH balance
- [ ] **Three browser profiles** pre-logged-in to avoid live typing:
  - Profile A → `admin@hms.com` / `Password123!`
  - Profile B → `doctor@hms.com` / `Password123!`
  - Profile C → `patient@hms.com` / `Password123!`
- [ ] Close Slack, email, notifications (macOS: Focus ▸ Do Not Disturb)
- [ ] Close all tabs except: localhost:3000, Ganache GUI, VSCode with `HospitalRecords.sol` open
- [ ] Hide dock + menu bar extras that expose personal info
- [ ] Mute browser volume (tab audio)
- [ ] Queue PPTX on **Slide 1** in Presenter View on secondary monitor

### Demo choreography (rehearse twice)

**Part 1 — Appointment booking flow (2:30 block)**
1. Switch to Profile A (admin) → `/admin` → pause on recharts panels (≈ 5s) → **SHOT 1 cue**
2. Click **Audit Log** → scroll past a few rows mentioning "Blockchain write logged"
3. Switch to Profile C (patient) → **Book Appointment** → fill date/doctor → Submit
4. Switch back to Profile A → **Blockchain Verification** → **Run Verification** → point cursor at the green "Verified" badge + truncated tx hash → say *"…and the transaction hash is persisted to MongoDB — fully auditable"*

**Part 2 — MetaMask payment (1:30 block)**
1. Profile C → **Bills** → click **Pay with MetaMask**
2. MetaMask popup appears → point out ETH amount + gas estimate → confirm
3. Switch to Ganache GUI → show latest block with the new tx → highlight the `To:` contract address
4. Back to admin → **Blockchain Verification** shows the paid bill as **Verified**
5. Open a prescription → **Download PDF** → open the file — say *"…PDF is generated client-side with jsPDF and linked to the on-chain prescription record"*

---

## 4. Rehearsal Plan

1. **Dry-run ×2** with a stopwatch — no recording, just speak each slide at pace. Aim for 9:30.
2. **Record ×3** takes max — don't over-iterate. Pick the best.
3. **If the live demo flakes** mid-take: cut, reset to the last slide cleanly, and re-record *from that slide only*. Splice in post using OBS or iMovie — acceptable if the cut is on a slide transition.
4. **Backup plan:** the night before, screen-record a clean run of both demo blocks with no narration. If live demos fail during final recording, overlay narration on the pre-recorded footage.

---

## 5. Post-Production & Upload

### Editing
- Trim leading/trailing silence (keep a 0.5s head + tail)
- Add a 1-frame fade-in / fade-out
- Leave the talking head in only for intro + outro (reduces cognitive load during demos)
- Export: **MP4 (H.264)**, 1080p30, ~300–400 MB target

### Upload
1. Go to **stream.office.com** ▸ **Upload video**
2. Title: `CN6035 Coursework — Esha Rahman — Hospital Management DApp`
3. Description: paste one-line project pitch + link to GitHub repo
4. Permissions: **"People in your organization"** (University of East London tenant) + explicitly grant viewing rights to the marking tutor's email
5. Wait for transcode (usually 5–10 min)
6. **Copy the share URL** from the "Share" button — verify it opens in an incognito window for a tutor

### Link the video into the deck
1. Open `HMS_DApp_Presentation.pptx`
2. Slide 12 → replace the `[ Insert MS Stream link here — paste after upload ]` placeholder text with the copied URL
3. Also add the URL to the **title slide speaker notes** as a fallback
4. Save as `HMS_DApp_Presentation.pptx` (keep the filename — the submission expects this)

---

## 6. Submission Bundle

Final files to upload to Moodle / the submission portal:

| File                              | Notes                                                         |
|-----------------------------------|---------------------------------------------------------------|
| `HMS_DApp_Presentation.pptx`      | 13 slides, MS Stream link on Slide 12, refs Apr 2026          |
| `VideoStrategy.md`                | This document (optional evidence of planning)                 |
| GitHub repo URL                   | `https://github.com/rahmane001/hospital-system` (main branch) |
| MS Stream video URL               | Submit separately if portal requires it                       |

---

## 7. Last-Mile Failure Modes (read before recording)

| Risk                                                      | Mitigation                                                   |
|-----------------------------------------------------------|--------------------------------------------------------------|
| MetaMask popup opens off-screen on secondary monitor       | Set MetaMask to primary display window before starting       |
| Ganache crashes mid-demo (rare but happens)                | Keep a second Ganache terminal on port 7546 ready to swap    |
| Tutor's browser blocks MS Stream embed                     | Copy the direct MP4 to OneDrive as a public fallback         |
| Video > 10:00 after first take                             | Cut the role-matrix recap (Slide 8) — fastest 15s saving     |
| Audio clipping                                             | Re-record voice-over separately in Audacity and overlay      |
| Talking head distracting during demo                       | PiP visibility is intro/outro only — enforce in OBS scenes   |

---

## 8. Final Self-Check (green-light criteria)

- [ ] Total runtime ≤ 10:00
- [ ] All 7 rubric keyword phrases spoken at least once
- [ ] Live demo shows a real tx hash persisted and verified on-chain
- [ ] Critical analysis slide (11) gets ≥ 45 seconds of airtime
- [ ] MS Stream link opens in incognito without auth prompt failure
- [ ] Slide 12 contains the pasted URL and PPTX is re-saved
- [ ] GitHub `main` has the 3 hardening commits pushed (ESLint + Jest + blockchain-failure persistence)

---

*Authored alongside the deck builder at `scripts/build_presentation.py` — regenerate the PPTX with `python3 scripts/build_presentation.py` after any content changes.*
