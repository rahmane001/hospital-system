# Presentation Screenshots

Drop 6 screenshots here before regenerating the PPTX. The deck builder script
(`scripts/build_presentation.py`) will read each file by name and embed it on
Slide 9 ("Live Screenshots"). If a file is missing, the script logs a warning
and leaves that grid cell blank — it does not abort.

## Required filenames

| # | Filename                                | What to capture                                                              |
|---|-----------------------------------------|------------------------------------------------------------------------------|
| 1 | `shot-01-admin-dashboard.png`           | `/admin` — overview stat cards + the 4 recharts panels                       |
| 2 | `shot-02-appointment-booking.png`       | `/patient/book` mid-flow OR `/patient/appointments` with a Booked row        |
| 3 | `shot-03-metamask-payment.png`          | MetaMask popup mid-`payBillOnChain` (confirm dialog with ETH amount + gas)   |
| 4 | `shot-04-blockchain-verification.png`   | `/admin/blockchain` after clicking "Run Verification" — tx hashes + badges   |
| 5 | `shot-05-audit-log.png`                 | `/admin/audit` — the audit trail table with a few mutation rows              |
| 6 | `shot-06-prescription-pdf.png`          | The jsPDF download opened in Preview / a PDF viewer                          |

## Capture specs

- Target width: **1920 px** (or at minimum 1280 px — the deck crops/scales)
- Format: **PNG** (JPEG also works; the script auto-detects)
- Hide personal info: use seeded demo accounts (`admin@hms.com`, `doctor@hms.com`,
  `patient@hms.com` — all `Password123!`).
- On macOS: `⌘ + Shift + 4` → spacebar → click the window; or use the built-in
  Screenshot app for a clean window-only capture with shadow.
- Crop any OS chrome / personal bookmarks out of the screenshot if possible.

## Recommended capture order (do it while the app is already running)

1. Log in as **admin** → hit `/admin` → shot 1 → hit `/admin/audit` → shot 5
   → hit `/admin/blockchain` → click "Run Verification" → shot 4.
2. Log out, log in as **patient** → book an appointment → shot 2.
3. Still as patient → go to Bills → click "Pay with MetaMask" → **as soon as
   the MetaMask confirm popup appears**, take shot 3.
4. Open a prescription you've received → click "Download PDF" → open the
   downloaded file in Preview → shot 6.

Once all 6 are here, run:

```bash
python3 scripts/build_presentation.py
```

The output `HMS_DApp_Presentation.pptx` at the repo root will embed them.
