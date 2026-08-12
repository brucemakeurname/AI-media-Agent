# BASE — Structure & Data Flow

**Authoritative top-level map of `BASE/`. Read this before touching any folder inside BASE.**

Last updated: 2026-08-11
Scope: Ultimate Sup BASE directory overview

---

## 1. How to Read This File

This file is the **index, not the manual**. It tells you:
- What lives in each top-level folder
- What each folder is *for* (read vs. write, input vs. output)
- Where data flows between folders during a task

For **detailed schemas, naming rules, and per-folder structure**, jump to the authoritative doc for that sector:

| Sector | Authoritative doc |
|---|---|
| `BRAND KITs/` | `BRAND KITs/BRAND-KIT-STRUCTURE.md` |
| `CAMPAIGNs/` | `CAMPAIGNs/CAMPAIGNs-STRUCTURE.md` |
| `STRATEGIES/` | `STRATEGIES/storage-structure.md` |

**Rule:** read this file first → identify the sector → then read only that sector's doc. Never load all four at once.

---

## 2. BASE Structure (Top Level)

```
BASE/
├── BASE-STRUCTURE.md          ← THIS FILE (index)
│
├── BRAND KITs/                ← Brand reference source library
│   ├── BRAND-KIT-STRUCTURE.md
│   ├── 1. Creative_Prompt_Template/       ← Canonical prompt schema authority & creative analogies
│   ├── 2. HTML_Creative_Prompt_Template/ ← HTML/HyperFrames preset library & sourcing guide
│   ├── 3. HTML_Video_Preset/             ← Video presets & motion guidelines
│   ├── 4. Photoshoot_Prompt_Template/     ← Shared photoshoot prompt library
│   ├── 5. Video_Prompt_Template/          ← Video scene generation prompts
│   ├── 6. Script_Template/                ← Approved script formulas & shooting scripts
│   └── UltimateSup/                       ← Active retail brand kit (logos, guidelines, elements)
│
├── CAMPAIGNs/                 ← Active & historical campaign execution output
│   ├── CAMPAIGNs-STRUCTURE.md
│   ├── UltimateSup Campaign/              ← IP social production (Facebook, Instagram, TikTok)
│   ├── UltimateSup Plus Campaign/         ← Prepared IP tree
│   ├── UltimateAqua Campaign/             ← Prepared IP tree
│   ├── AllenMan Campaign/                 ← Prepared IP tree
│   └── archived/                          ← Historical campaign records
│
└── STRATEGIES/                ← Marketing strategy workspace
    └── storage-structure.md
```

**Production folder convention** (inside any `[IP] Campaign/[Platform]/[Format]/[Date Folder]`) — authority is `CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`:
```
[date or ticket-id]/
├── Ticket.md            ← REQUIRED, written by CMO — the full brief (sole source of truth)
├── timeout.json         ← stall-detection deadline (CMO)
├── manifest.json        ← completion signal (team, written last)
├── caption.md           ← final approved caption
├── [name].jpg / .png    ← final image(s)   [.mp4 for video formats]
└── node/                ← THE ONLY subfolder — every guidance/intermediate file
```
`manifest.json` at the root is the quality gate — CMO reads it before trusting a completion
claim. `node/` holds all working material (design specs, per-image prompts, research, etc.).

---

## 3. Data Flow

### 3.1 The three sectors play different roles

| Sector | Role | Direction | Who writes | Who reads |
|---|---|---|---|---|
| `BRAND KITs/` | Brand reference library: guidelines, templates, prompts, voice, hashtags, and reusable assets | Mostly READ for production; explicit brand-kit updates only | Designer, content-executive, video-editor, researcher | All production roles |
| `STRATEGIES/` | Marketing strategy workspace: strategy, research, planning, and tickets | READ + WRITE by strategy workflows; READ by production roles | Strategy/marketing workflows | Production roles executing approved tickets |
| `CAMPAIGNs/` | Social-media execution output: tickets, prompts, drafts, final assets, QA, and manifests | WRITE by production roles; archive after completion | content-executive, designer, video-editor, notion-publisher | Review and publishing workflows |

### 3.2 The primary output root

**`CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/`** is the **mile-zero output anchor** for every Ultimate Sup social-media production unit.

- **IP** identifies the account or brand line: `UltimateSup`, `UltimateSup Plus` (default for AI Media assets unless requested otherwise), `UltimateAqua`, `AllenMan`, and future IPs.
- **Platform** is one of `Facebook`, `Instagram`, or `TikTok`.
- **Format** follows the platform mapping in `CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`.
- **Date Folder** contains one self-contained content unit with its ticket, final outputs, manifest, and `node/` working files.

Completed historical work stays in `CAMPAIGNs/archived/` and is not used as the active production path.

### 3.3 Typical end-to-end flow

```
TRIGGER                         STAGING                              EXECUTION ROOT
────────────────────────────────────────────────────────────────────────────────────
Approved social ticket          STRATEGIES/[Brand]/.../              CAMPAIGNs/[IP] Campaign/
  → production brief             ticket or active brief               [Platform]/[Format]/YYYY-MM-DD/

Brand/creative reference        BRAND KITs/                           Same production unit;
  → resolves asset or rule gap  asset manifest + guidelines            gap notes remain in node/

Completed production            manifest.json + review status          CAMPAIGNs/archived/
  → retained as history                                             (only when explicitly archived)
```

### 3.4 What every executor reads before starting

| Step | Reads from |
|---|---|
| CMO writes `Ticket.md` | `BRAND KITs/UltimateSup/guidelines/` + active ticket + `CAMPAIGNs/CAMPAIGNs-STRUCTURE.md` |
| content-executive | `BRAND KITs/UltimateSup/text/voice-style.md` + `hashtags.md` + active ticket |
| designer | `BRAND KITs/UltimateSup/guidelines/Visual Guidelines.md` + `BRAND KITs/1. Creative_Prompt_Template/` |
| video-editor | `BRAND KITs/6. Script_Template/` + approved script in `node/` |
| notion-publisher | Approved outputs in date folder + `manifest.json` |

---

---

## Graph

`BASE/BRAND KITs/BRAND-KIT-STRUCTURE.md` · `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md` · `DOCS/FOLDER-STRUCTURE.md`
