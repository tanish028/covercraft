# CoverCraft

A browser extension that generates targeted cover letters and tailors your resume for any job listing — in one click, for free.

Built with Gemini 1.5 Flash (BYOK). Works on Chrome, Firefox, Edge, Brave, and any Chromium-based browser.

---

## Features

- **Auto-extracts job descriptions** from LinkedIn, Internshala, Wellfound, and Naukri
- **Generates cover letters under 150 words** — specific, no filler, no clichés
- **Tailors your resume** to the JD (rewrites bullets, reorders sections, updates skills)
- **Opens tailored resume as a PDF-ready page** — print directly from the browser
- **History tab** — saves your last 50 generated letters with copy/delete
- **Dark mode**, warm editorial design, works offline except for the API call

---

## Installation

### Chrome / Edge / Brave / Opera
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** → select the `covercraft-extension` folder

### Firefox
1. Go to `about:debugging` → **This Firefox**
2. Click **Load Temporary Add-on** → select `manifest.json` inside the folder

> **Note:** Firefox temporary add-ons are cleared on restart. For a permanent install, zip the folder and self-sign it via [addons.mozilla.org](https://addons.mozilla.org/developers/).

---

## Setup

### 1. Get a free Gemini API key
Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and create a key. It's free — no credit card required.

### 2. First launch
Click the CoverCraft icon → paste your API key → **Save and continue**.

### 3. PDF resume support (optional)
PDF parsing requires PDF.js, which is not bundled due to size (~1.5MB). Run this once in PowerShell from the extension folder:

```powershell
.\download_pdfjs.ps1
```

Then reload the extension. After that, `.pdf` uploads work in Settings alongside `.docx` and `.txt`.

---

## Usage

1. Open any job listing on a supported site
2. Click the CoverCraft icon — the JD auto-fills
3. Click **Write letter**
4. Copy the cover letter, or click **View & save PDF** for your tailored resume

If the JD doesn't auto-fill (unsupported site or not on a listing page), paste it manually.

---

## Supported job boards

| Site | Auto-extract |
|------|-------------|
| LinkedIn | ✅ |
| Internshala | ✅ |
| Wellfound / AngelList | ✅ |
| Naukri | ✅ |
| Any other site | Paste manually |

---

## Tech stack

- **Manifest V3** browser extension (Chrome + Firefox compatible)
- **Gemini 1.5 Flash** via Google AI Studio API (free tier)
- **Vanilla JS** — no build step, no bundler
- **PDF.js** (optional, downloaded separately) for PDF resume parsing
- Custom DOCX parser using browser `DecompressionStream` API — no libraries

---

## Project structure

```
covercraft-extension/
├── manifest.json          # Extension manifest (MV3)
├── popup.html             # Extension popup UI
├── popup.js               # All popup logic
├── styles.css             # Styles + dark mode
├── content.js             # JD extractor (runs on job listing pages)
├── download_pdfjs.ps1     # One-time script to download PDF.js
├── pdf.min.js             # (after running download script)
└── pdf.worker.min.js      # (after running download script)
```

---

## Privacy

- Your API key is stored locally in browser storage — never sent anywhere except Google's Gemini API
- Job descriptions and resume text are sent to Gemini only when you click **Write letter**
- No data is collected, no servers involved

---

## License

MIT
