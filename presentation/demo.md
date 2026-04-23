# Demo Script — Live Four-Role Run (4:35 continuous take)

Companion to `RecordingScript.md`. This file covers **only the live-demo
block** (Block 5 in the recording script, 2:55 → 7:30). The rest of the
script stays slide-driven narration — this is the one segment recorded
screen-share, one take, no cuts.

**Principle:** four Chrome windows pre-staged, one per role. The only
transition between scenes is `Cmd+`` (backtick) to cycle windows. Zero
typing mid-flow, zero tab-hunting. If a scene fumbles: freeze on the
failing window for 2 seconds, continue, splice in post on the window
switch.

---

## Pre-stage (run before hitting record)

Open Chrome with **four separate windows** (`Cmd+N` for new window — not
tabs). Log each in, park on the URL, then verify `Cmd+`` cycles A → B → C
→ D → A in order.

| Window | Position | URL on standby | Account |
|---|---|---|---|
| **A — Admin** | 1 | `/admin` | `admin@hms.com` / `Password123!` |
| **B — Receptionist** | 2 | `/receptionist/beds` | `receptionist@hms.com` / `Password123!` |
| **C — Doctor** | 3 | `/doctor/appointments` | `doctor@hms.com` / `Password123!` |
| **D — Patient** | 4 | `/patient` | `patient@hms.com` / `Password123!` |

**MetaMask:** only Window D needs it. Unlock once before recording so the
payment flow doesn't prompt for the wallet password mid-take. Confirm the
account shows ≥ 99 ETH and network is `Localhost 7545`.

**Data prerequisites:**
- Window B → `Bed Management` shows at least one card with badge **Available**
- Window D → `My Bills` has at least one row with badge **Pending**
- Window D → `Find Doctors` lists Dr. Sarah Smith with ≥ 1 slot

All three land from the seed (`seedAccounts.js` + `demoData.js` +
`onchainSync.js`). Verify before recording.

---

## Scene 1 — Admin tour (Window A, 0:45 → ends at 3:40)

**CUE:** Window A on `/admin`. Pause 3s on recharts counters so the
animation finishes.

**SAY:**
> "Starting on the admin dashboard. Four live counters animate from zero
> — patients, appointments, bills, prescriptions. The recharts panels
> below show revenue trend, per-doctor breakdown, top diagnoses, and an
> on-chain coverage panel that cross-references MongoDB rows against the
> smart contract. Next to it, the analytics page and the audit log —
> every mutating action runs through our audit middleware and lands here
> with a user, a resource, and a timestamp."

**DO:** click **Blockchain Logs** in sidebar. Pause 2s on On-Chain counts
panel.

**SAY:**
> "And this is the blockchain verification page. The counters come
> directly from the contract. I'll return here at the end of the run to
> cross-verify everything we're about to create."

**DO:** `Cmd+`` → Window B.

---

## Scene 2 — Receptionist assigns a bed (Window B, 0:35 → ends at 4:15)

**CUE:** Window B on `/receptionist/beds`.

**SAY:**
> "Switching to the receptionist. Bed management is fully role-scoped —
> receptionists see every ward, assign patients to available beds, and
> release occupied beds on discharge. I'll assign a new patient to an
> open bed."

**DO:** click **Assign** on the first **Available** bed card. Modal opens.

**SAY:**
> "The modal pulls the patient list from the API, and the assignment is
> audit-logged the moment I submit."

**DO:** pick any patient from **Select Patient** → click **Assign Bed**.
Confirm card flips to **Occupied**.

**DO:** `Cmd+`` → Window C.

---

## Scene 3 — Doctor creates an appointment slot (Window C, 0:35 → ends at 4:50)

**CUE:** Window C on `/doctor/appointments`.

**SAY:**
> "Switching to the doctor. Doctors own their own schedule — they create
> the slots that patients then book. I'll add a fresh slot right now."

**DO:** click **+ Add Slot**. Modal opens.

**SAY (while filling):**
> "Date and time, a consultation fee in pounds, and submit. The backend
> creates the appointment row, logs it to the chain, and the slot becomes
> immediately bookable."

**DO:** date 2 days out at 10:00 → fee `85` → click **Create Slot**.
Confirm slot card appears in list.

**DO:** `Cmd+`` → Window D.

---

## Scene 4 — Patient books that slot (Window D, 0:50 → ends at 5:40)

**CUE:** Window D on `/patient`.

**SAY:**
> "Switching to the patient. From the dashboard I'll find a doctor and
> book the slot the doctor just created."

**DO:** **Find Doctors** sidebar → **View Available Slots** on Dr. Sarah
Smith → new slot from Scene 3 at bottom of list with £85 price tag.

**SAY:**
> "There's the slot — created thirty seconds ago, already showing with
> its consultation fee. The price came from the API projection we added
> so the booking card renders correctly. I'll book it."

**DO:** click **Book Appointment** on new slot. Toast confirms.

**SAY:**
> "The API just created the appointment row, logged it to the contract,
> and wrote the transaction hash back onto the same document. The bell
> icon fired a notification. A pending bill was also created behind the
> scenes — which is what we'll pay next."

**DO:** click bell briefly to show notification dropdown, close it.

---

## Scene 5 — Patient pays with MetaMask (Window D, 0:55 → ends at 6:35)

**DO:** click **My Bills** sidebar. Pending bill at top.

**SAY:**
> "Patients see every bill here, paid and pending. I'll settle a pending
> one on-chain."

**DO:** click **Pay with MetaMask**.

**SAY (while popup animates in):**
> "MetaMask intercepts the transaction. It shows the ETH amount, the gas
> estimate, and the destination — our HospitalRecords contract address."

**DO:** confirm in MetaMask. Wait 2s for confirmation toast.

**SAY:**
> "And that's **fully decentralised settlement**. Funds moved from the
> patient's Ganache wallet into the contract, which flipped the bill's
> paidOnChain flag in the same atomic transaction."

**DO:** switch to Ganache GUI for 3 seconds → **Transactions** tab → top
row.

**SAY:**
> "There's the transaction in Ganache — latest block, matching hash, and
> the To field is the HospitalRecords contract."

**DO:** return to Window D.

---

## Scene 6 — Patient downloads the receipt PDF (Window D, 0:30 → ends at 7:05)

**CUE:** Window D on `My Bills`. Newly-paid bill shows green **Paid** badge.

**DO:** click **Receipt** on the just-paid bill. PDF opens in new tab.

**SAY:**
> "Every paid bill produces a client-side receipt via jsPDF. The header
> carries the hospital details, the body shows the bill breakdown, and
> the footer pins the on-chain transaction hash — so the receipt is
> cryptographically tied to the block. Patients can save, print, or
> forward this without ever touching the backend."

**DO:** scroll to PDF footer so tx hash visible. Pause 2s. Close PDF tab.

---

## Scene 7 — Admin cross-verifies (Window A, 0:25 → ends at 7:30)

**DO:** `Cmd+`` until Window A surfaces. Already on **Blockchain Logs**.

**SAY:**
> "Back to admin. Appointments and bills counters have both incremented
> since the start of the run. Now the verification pass."

**DO:** click **Run Verification**. Wait for green badges to paint.

**SAY:**
> "Run Verification iterates every database row, pulls the stored
> transaction hash, re-fetches the receipt from Ganache, and confirms the
> on-chain entry matches. Green means verified — the booking from Scene 4
> and the bill we just paid both show up, and the **transaction hash is
> persisted to MongoDB**, fully auditable."

**DO:** ▸ back to PowerPoint, slide 7 — hand back to `RecordingScript.md`
Block 6.

---

## Timing recap

| Scene | Window | Duration | End time |
|---|---|---|---|
| 1. Admin tour | A | 0:45 | 3:40 |
| 2. Receptionist bed assign | B | 0:35 | 4:15 |
| 3. Doctor creates slot | C | 0:35 | 4:50 |
| 4. Patient books slot | D | 0:50 | 5:40 |
| 5. Patient MetaMask pay | D | 0:55 | 6:35 |
| 6. Receipt PDF | D | 0:30 | 7:05 |
| 7. Admin verification | A | 0:25 | 7:30 |

Total: **4:35** (start 2:55, end 7:30). ~620 spoken words + 25s
deliberate pauses (MetaMask popup animation, recharts counters, green-
badge paint).

---

## Failure recovery (demo-specific)

| Failure | Action |
|---|---|
| MetaMask popup off-screen | drag popup to primary monitor, retry the click |
| Ganache freezes | swap to second Ganache on `:7546` (kept warm) |
| Scene 3 slot doesn't show in Scene 4 | Window D sidebar → **Dashboard** → **Find Doctors** again (forces refetch) |
| Scene 5 bill list empty | fall back to pre-seeded pending bill from `demoData.js` (top row) |
| Scene 2 modal patient dropdown empty | re-seed: `node scripts/seedAccounts.js && node scripts/demoData.js` |
| Window order scrambled after `Cmd+`` | close outliers, re-open in A → B → C → D order |
| Any live scene fumbles | freeze on failing window 2s, continue; splice on `Cmd+`` transition |

---

## Rubric keywords landed in this block

- "Transaction hash is persisted to MongoDB" — Scene 7
- "Fully decentralised settlement" — Scene 5

(Remaining keywords land in slide-narration blocks — see `RecordingScript.md`.)
