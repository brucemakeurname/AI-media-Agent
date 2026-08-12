# BASE/CAMPAIGNs — Campaign Structure

**Last updated:** 2026-08-11  
**Scope:** Ultimate Sup social-media production only

---

## Purpose

`BASE/CAMPAIGNs/` is the canonical working library for social-media campaigns. Root folders represent individual IP campaigns (e.g. `UltimateSup Campaign`, `UltimateSup Plus Campaign`, `AllenMan Campaign`), leading directly to **Platform → Format → Production Unit**.

## Canonical Structure

```text
BASE/CAMPAIGNs/
├── UltimateSup Campaign/
│   ├── Facebook/
│   │   ├── Single Post/
│   │   ├── Multiple Post/
│   │   └── Reel/
│   ├── Instagram/
│   │   ├── Single Post/
│   │   ├── Carousel/
│   │   └── Reel/
│   └── TikTok/
│       └── Short Video/
├── UltimateSup Plus Campaign/ ← Prepared IP tree
├── UltimateAqua Campaign/     ← Prepared IP tree
├── AllenMan Campaign/         ← Prepared IP tree
├── archived/                   ← Completed historical campaign records
└── CAMPAIGNs-STRUCTURE.md     ← This file
```

Each `[IP] Campaign/` folder uses the exact same platform and format structure. AI Media output defaults to `UltimateSup Plus Campaign` unless the ticket specifies another IP. Add a new IP by cloning this folder layout.

## Production Unit

**Hierarchy:** `[IP] Campaign → Platform → Format → [Date Folder]`

The date folder is one self-contained piece of content. Use the scheduled publish date when present; otherwise use the creation date.

```text
UltimateSup Campaign/TikTok/Short Video/2026-08-11/
├── Ticket.md          ← Required approved brief and acceptance criteria
├── manifest.json      ← Written last; completion and review status
├── caption.md         ← Final approved caption, when applicable
├── [name].jpg/.png    ← Final image deliverable(s), when applicable
├── [name].mp4         ← Final video deliverable, when applicable
└── node/              ← Prompts, source maps, drafts, QA, logs, and handoffs
```

If more than one item uses the same IP, platform, format, and date, use `YYYY-MM-DD-2`, then `YYYY-MM-DD-3`. Do not mix multiple independent posts in one date folder.

Only final deliverables and the required root files belong at the production-unit root. All working, intermediate, and review artifacts belong in `node/`.

## Platform / Format Mapping

| Platform | Supported folders |
| --- | --- |
| Facebook | `Single Post`, `Multiple Post`, `Reel` |
| Instagram | `Single Post`, `Carousel`, `Reel` |
| TikTok | `Short Video` |

Add a new format only after it is defined for the platform and cloned consistently to every applicable IP.

## Naming and Operating Rules

- Use the exact IP, platform, and format folder names defined above.
- Use descriptive kebab-case filenames for final assets and `node/` artifacts.
- Start production only after `Ticket.md` identifies the product/SKU, factual source, platform, format, language, CTA, and active offer conditions when applicable.
- Write `manifest.json` after the required final files exist and verification is complete. A missing manifest means the production unit is not complete.
- Do not overwrite an approved final. Create a revision in a new date-folder suffix and record it in the manifest.
- Keep campaign-specific assets in their production unit; read reusable brand assets from `BASE/BRAND KITs/`.

## Archive

`archived/` holds completed historical campaign records that predate the canonical structure. Preserve their internal files and folder names; do not place new campaign work there.

When a completed campaign using the canonical structure must be archived, move its whole date folder into `archived/` only after its delivery and review status are final. New social-media work must use the canonical tree above.

## Out of Scope

This library does not contain client-booking, personal-brand, SEO, or email-marketing campaign buckets. It is reserved for Ultimate Sup IP social-media production.

---

## Graph

`BASE/BRAND KITs/BRAND-KIT-STRUCTURE.md` · `BASE/CAMPAIGNs/UltimateSup Campaign/` · `DOCS/FOLDER-STRUCTURE.md`
