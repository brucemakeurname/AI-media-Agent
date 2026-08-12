---
name: design-motion-overlay
description: "Use when executing Phase 3 A-roll Overlay in a top-heading-edit project. Invoked by the motion-video-designer agent. Covers: detecting A-roll clusters from cut_plan + broll_timestamp, selecting overlay type (glass card, comparison chart, stat hero, ranked list, data table, logo card, process flow), building 1/3-frame transparent HyperFrames compositions, rendering as ProRes 4444 MOV, and writing aroll_timestamp.json."
metadata:
  version: 2.0.0
---

# A-roll Overlay Designer Skill

Phase 3 of the top-heading-edit pipeline. You are still the motion-video-designer — this skill loads the Phase 3 rules that differ from Phase 2.

**Always invoke `/hyperframes` before writing any composition HTML.**

---

## How Phase 3 Differs from Phase 2

| | Phase 2 — B-roll | Phase 3 — A-roll Overlay |
|---|---|---|
| Target segments | Selected rich/descriptive segments | All remaining segments NOT in B-roll |
| Grouping | Per selected slot (1 template per slot) | Per cluster (consecutive non-B-roll segments merged) |
| Frame coverage | Full 1080×1920 | 1/3 band: bottom (1280–1920px) default, top (0–640px) for hooks |
| Background | Opaque (template's own bg) | Transparent — main video shows through |
| Output format | `.mp4` (h264) | `.mov` (ProRes 4444 `yuva444p12le`) |
| Output folder | `broll_renders/` | `aroll_renders/` |
| Manifest | `broll_timestamp.json` | `aroll_timestamp.json` |

Everything else — brand kit (color+typography only), HyperFrames constraints, lint+render loop — is identical to Phase 2.

---

## CRITICAL: Assembly Base

> **A-roll overlays must be applied on top of the concatenated zoomed segments (`segments/zoomed/`), NOT on `assembled_broll.mp4`.**

In Phase 5 final assembly the layer order is:
1. Base = concat of all zoomed segments
2. B-roll full-frame overlays at B-roll timestamps
3. A-roll overlays at A-roll timestamps  ← SAME base as B-rolls
4. Subtitle overlay

**FFmpeg overlay pattern:**
```bash
[N:v]setpts=PTS+{asm_start}/TB[ovN];
[prev][ovN]overlay=0:0:eof_action=pass[vN]
```

Two rules that must both be applied:
- `setpts=PTS+{offset}/TB` — delays PTS to the correct position. **Never combine with `-itsoffset` on the same input** — they cancel each other, resetting all frames to t=0.
- `eof_action=pass` — when the MOV ends, filter passes through to the base. Without this, the last overlay frame ghosts indefinitely over subsequent footage.

---

## Paths

| Resource | Path |
|---|---|
| Cut plan | `{project_path}/segments/cut_plan.json` |
| Zoomed segments | `{project_path}/segments/zoomed/` ← assembly base |
| B-roll manifest | `{project_path}/broll_renders/broll_timestamp.json` |
| A-roll output | `{project_path}/aroll_renders/` |
| Package reference | `{project_path}/test-broll/package.json` + `hyperframes.json` |

---

## Phase 3 Execution Checklist

- [ ] Read `cut_plan.json` and `broll_timestamp.json`
- [ ] Detect A-roll clusters (segments not covered by any B-roll)
- [ ] Skip clusters with only 1 segment shorter than 1.0s — too short for effective overlay
- [ ] For each cluster: merge segment texts, choose overlay type from taxonomy
- [ ] Decide position: `bottom` default; `top` for rhetorical questions or hook openings
- [ ] For each cluster: invoke `/hyperframes`, build composition (transparent bg + 1/3 band)
- [ ] Compute `asm_start` from ffprobe actual zoomed segment durations — never use cut_plan nominal durations
- [ ] Lint (`npm run check`) — 0 errors required
- [ ] Render (`npm run render -- --format mov`) → move to `aroll_renders/ar_{N}.mov`
- [ ] Write `aroll_renders/aroll_timestamp.json`

---

## Cluster Detection Algorithm

A segment is **inside a B-roll** if: `seg.start < broll.end AND seg.end > broll.start`

All other segments → sort chronologically → group consecutive runs → each run = one cluster.

```
B-rolls cover segs [4–6] and [11–15]:

  segs 0–3  → not in any B-roll → cluster ar_00
  segs 4–6  → inside B-roll 0   → skip
  segs 7–10 → not in any B-roll → cluster ar_01
  segs 11–15 → inside B-roll 1  → skip
  segs 16–N → not in any B-roll → cluster ar_02
```

**Skip rule:** if a cluster has only 1 segment AND that segment's duration < 1.0s → skip entirely (too short for any overlay type to read properly).

`asm_start` = cumulative sum of ffprobe actual durations of all zoomed segments BEFORE the cluster's first segment.

---

## Overlay Type Taxonomy

Choose based on what the cluster is *showing*, not just what it's *saying*. The same card container (dark navy, cyan left border, grain + shimmer) wraps all types — only the interior component changes.

| Type | When to use | Interior |
|---|---|---|
| **Glass Card** | Narrative captions, conversational segments | Multi-line text with bold/accent/muted spans, optional divider + badge |
| **Comparison Chart** | Two things contrasted ("content vs AI", "human vs bot") | Dual columns, two progress bars with different fill speed/width, VS separator |
| **Stat Hero** | Single dominant number or percentage ("99% fail") | Giant stat (80–120px), label below, optional thin proportion bar |
| **Ranked List** | Numbered points ("Number 1, 2, 3…") | Index column (accent), text column, optional weight bar per row |
| **Data Table** | Cost/metrics breakdown, 2–4 row facts | 2-col table (label \| value), subtle row dividers |
| **Logo Card** | Named tools/brands ("MidJourney, Kling, Luma") | SVG logo + brand name, horizontal or grid layout |
| **Process Flow** | Sequential steps or stages | Left-to-right connected nodes with arrows/dots |

**Rules for all types:**
- Same card container: `rgba(10,14,26,0.88)` background, `border-left: 3px solid #22d3ee`, grain overlay, shimmer sweep
- Content timing synced to spoken word: `rel=` offset = `seg.start − cluster_first_seg.start`
- Fade out 0.5s before cluster end: fade starts at `(render_duration − 0.5s)`
- Low-contrast elements (muted "losing" column, brand watermark) are intentional — not WCAG errors

---

## Composition Rules — Overlay-Specific

### 1. Transparent Body

```css
html, body {
  background: transparent !important;
  margin: 0; padding: 0; overflow: hidden;
}
```

No solid color anywhere on `html`, `body`, or any full-frame wrapper.

### 2. 1/3 Band Container

```html
<!-- Bottom band (default) -->
<div id="band" style="position:absolute; bottom:0; left:0; width:1080px; height:640px; overflow:hidden;">
  <!-- all clip elements go here -->
</div>

<!-- Top band -->
<div id="band" style="position:absolute; top:0; left:0; width:1080px; height:640px; overflow:hidden;">
</div>
```

The band container has **no background**. Only inner cards use `rgba()`.

### 3. Card Container (shared across all types)

```css
#card {
  position: absolute; top: 32–40px; left: 60px; width: 960px;
  background: rgba(10,14,26,0.88);
  border: 1px solid rgba(34,211,238,0.18);
  border-left: 3px solid #22d3ee;
  border-radius: 20px;
  padding: 26–32px 48px 26–32px 44px;   /* reduce to 26px if 4+ elements */
  box-shadow: 0 0 48px rgba(34,211,238,0.07), 0 12px 48px rgba(0,0,0,0.75);
}
```

Use `data-layout-allow-overflow` on card div and shimmer div to suppress false-positive HyperFrames layout errors.

### 4. GSAP Entrance Sequence (all types)

```js
// 0.00s — grain on
// 0.08s — card: y 32→0, opacity 0→1 (power3.out, 0.38s)
// 0.18s — edge-glow opacity 0→1
// 0.28s — brand-tag opacity 0→1
// 0.28s — first content element enters
// ...    — subsequent elements timed to rel= offsets
// (dur−0.50s) — card: opacity→0, y→-8 (power2.in, 0.44s)
// (dur−0.50s) — brand-tag opacity→0
// (dur−0.40s) — grain off
```

### 5. Comparison Chart Pattern

```html
<div id="compare">
  <div class="cmp-col" id="col-a">
    <div class="cmp-label" id="lbl-a">Content</div>   <!-- accent color -->
    <div class="bar-wrap">
      <div class="bar-track"><div id="bar-a"></div></div>
      <span class="bar-pct" id="pct-a">FAST</span>
    </div>
    <div class="cmp-verdict" id="v-a">Comes first</div>
  </div>
  <div id="vs-sep">VS</div>
  <div class="cmp-col" id="col-b">
    <div class="cmp-label" id="lbl-b">AI</div>         <!-- muted color -->
    <div class="bar-wrap">
      <div class="bar-track"><div id="bar-b"></div></div>
      <span class="bar-pct" id="pct-b">LATE</span>
    </div>
    <div class="cmp-verdict" id="v-b">Always behind</div>
  </div>
</div>
```

**Key GSAP rules for comparison bars:**
- "Winning" bar: `{ width:'86%', duration:0.60, ease:'power2.inOut' }` — fast, confident
- "Losing" bar: `{ width:'28%', duration:1.15, ease:'power1.in' }` — the slow fill IS the visual metaphor
- Low contrast on losing side is intentional design

---

## Render

```bash
cd aroll_renders/ar_{N}_comp
npm run render -- --format mov
```

Output: `renders/{name}.mov` — codec `prores`, pix_fmt `yuva444p12le`

Move to `aroll_renders/ar_{N}.mov`.

**Why ProRes 4444 MOV (not WebM or chromakey):**
- ProRes 4444 stores a full 12-bit alpha per pixel — smooth GSAP fades composite pixel-perfectly
- WebM VP9 may silently output `yuv420p` (no alpha) if transparent bg is not detected by the renderer
- Chromakey fails on semi-transparent pixels during fade-in/out causing green fringing

Verify with ffprobe: `pix_fmt=yuva444p12le`, duration within ±0.5s of composition duration.

---

## aroll_timestamp.json Schema

```json
{
  "project": "{project_id}",
  "generated_by": "motion-video-designer",
  "generated_at": "{ISO 8601}",
  "total_clusters": 6,
  "design": "glass-card — dark navy rgba(10,14,26,0.88), cyan #22d3ee left border, grain overlay, shimmer sweep",
  "render_format": "mov (ProRes 4444 yuva444p12le)",
  "assembly_note": "setpts=PTS+{asm_start}/TB + eof_action=pass. Overlay base: segments/zoomed/ concat, NOT assembled_broll.mp4",
  "clusters": [
    {
      "id": "ar_00",
      "segments_covered": [0, 1, 2, 3],
      "cluster_text": "Everyone is shouting that you need to launch an AI influencer right now to get rich.",
      "overlay_type": "glass-card",
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

## SFX Notes for Phase 3

SFX Artist reads `aroll_timestamp.json` after this skill completes.

- Volume lower than B-roll — overlay is secondary: entry 0.20–0.30, accent 0.12–0.18
- Prefer `emphasis/pop.mp3` and `emphasis/tick.mp3` — subtle, non-competing
- Avoid `transition/swoosh.mp3` — too dominant alongside B-roll SFX

---

## Pipeline Integration (v6)

This skill runs as **Phase 3 (A-roll Overlay)** in the v6 talking-head editing pipeline. Required reading at session start:

- Pipeline overview: `talking-head-editing/docs/WORKFLOW-template.md`
- **Logic rules (mandatory):** `talking-head-editing/docs/rules/aroll-overlay-rules.md`
- **Error protocol:** `talking-head-editing/PROTOCOL.md`
- Bug knowledge: `talking-head-editing/docs/debug/bug-codebook/`

**Owner agent:** `motion-video-designer` (calls this skill in Phase 3).
**Downstream:** SFX Artist for Phase 3 SFX assignment, then `video-editor` for Phase 5 final assembly.

### Anti Self-Fix Rule

On ANY error (HyperFrames render fail, MOV output missing alpha, ffprobe duration mismatch, cluster math off):

1. STOP. Do NOT retry. Do NOT switch render format to WebM or chromakey.
2. Write `logs/error_report.json` per PROTOCOL.md schema.
3. Invoke `Agent(subagent_type="debug-video-pipeline", prompt=<error_report content>)`.
4. Apply returned `fix_plan.json` EXACTLY.
5. If `unknown_error: true` → halt + manifest.edit_status=failed.

**Likely BUG hits for Phase 3:** BUG-005 (setpts/itsoffset cancellation when composing into aroll_footage.mp4) · BUG-006 (use ffprobe actual durations, not cut_plan) · BUG-009 (missing eof_action=pass).

## Graph

**Parent:** [[../../../talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]] · [[../../../talking-head-editing/PROTOCOL|PROTOCOL]]
**Rules:** [[../../../talking-head-editing/docs/rules/aroll-overlay-rules|aroll-overlay-rules]]
**Owner agent:** [[../../agents/motion-video-designer|motion-video-designer]]
**Debug:** [[../../agents/debug-video-pipeline|debug-video-pipeline]]
**Downstream:** [[../sfx-artist/SKILL|sfx-artist]] (Phase 3 SFX) · [[../video-editor/SKILL|video-editor]] (Phase 5)
**Template library:** [[../../../motion-researcher/output/Motion Video Template|Motion Video Template Library]]
