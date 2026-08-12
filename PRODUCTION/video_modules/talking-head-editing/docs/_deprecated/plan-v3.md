# TikTok Video Editor V3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all V2 issues — aggressive 1-2s cuts, user's real SFX collection, B-roll correctly replacing video footage, vivid colored SVG illustrations, B-roll with source audio continuing.

**Architecture:** Force-sub-divide segments to ~1.8s max (instead of silence-only splits). B-roll images overlay on top of muted video — source audio still plays from Video element, B-roll image hides talking head visually. User's 25 SFX files copied to public/sfx/user/ and assigned randomly per cut. Vivid colored SVGs (gradients + fills) replace plain outlines.

**Tech Stack:** Same as V2 + ffmpeg for SFX conversion.

---

## What Changed vs V2

| Area | V2 | V3 |
|---|---|---|
| Cuts | 7 (silence-only, 0.8s gap) | ~40-50 (force-split at 1.8s max per segment) |
| MIN_SEG_DURATION | 0.5s (lost "It doesn't.") | 0.2s (preserve short emphatic phrases) |
| SFX source | 4 synthetic tones | User's 25 real SFX from Google Drive |
| SFX play rate | Every segment (7x) | Every segment (~40-50x) |
| B-roll behavior | Behind video (invisible) | ON TOP of video (replaces talking head visually) |
| B-roll fade | Fades out last 15 frames | Full opacity entire segment |
| Illustration style | White outlines (boring) | Colored fills with gradients |
| Illustration size | 128px | 200px |
| B-roll assignment | Only 3 segments (keyword-based) | 35% of all segments (~14-17 segments) |
| Output | test/final.mp4 | test2/final.mp4 |

---

## File Map

| File | Action |
|---|---|
| `scripts/detect-cuts.js` | Modify: MIN_SEG_DURATION=0.2, add forceSplitLongSegments() at 1.8s |
| `scripts/copy-sfx.js` | Create: copy user's 25 SFX files to public/sfx/user/ as numbered MP3s |
| `scripts/assign-assets.js` | Modify: use user SFX pool; 35% B-roll ratio (not keyword-gated) |
| `scripts/download-illustrations.js` | Modify: vivid colored SVGs with fills/gradients; 200px icons |
| `scripts/generate-broll.js` | Modify: 80% Unsplash / 20% DALL-E; B-roll for eligible segs |
| `src/components/BrollLayer.tsx` | Modify: full opacity (no fade); sits ON TOP of video |
| `src/VideoEditor.tsx` | Modify: render video first, BrollLayer after (z-order fix) |
| `test2/final.mp4` | Output |

---

## Task 1: Aggressive Force-Split in detect-cuts.js

- [ ] Add `TARGET_MAX_DURATION = 1.8` constant
- [ ] Change `MIN_SEG_DURATION` from 0.5 to 0.2
- [ ] Add `forceSplitLongSegments(segments)` function that splits any segment > 1.8s at word boundaries
- [ ] Call forceSplitLongSegments before writing cuts.json
- [ ] Re-run: `node scripts/detect-cuts.js` — expect ~40-50 segments

## Task 2: Copy User SFX Collection

- [ ] Create `scripts/copy-sfx.js`
- [ ] Scan `G:\My Drive\1. BRAND RESOURCE\6. SFX` for all .mp3/.wav/.m4a
- [ ] Convert each to `public/sfx/user/sfx-NN.mp3` via ffmpeg (128kbps, normalize volume)
- [ ] Write `public/sfx/user/manifest.json` with list of file names + original names
- [ ] Run: `node scripts/copy-sfx.js`

## Task 3: Update assign-assets.js

- [ ] Load SFX from manifest.json (user pool)
- [ ] B-roll: 35% probability per segment (seeded RNG), no keyword gate
- [ ] Zoom pool unchanged

## Task 4: Vivid Colored Illustrations

- [ ] Rewrite download-illustrations.js with colored SVG library (8 themed icons)
- [ ] Use gradients + solid fills (not white outlines)
- [ ] Size 200×200px
- [ ] Map segment keywords → themed icon

## Task 5: Fix BrollLayer — On Top, Full Opacity

- [ ] Remove opacity fade-out
- [ ] Ensure it renders after video in VideoEditor (z-order = on top)

## Task 6: Fix VideoEditor Render Order

- [ ] Video renders first (provides audio + visual base)
- [ ] BrollLayer renders after (on top, fully covers video when hasBroll=true)

## Task 7: Run Pipeline + Render to test2/

```bash
node scripts/copy-sfx.js
node scripts/detect-cuts.js
node scripts/assign-assets.js
node scripts/download-illustrations.js
node scripts/generate-broll.js
npx remotion render VideoEditor --output test2/final.mp4 --codec h264 --pixel-format yuv420p --crf 18
```

---

## Run Order

```bash
node scripts/copy-sfx.js
node scripts/detect-cuts.js
node scripts/assign-assets.js
node scripts/download-illustrations.js
node scripts/generate-broll.js
npx remotion render VideoEditor --output test2/final.mp4 --codec h264 --pixel-format yuv420p --crf 18
```


## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/remotion-composite/CLAUDE|remotion-composite/CLAUDE]]