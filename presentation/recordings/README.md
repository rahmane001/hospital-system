# Chrome DevTools Recorder — Demo Flows

Pre-scripted Chrome DevTools **Recorder** flows that drive the HMS DApp
end-to-end. Import them into Chrome, replay while OBS captures the screen,
and the choreography stays identical take after take — no manual clicking
mid-demo.

Format: [Puppeteer Replay](https://github.com/puppeteer/replay) JSON
(native Chrome DevTools Recorder export).

---

## Prerequisites

- Ganache running on `:7545`
- Backend: `node server.js`
- Frontend: `cd frontend && npm start`
- MongoDB seeded: `node scripts/seedAccounts.js && node scripts/demoData.js && node scripts/onchainSync.js`
- Chrome **version 105 or newer** (Recorder is built-in)
- Browser profile on Chrome that is **not** already logged in (recording expects the `/login` page). If sessions persist, open `chrome://settings/clearBrowserData` first, or run Chrome with `--guest`.

---

## Import → Replay workflow

1. Chrome → `F12` → **Recorder** panel (if hidden: `⋮` → More tools → Recorder).
2. **Create a new recording** → click the **import** arrow (top toolbar) → choose one of the `.json` files in this folder.
3. Hit **▶ Replay**. Chrome drives the app end-to-end while OBS records the screen.
4. Recorder also supports **step-through** mode (`...` → "Step by step") if you want to pause for narration between clicks.

> **Tip for recording quality:** set Recorder's **Replay speed** to **Slow** so viewers can follow the cursor. The `customStep { ms }` pauses in each file already add breathing room on top.

---

## Flow index

| File | Segment | Duration | Covers |
|------|---------|---------|--------|
| `01-admin-tour.json` | Demo Part 1A | ~25 s | Login as admin → dashboard → Analytics → Blockchain Logs counters → Audit Log |
| `02-patient-book.json` | Demo Part 1B | ~20 s | Login as patient → Find Doctors → View Available Slots → Book Appointment → My Appointments |
| `03-admin-verify.json` | Demo Part 1C | ~15 s | Login as admin → Blockchain Logs → Run Verification → green checks appear |
| `04-rx-pdf.json` | Demo Part 2C | ~15 s | Login as patient → Prescriptions → Download PDF |

Total scripted footage: **~75 s**. The remaining ~2 min of the live-demo block is the **MetaMask payment flow**, which Recorder cannot script (the MetaMask popup is a browser-extension surface, outside the DevTools target tree).

---

## MetaMask payment — manual insert

Perform between `03-admin-verify.json` and `04-rx-pdf.json`:

1. Patient browser profile → **Bills**
2. Click **Pay with MetaMask** on the first pending bill
3. MetaMask popup appears — point at the ETH amount + gas estimate — click **Confirm**
4. Switch to Ganache GUI → latest block → highlight `To:` = contract address
5. Return to admin → **Blockchain Verification** → bill now reads **Verified**

Rehearse twice with a stopwatch; target 90 seconds.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `waitForElement` times out on "Run Verification" | Button text differs per build. Open the Blockchain page manually, inspect, update the `text/…` selector in `03-admin-verify.json`. |
| Login replay fails silently | Session cookie from a previous run. Run Chrome with `--guest` or clear storage for `localhost:3000` first. |
| Recorder complains "no navigation after click" | Remove the `assertedEvents` block from that step — CRA dev server sometimes doesn't fire a full navigation. |
| Replay clicks but nothing visibly happens | Bump the `offsetX / offsetY` so the click lands on the visible label, not a padding area. |

---

## Regenerating / re-recording

If UI labels change, the fastest path is to re-capture the flow live in
Recorder (click the red circle → perform the actions → stop → export as
JSON). Overwrite the file in this folder and commit — the filename is the
stable handle other docs reference.
