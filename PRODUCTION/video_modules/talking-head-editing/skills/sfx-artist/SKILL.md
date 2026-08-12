---
name: sfx-artist
description: "Phase 2/3/5 audio skill. Phase 2 — reads broll_timestamp.json + compositions, classifies motion energy, assigns entry + accent SFX, writes broll_sfx_timestamp.json. Phase 3 — reads aroll_timestamp.json + compositions, assigns lighter overlay SFX per cluster, writes aroll_sfx_timestamp.json. Phase 5 — searches for royalty-free instrumental BGM, downloads to audio/bgm.mp3, writes bgm_manifest.json with volume and fade spec."
metadata:
  version: 2.0.0
---

# SFX Artist Skill

Three phases of audio work. Run only the phase that was requested — each phase has its own checklist and output file.

---

## Paths

| Resource | Path |
|---|---|
| B-roll manifest | `{project_path}/broll_renders/broll_timestamp.json` |
| B-roll compositions | `{project_path}/broll_renders/br_{N}_comp/index.html` |
| A-roll manifest | `{project_path}/aroll_renders/aroll_timestamp.json` |
| A-roll compositions | `{project_path}/aroll_renders/ar_{N}_comp/index.html` |
| Assembled timeline | `{project_path}/assembled_timeline.json` |
| SFX pool | `D:\1. SOLOFLOWS\INHOUSE TEAMS\2. Media Team\5. Video Hub\hyperframe-video-gen\assets\sfx\` |
| B-roll SFX output | `{project_path}/broll_renders/broll_sfx_timestamp.json` |
| A-roll SFX output | `{project_path}/aroll_renders/aroll_sfx_timestamp.json` |
| BGM audio | `{project_path}/audio/bgm.mp3` |
| BGM manifest | `{project_path}/audio/bgm_manifest.json` |

---

## Phase 2: B-roll SFX

### Checklist

- [ ] List SFX pool files
- [ ] Read `broll_timestamp.json`
- [ ] For each B-roll: read `index.html`, classify motion energy
- [ ] Assign entry SFX (required) + accent SFX (optional)
- [ ] Write `broll_sfx_timestamp.json`

### SFX Pool Inventory

```
sfx/
├── transition/
│   ├── swoosh.mp3         ← kinetic entries, fast slides, card flips
│   ├── whoosh_down.mp3    ← gravity/weight, elements falling or settling
│   └── rise.mp3           ← upward motion, reveal from below
├── emphasis/
│   ├── tick.mp3           ← data/stat reveal, mechanical step
│   ├── pop.mp3            ← soft reveal, abstract fade-in
│   └── deep_boom.mp3      ← high-impact abstract, fracture, burst
└── alert/
    └── notification.mp3   ← UI/app reveal, phone animation
```

Read actual files before assigning. Map to closest semantic match if filenames differ.

### Motion Energy Classification

For each B-roll, read `index.html` and find the first `tl.to()` or `tl.fromTo()` call:

| GSAP first tween signature | Energy class |
|---|---|
| `rotationY` / `rotationX`, ease `power3.out` or `back.out` | **Kinetic-3D** |
| `scale` rapid (≤ 0.4s), ease `power2.out`–`power4.out` | **Kinetic-Scale** |
| `y` large distance (> 100px), ease `power2.inOut` | **Kinetic-Vertical** |
| `scaleY` on strip elements, staggered | **Kinetic-Cloth** |
| `opacity` only, ease `sine.inOut` or `power1.out` | **Soft-Fade** |
| `x` slide-in, ease `power2.out` | **Kinetic-Horizontal** |
| Per-vertex / particle scatter math | **Kinetic-Particle** |
| `drawSVG` or `strokeDashoffset` | **Soft-Draw** |

### SFX Selection Table

| Energy class | Entry SFX | Entry vol | Accent SFX | Accent vol |
|---|---|---|---|---|
| Kinetic-3D | `transition/swoosh.mp3` | 0.42 | `alert/notification.mp3` at screen reveal | 0.22 |
| Kinetic-Scale | `transition/swoosh.mp3` | 0.38 | `emphasis/pop.mp3` at text reveal | 0.20 |
| Kinetic-Vertical | `transition/rise.mp3` | 0.40 | `emphasis/pop.mp3` at element settle | 0.22 |
| Kinetic-Cloth | `transition/whoosh_down.mp3` | 0.38 | `emphasis/pop.mp3` at text reveal | 0.20 |
| Soft-Fade | `emphasis/pop.mp3` | 0.30 | *(none)* | — |
| Kinetic-Horizontal | `transition/swoosh.mp3` | 0.38 | *(none)* | — |
| Kinetic-Particle | `transition/swoosh.mp3` | 0.42 | `emphasis/tick.mp3` at particle peak | 0.25 |
| Soft-Draw | `emphasis/tick.mp3` | 0.32 | `emphasis/pop.mp3` at completion | 0.20 |

**UI App Showcase (screen/phone):** entry = `alert/notification.mp3` (0.38), accent = `transition/swoosh.mp3` at phone settle (0.22).

**Data/stat templates (3D Typography, Technical Blueprint):** entry = `emphasis/tick.mp3` (0.35), accent = `emphasis/deep_boom.mp3` at climax (0.28) if applicable.

### Accent Offset Detection

Find the tween where the main element reaches its final visible state. The `absolute start time` of that tween = accent offset.

```js
tl.to("#text-headline", { opacity: 1, duration: 0.52 }, 2.45);
// Text visible at t ≈ 2.45 + 0.52/2 = 2.71 → accent offset 2.71
```

Never schedule accent SFX in the last 0.5s of the slot.

### broll_sfx_timestamp.json Schema

```json
{
  "project": "{project_id}",
  "generated_by": "sfx-artist",
  "generated_at": "{ISO 8601}",
  "brolls": [
    {
      "id": "br_00",
      "start": 4.936,
      "end": 10.080,
      "duration": 5.144,
      "template_name": "15-Particle-Form-Emerge",
      "energy_class": "Kinetic-Particle",
      "sfx": [
        {
          "file": "transition/swoosh.mp3",
          "offset_sec": 0.0,
          "volume": 0.42,
          "reason": "particle emergence kinetic entry"
        },
        {
          "file": "emphasis/tick.mp3",
          "offset_sec": 1.65,
          "volume": 0.25,
          "reason": "text reveal at particle peak"
        }
      ]
    }
  ]
}
```

`offset_sec` is relative to the B-roll's own `start` (0.0 = first frame of B-roll).

### Phase 2 Quality Rules

1. Every B-roll gets exactly 1 entry SFX at `offset_sec: 0.0`
2. Accent SFX is optional; include only when a clear peak moment exists
3. Maximum 2 SFX events per B-roll — no over-layering
4. No SFX in the last 0.5s of any B-roll
5. No two consecutive B-rolls with the same entry SFX
6. All file paths must exist — verify before writing manifest

---

## Phase 3: A-roll SFX

### Checklist

- [ ] Read `aroll_timestamp.json`
- [ ] For each cluster: read `ar_{N}_comp/index.html`, classify overlay energy
- [ ] Assign 1 entry SFX per cluster (lighter than B-roll — these are overlays, not full-frame cuts)
- [ ] Write `aroll_sfx_timestamp.json`

### Overlay vs. B-roll SFX Differences

| | B-roll SFX | A-roll SFX |
|---|---|---|
| Role | Marks a full visual cut | Marks an overlay appearing |
| Entry volume | 0.38–0.42 | 0.20–0.28 (softer — doesn't dominate) |
| Accent SFX | Optional | Rarely needed — overlays are brief |
| Energy read from | Full composition GSAP | Overlay GSAP (entrance tween only) |

### A-roll SFX Selection

A-roll overlays are 1/3-frame text/icon motion. Classify by the overlay's entrance animation:

| Overlay entrance | SFX |
|---|---|
| Slide-in from side | `transition/swoosh.mp3` at 0.22 |
| Fade in / opacity only | `emphasis/pop.mp3` at 0.20 |
| Scale pop / bounce | `emphasis/pop.mp3` at 0.24 |
| Mechanical step / counter | `emphasis/tick.mp3` at 0.22 |
| Notification/badge style | `alert/notification.mp3` at 0.20 |

If unsure, default to `emphasis/pop.mp3` at 0.20 — it's neutral and won't distract.

### aroll_sfx_timestamp.json Schema

```json
{
  "project": "{project_id}",
  "generated_by": "sfx-artist",
  "generated_at": "{ISO 8601}",
  "clusters": [
    {
      "id": "ar_00",
      "start": 0.0,
      "end": 4.936,
      "duration": 4.936,
      "segments_covered": [0, 1, 2, 3],
      "sfx": [
        {
          "file": "emphasis/pop.mp3",
          "offset_sec": 0.0,
          "volume": 0.20,
          "reason": "overlay fade-in entrance"
        }
      ]
    }
  ]
}
```

`offset_sec` is relative to the cluster's `start` in the assembled video.

### Phase 3 Quality Rules

1. Every cluster gets exactly 1 entry SFX
2. No accent SFX for A-roll (overlays are subtle — 1 sound only)
3. Volume cap: 0.28 max. A-roll SFX must sit below B-roll SFX in the mix
4. No SFX in the last 0.3s of the cluster

---

## Phase 5: Background Music

### Checklist

- [ ] Read `assembled_timeline.json` — note `total_duration`
- [ ] Determine video mood from `cut_plan.json` topic/content
- [ ] Search for royalty-free instrumental track
- [ ] Download BGM to `audio/bgm.mp3`
- [ ] Write `audio/bgm_manifest.json`

### Mood Detection

Read a few lines from `cut_plan.json` to understand the video topic. Map to BGM mood:

| Video topic | BGM mood | Style keywords |
|---|---|---|
| Business / productivity / growth | Confident, forward-moving | Lo-fi corporate, minimal electronic |
| Tech / AI / digital tools | Futuristic, clean | Ambient tech, synth minimal |
| Personal brand / identity | Warm, authentic | Acoustic guitar, soft indie |
| Money / finance / strategy | Focused, neutral | Cinematic piano, neutral ambient |
| Motivational / mindset | Energetic, uplifting | Upbeat electronic, pop instrumental |

Solo Flows default mood: **ambient tech / minimal electronic** — clean, non-distracting, builds energy without overwhelming the spoken word.

### BGM Search Protocol

1. WebSearch: `royalty free instrumental "{mood}" background music site:pixabay.com OR site:freemusicarchive.org OR site:bensound.com`
2. Pick a track ≥ 90s long (will be looped / trimmed to fit)
3. WebFetch the download link (MP3 direct URL)
4. Download to `{project_path}/audio/bgm.mp3`

**Preferred sources (always check these first):**
- Pixabay Music (pixabay.com/music/) — no attribution required, free download
- Bensound (bensound.com) — attribution required; log in manifest
- Free Music Archive (freemusicarchive.org) — check license (CC0 or CC-BY only)

**Banned:** tracks with copyright, Spotify/YouTube Music embeds, any track requiring purchase.

### Volume and Fade Spec

| Parameter | Value |
|---|---|
| `volume` | 0.10–0.15 (BGM must sit far below voice) |
| `fade_in_sec` | 1.5 |
| `fade_out_sec` | 2.0 |

The video-editor skill handles the actual fade using `afade=t=in` and `afade=t=out` in ffmpeg — these values are passed through the manifest.

### bgm_manifest.json Schema

```json
{
  "project": "{project_id}",
  "generated_by": "sfx-artist",
  "generated_at": "{ISO 8601}",
  "track": {
    "title": "Minimal Tech Loop",
    "artist": "Pixabay Music",
    "source_url": "https://pixabay.com/music/...",
    "license": "Pixabay License",
    "attribution_required": false
  },
  "file": "audio/bgm.mp3",
  "volume": 0.12,
  "fade_in_sec": 1.5,
  "fade_out_sec": 2.0,
  "total_video_duration_sec": 87.512
}
```

### Phase 5 Quality Rules

1. BGM must be instrumental — no vocals (vocals compete with the speaker)
2. Volume 0.10–0.15 only — BGM is atmosphere, not the feature
3. Track length ≥ 90s OR loopable (seamless loop preferred so Assembly can use `-stream_loop -1`)
4. Log source URL and license in manifest — required for compliance
5. Verify file downloads successfully: `ffprobe audio/bgm.mp3` confirms duration

---

## Pipeline Integration (v6)

This skill runs in **Phase 2 (B-roll SFX), Phase 3 (A-roll SFX), and Phase 5 (BGM)** of the v6 talking-head editing pipeline. Required reading at session start:

- Pipeline overview: `talking-head-editing/docs/WORKFLOW-template.md`
- **Logic rules:** `talking-head-editing/docs/rules/broll-selection-rules.md` (Phase 2 SFX section), `aroll-overlay-rules.md` (Phase 3 SFX section), `assembly-rules.md` (Phase 5 music mix)
- **Error protocol:** `talking-head-editing/PROTOCOL.md`
- Bug knowledge: `talking-head-editing/docs/debug/bug-codebook/`

**Owner agent:** `sfx-artist` (Video Hub root).
**Invoked by:** `motion-video-designer` (Phase 2, 3) · `video-editor` (Phase 5).

### Anti Self-Fix Rule

On ANY error (file download fail, ffprobe fail on bgm.mp3, missing composition for SFX inference, etc.):

1. STOP. Do NOT retry. Do NOT pick a different SFX.
2. Write `logs/error_report.json` per PROTOCOL.md schema.
3. Invoke `Agent(subagent_type="debug-video-pipeline", prompt=<error_report content>)`.
4. Apply returned `fix_plan.json` EXACTLY.
5. If `unknown_error: true` → halt + manifest.edit_status=failed.

## Graph

**Parent:** [[../../../talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]] · [[../../../talking-head-editing/PROTOCOL|PROTOCOL]]
**Rules:** [[../../../talking-head-editing/docs/rules/broll-selection-rules|broll-selection-rules]] · [[../../../talking-head-editing/docs/rules/aroll-overlay-rules|aroll-overlay-rules]] · [[../../../talking-head-editing/docs/rules/assembly-rules|assembly-rules]]
**Owner agent:** [[../../agents/sfx-artist|sfx-artist]]
**Debug:** [[../../agents/debug-video-pipeline|debug-video-pipeline]]
**Upstream:** [[../motion-video-designer/SKILL|motion-video-designer]] · [[../design-motion-overlay/SKILL|design-motion-overlay]]
**Downstream:** [[../video-editor/SKILL|video-editor]]
