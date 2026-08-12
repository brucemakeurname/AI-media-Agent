# aroll-overlay-rules — Phase 3 A-roll Overlay Logic

> Rules governing A-roll (talking-head) cluster overlays — transparent HyperFrames glass cards on the bottom 1/3 of the frame.

---

## Concept

All segments NOT covered by a B-roll are grouped into **A-roll clusters** — consecutive segment runs between B-rolls. Each cluster gets ONE transparent HyperFrames overlay positioned in the bottom 1/3 (1280–1920px y-range). The overlay displays the cluster's text as animated captions on top of the talking head.

**Core rule:** The main video is always visible. The glass card floats on top — transparent background, full cluster duration.

---

## Cluster Detection

1. Load `broll_renders/broll_timestamp.json` → B-roll time ranges.
2. Load `segments/cut_plan.json` → all segments.
3. A segment belongs to a B-roll if: `seg.start < broll.end AND seg.end > broll.start`.
4. Group remaining segments into consecutive runs → each run = one A-roll cluster.
5. **Skip clusters with a single segment shorter than 1.0s** — too short for effective overlay. Log skipped reason.

Label clusters `ar_00, ar_01, ar_02, …` in order. If `ar_04` is skipped, the next gets `ar_05` (gap is intentional, preserves index alignment with B-roll-relative numbering).

---

## Overlay Type Selection

Choose based on what the cluster is *showing*, not what it's *saying*. Same card container; only the interior content component changes.

| Type | When to use | Key Components |
|---|---|---|
| **Glass Card** | Narrative captions, conversational segments, flowing sentences | Multi-line text with bold/accent/muted spans, optional divider, optional badge |
| **Comparison Chart** | Two things contrasted ("content vs AI", "human vs bot") | Two columns, dual progress bars with different fill speeds, labels, VS-separator |
| **Stat Hero** | Single dominant number or percentage ("99% fail", "3x faster") | Giant stat (80–120px), supporting label below, optional thin proportion bar |
| **Ranked List** | Numbered points or items | Numbered rows with index (accent color), text column, optional weight bar |
| **Data Table** | Cost breakdowns, multi-field comparisons (2–4 rows) | 2-column table (label | value), subtle row dividers, values in accent |
| **Logo Card** | Named tools or brands mentioned ("MidJourney, Kling, Luma") | SVG logo + brand name text, horizontal or grid layout |
| **Process Flow** | Sequential steps, timelines ("ideate → write → post") | Left-to-right connected nodes with arrows or dotted lines |

**Universal rules for all types:**
- Always use the same card container (dark navy glass, cyan left border, grain overlay, shimmer)
- Animate CONTENT to spoken-word timing using `rel=` offset from `cut_plan.json`
- Always fade out 0.5s BEFORE cluster end
- Intentional low-contrast elements (e.g., "losing" column in comparison) are NOT WCAG errors

---

## Design Language — Glass Card

| Property | Value |
|---|---|
| Card background | `rgba(10,14,26,0.88)` |
| Border | `1px solid rgba(34,211,238,0.18)` + `border-left: 3px solid #22d3ee` |
| Border radius | `20px` |
| Box shadow | `0 0 48px rgba(34,211,238,0.07), 0 12px 48px rgba(0,0,0,0.75)` |
| Edge glow | `#22d3ee` strip, `box-shadow: 0 0 18px 3px rgba(34,211,238,0.7)` |
| Grain overlay | SVG `feTurbulence` fractalNoise, `baseFrequency=0.65`, `opacity=0.10` |
| Shimmer | `linear-gradient(120deg, ... rgba(255,255,255,0.50) ...)`, `mix-blend-mode: overlay` |
| Font | Inter 500, 38–40px, `color: rgba(230,238,255,0.88)`, `line-height: 1.38–1.40` |
| Bold spans | `font-weight: 700`, `color: #ffffff` |
| Accent spans | `font-weight: 700`, `color: #22d3ee`, `text-shadow: 0 0 24px rgba(34,211,238,0.45)` |
| Muted spans | `color: rgba(230,238,255,0.60)` |
| Divider | `1px` line, `background: linear-gradient(90deg, rgba(34,211,238,0.55), transparent)` |
| Badge | `background: rgba(34,211,238,0.10)`, `border: 1px solid rgba(34,211,238,0.35)`, pill shape |
| Brand tag | `SOLOFLOWS` watermark, `color: rgba(34,211,238,0.22)`, `font-size: 13px`, bottom-right |

**Card sizing:**
- Standard (2–3 lines): `padding: 32px 48px 32px 44px`
- Dense (4+ lines): reduce padding to 28px, font-size to 38px to fit the 640px band

---

## GSAP Animation Sequence (per cluster)

```
0.00s  grain opacity → 0.10 (grain animation starts)
0.08s  card: y 32→0, opacity 0→1 (power3.out, 0.38s)
0.18s  edge-glow: opacity 0→1 (0.30s)
0.28s  brand-tag: opacity 0→1 (0.28s)
0.28s  first caption line: y 14→0, opacity 0→1 (power2.out, 0.28s)
...    subsequent lines: staggered by spoken word timing (rel= from cut_plan.json)
       dividers animate width 0→100% at section breaks (power2.out, 0.36s)
       badges fade in at section entry points
(end-0.50s)  card: opacity→0, y→-8 (power2.in, 0.44s) ← fade-out
(end-0.50s)  brand-tag: opacity→0 (0.28s)
(end-0.40s)  grain: opacity→0 (0.30s, animation stops)
```

**Shimmer:** Fires once on the punchline line (boldest/most important caption). At `t = (punchline_start + 0.15s)`: `x: -130% → 130%`, `opacity 0 → 1`, `duration 0.65s`.

---

## Line Splitting & Timing

For each cluster:
1. Merge all segment `text` values into one descriptive sentence.
2. Split into 2–4 display lines (2–6 words per line) — preserve semantic units.
3. Map each line's start time to `rel=` offset from cluster's first segment start:
   ```
   line_rel_time = seg.start − cluster_first_seg.start
   ```
4. Lines with punchlines (key facts, verbs, metrics) → use `.accent` spans and trigger shimmer.

---

## HyperFrames Composition Setup

For each cluster:
1. Create `aroll_renders/ar_{N}_comp/` — copy `package.json` + `hyperframes.json` from template.
2. Write `index.html`:
   - `data-composition-id="aroll-{N}"` on `#root`
   - `data-duration="{render_duration}"` = cluster source duration (ffprobed)
   - Band container: `position: absolute; bottom: 0; left: 0; width: 1080px; height: 640px;`
   - Card inside band: `position: absolute; top: 40px; left: 60px; width: 960px;`
   - Add `data-layout-allow-overflow` on the card div AND shimmer div (suppresses false-positive HyperFrames layout errors)
3. Run `npm run check` — 0 errors required. WCAG contrast warnings on brand watermark are intentional — ignore.
4. Render: `npm run render -- --format mov` → `renders/aroll-{N}.mov` (ProRes 4444, `yuva444p12le`).
5. Move to `aroll_renders/ar_{N}.mov`.

---

## Why ProRes 4444 MOV (not WebM or chromakey)

ProRes 4444 stores full 12-bit alpha per pixel. Smooth GSAP fades and shimmer overlays composite pixel-perfectly.

- **WebM VP9** may silently output `yuv420p` (no alpha) if transparent background is not detected. Unreliable.
- **Chromakey (#00FF00)** fails on semi-transparent pixels during fade-in/out, causing green fringing on every fade boundary.

MOV ProRes 4444 is the only correct choice for any composition with opacity animations.

---

## Timestamp Computation (CRITICAL)

**A-roll timestamps must be computed from ACTUAL ffprobed zoomed-segment durations, NOT from `cut_plan.json` nominal durations.**

Zoomed segments (`segments/zoomed/`) are consistently 33–61ms longer than planned (FFmpeg keyframe padding). Over many segments this accumulates to multi-second drift.

**Procedure:**
1. `ffprobe` every zoomed segment for actual duration.
2. Sum actual durations within each cluster → cluster duration.
3. Compute cumulative `asm_start` from accumulated actuals.
4. Apply scale-correction factor (see `assembly-rules.md` Rule 4) if base_zoomed.mp4 re-encode inflates further.

---

## Composite into aroll_footage.mp4

```bash
ffmpeg -f concat -safe 0 -i segments/zoomed_concat.txt -c copy aroll_renders/base_zoomed.mp4

ffmpeg -i aroll_renders/base_zoomed.mp4 \
  -i ar_00.mov -i ar_01.mov ... \
  -filter_complex "
    [1:v]setpts=PTS+{asm_start_0}/TB[ov0];
    [N:v]setpts=PTS+{asm_start_N}/TB[ovN];
    [0:v][ov0]overlay=0:0:eof_action=pass[v0];
    [vN-1][ovN]overlay=0:0:eof_action=pass[vN]
  " \
  -map "[vN]" -map 0:a -c:v libx264 -crf 18 -preset fast -c:a copy \
  aroll_renders/aroll_footage.mp4
```

**Two critical rules:**
1. `setpts=PTS+{asm_start}/TB` — delays overlay PTS to correct timeline position. **Never combine with `-itsoffset`** on the same input (they cancel each other, reset frames to t=0).
2. `eof_action=pass` — when MOV overlay ends, filter passes through base video. Without this, last frame is held indefinitely (ghosting).

See `assembly-rules.md` Rule 3 for full discussion.

---

## aroll_timestamp.json Schema

```json
{
  "project": "{project_id}",
  "generated_by": "motion-video-designer",
  "generated_at": "ISO 8601",
  "total_clusters": 0,
  "design": "glass-card — dark navy rgba(10,14,26,0.88), cyan #22d3ee left border, grain overlay, shimmer sweep",
  "render_format": "mov (ProRes 4444 yuva444p12le)",
  "assembly_note": "setpts=PTS+{start}/TB + eof_action=pass on overlay filter",
  "clusters": [
    {
      "id": "ar_00",
      "segments_covered": [0, 1, 2, 3],
      "cluster_text": "...",
      "position": "bottom",
      "composition_dir": "aroll_renders/ar_00_comp",
      "render": "aroll_renders/ar_00.mov",
      "render_duration": 3.924,
      "asm_start": 0.000,
      "asm_end": 4.103,
      "asm_cluster_dur": 4.103,
      "render_verified": true
    }
  ]
}
```

---

## SFX Assignment (Phase 3 Step 2)

`sfx-artist` reads `aroll_timestamp.json` + each composition's `index.html`. Assigns per-cluster SFX.

**Rules — different from Phase 2:**
- Volume LOWER (overlay is secondary layer): entry 0.20–0.30, accent 0.12–0.18
- Prefer `emphasis/pop.mp3` and `emphasis/tick.mp3` — subtle, don't compete with B-roll SFX
- **No `transition/swoosh.mp3`** for overlays — too dominant for secondary layer
- Optional accent at shimmer fire time on punchline

**Output:** `aroll_renders/aroll_sfx_timestamp.json`.

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW-template|WORKFLOW-template]]
**Sibling rules:** [[broll-selection-rules|broll-selection-rules]] · [[assembly-rules|assembly-rules]]
