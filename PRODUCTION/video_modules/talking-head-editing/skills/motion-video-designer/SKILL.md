---
name: motion-video-designer
description: "Use when executing Phase 2 B-roll design in a top-heading-edit project. Covers: reading cut_plan.json, selecting B-roll slots (4-5s density, 3-6s duration, sentence-boundary rule), matching motion templates from MOC, running Puppeteer screen captures for screen-type templates, building HyperFrames compositions, rendering, and writing broll_timestamp.json."
metadata:
  version: 1.0.0
---

# Motion Video Designer Skill

Phase 2 of the top-heading-edit pipeline. You design and build B-roll motion compositions using HyperFrames, driven by the cut_plan from Phase 1.

**Always invoke `/hyperframes` before writing any composition HTML.** That skill encodes the framework constraints (clip classes, timeline registration, GSAP rules) that this skill assumes you already know.

---

## Paths

| Resource | Path |
|---|---|
| Cut plan | `{project_path}/segments/cut_plan.json` |
| Template MOC | `D:\1. SOLOFLOWS\INHOUSE TEAMS\2. Media Team\5. Video Hub\motion-researcher\output\Motion Video Template\MOC.md` |
| Template specs | `{template_library_root}/{Channel}/2. Template/{N}-{Name}.md` |
| B-roll output | `{project_path}/broll_renders/` |
| Package reference | `{project_path}/test-broll/package.json` + `hyperframes.json` |
| **Brand kit (default)** | `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\Visual Identity.md` |
| Brand kit root | `D:\1. SOLOFLOWS\BASE\BRAND KITs\` |

---

## Brand Kit Protocol

**Read the design system before writing any composition.** Brand kit scope is strictly limited to **color values** and **typography**. All other decisions (layout, spacing, component structure, animation) follow the motion template spec — do not override them.

> Template structure wins. Brand kit only paints over it.

### Default: Solo Flows

Read at session start:
```
D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\5. design-guidline\HTML Carousel\html-carousel-design-system.md
```

**Apply ONLY these two things:**

**Colors:**

| Token | Hex | Where |
|---|---|---|
| Primary accent | `#1F7FFE` | Highlighted text, active elements, icon color, strokes |
| Neon accent | `#CFFF04` | Italic `<em>` on dark bg only — never as fill or background |
| Dark base | `#1C1C1E` | Dark section/card backgrounds where template allows |
| Light base | `#F4F4F4` | Light backgrounds where template allows |
| Body text on light | `#111` | Main copy on light backgrounds |
| Body text on dark | `#eee` | Main copy on dark backgrounds |
| Muted | `#555` / `#888` | Secondary / caption text |

**Typography:**

| Role | Font | Weight |
|---|---|---|
| Headings / display | Inter | 700–900 |
| Italic emphasis | Playfair Display italic | 400 |
| Body / labels | Inter | 400–600 |

CDN link — add to `<head>` of every composition:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
```

**Do NOT change from the template:**
- Layout and component positions
- Element dimensions and spacing
- GSAP animation targets and keyframes
- HyperFrames `data-*` attributes
- Background pattern/texture if the template defines one

**Logo assets — local SVG files (no web fetch):**

| Use case | SVG path |
|---|---|
| Dark bg, horizontal | `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\SVG\1.PRIMARY_TRANS_BG_darkmode_21x9.svg` |
| Light bg, horizontal | `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\SVG\1.PRIMARY_TRANS_BG_lightmode_21x9.svg` |
| Square / secondary | `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\SVG\2.SECONDARY_TRANS_BG_1x1.svg` |
| Icon / submark | `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\SVG\3.SUBMARK_TRANS_BG_1x1.svg` |

Copy into `br_{N}_comp/assets/logos/` when used.

### Other Brands

Only when production brief explicitly names a different brand client:

1. Read: `D:\1. SOLOFLOWS\BASE\BRAND KITs\{Brand Name}_Brand_Kit\Visual Identity.md`
2. Extract **only** palette + fonts — same narrow scope applies
3. If no kit exists → keep template's original colors/fonts, log `"brand_kit": "not_found"`

**Never mix two brand palettes in the same composition.**

---

## Phase 2 Execution Checklist

Run these steps in order. Mark each done before proceeding.

- [ ] **Read brand design system** — extract color tokens + font stack only
- [ ] Read `cut_plan.json` — load all 65 segments
- [ ] Read `MOC.md` — survey available templates
- [ ] Run **B-roll slot selection algorithm** (see below)
- [ ] For each slot: select template from MOC
- [ ] For each slot: run **Visual Asset Protocol** — detect named entities, fetch SVG logos + place images, confirm Lucide for all icons
- [ ] For each screen-type template: run screen capture protocol
- [ ] For each slot: invoke `/hyperframes`, read template spec, build composition
- [ ] For each slot: lint (`npm run check`) — fix all errors
- [ ] For each slot: render (`npm run render`) — verify output exists
- [ ] Write `broll_renders/broll_timestamp.json`

---

## B-roll Slot Selection Algorithm

### Pass 1: Map sentences

Group segments into sentences. A sentence boundary exists when:
- The segment `text` ends with `.`, `!`, or `?`, OR
- The gap between `seg[N].end` and `seg[N+1].start` is ≥ 0.45s

Label each sentence: `S0, S1, S2, ...`

### Pass 2: Score sentences + Visualizability Gate

Every sentence goes through **two filters** before it can become a slot. Both must pass.

#### Filter A — Visualizability Gate (hard gate, evaluated first)

Ask: **"Can this sentence be rendered as a compelling 3–6s fullscreen motion graphic?"**

A sentence **passes** if it contains at least one of:
- A concrete noun, brand name, or product that can be visually represented (GPU, Midjourney logo, screensaver, startup dashboard)
- A stat or number that works as a hero stat card (99%, $2,840, 300%)
- A clear contrast or opposition with two renderable sides (human content vs AI output, viral vs cringe bot)
- A strong emotion or philosophical statement that pairs with abstract motion (soul, taste, eye, weapon)

A sentence **fails** and is excluded if it is:
- Pure section framing ("Number one,", "And finally,", "So, in summary,")
- A conditional setup with no visual anchor ("So, if you're going to do it,")
- An orphaned clause whose meaning depends entirely on adjacent speech
- A logistical or transitional connector ("Because people confuse using a tool" standalone)

**Sentences that fail visualizability are excluded regardless of score.**

#### Filter B — Algorithmic Score (applied to visualizability-passing sentences only)

| Feature | Score |
|---|---|
| Duration ≥ 3.5s | +3 |
| Duration 2.5–3.5s | +1 |
| Contains a statistic (99%, 300%, a specific number) | +2 |
| Contains a named entity (MidJourney, Kling, Luma, soloflows, NVIDIA) | +2 |
| Contains a descriptive noun (avatar, platform, tool, skin, screensaver, GPU, media, startup) | +2 |
| Contains a comparison or contrast ("like a", "not a", "instead of", "but you") | +1 |
| Contains a metaphor (brush/artist, screensaver, cheat code, weapon) | +1 |
| Is a section header ("Number one,") | −3 |
| Is a short punchy emotional fragment (< 1.5s, emphatic) | −2 |

**Threshold: score ≥ 4 to be eligible** (raised from ≥ 2 to prevent weak B-rolls).

### Pass 3: Select slots

Scan sentences chronologically, tracking accumulated time since the last B-roll end (or video start).

**Trigger rule:** After 4–5s of A-roll without a B-roll, the next eligible sentence (visualizability pass + score ≥ 4) opens a new slot.

**Duration enforcement:**
- Target: 3–6s rendered
- If the winning sentence is 2–3s: merge with the next sentence if combined ≤ 6s and they form a coherent idea
- If the winning sentence is > 6s: set composition duration to a truncated target; template is truncated to scene-01 (or scene-01+02) only
- If no valid sentence exists in a 4–5s window (all fail visualizability or score < 4): skip the window; next window opens 4–5s later

**Sentence boundary rule (strict):**
- The last segment in a slot MUST be the final segment of its sentence — detected by `.`, `!`, or `?` in `text` field, or by sentence label boundary from Pass 1
- Never end a slot mid-sentence. Sentence integrity overrides duration target.

**Template duration adaptation:**
- Template shorter than slot → **extend**: hold the final scene state; push fade-out to match slot duration
- Template longer than slot → **truncate**: use scene-01 only (or scene-01+02); move fade-out to match slot duration
- Set `hyperframes.json` `duration` to the adapted target, not the template's native duration

**Target count:** 8–10 slots for a 60–90s video. Quality over quantity — fewer high-confidence slots beats more mechanical ones.

**Output from Pass 3:** an ordered list of slots:
```
br_00: segments [4,5,6] → start=4.936, end=10.080, dur=5.14s, text="But no one is telling you the ugly truth about why 99%"
br_01: segments [11,12,13,14,15] → start=16.286, end=24.554, dur=8.27s → TRUNCATE to 3.71s (scene-01 only)
br_02: segments [21,22,23,24] → start=30.658, end=36.843, dur=6.19s → TRUNCATE to 4.54s
br_03: segments [25,26,27,28,29] → start=37.223, end=41.847, dur=4.62s → TRUNCATE to 3.46s (scene-01 only)
...
```

---

## Template Matching Guide

After selecting slots, read `MOC.md`. Each MOC entry is 1-3 lines: template name + visual description + best-fit content types.

Map slot content → template:

| Content signal | Preferred template type |
|---|---|
| Platform/app/phone/website | UI App Showcase (with screen capture) |
| Abstract data, viral sensation, algorithms | Particle Form Emerge, Neon Grid Environment |
| Market flooding, saturation, crowded | Isometric City Build, Smooth MoGraph Transition |
| Philosophical / identity / soul / artist | Cloth Simulation, Abstract Color Field, Depth-of-Field Pull |
| Numbers / financial / GPU costs / investment | 3D Typography Motion, Step Mechanical Motion, Technical Blueprint Reveal |
| Personal taste, aesthetics, eyes | Abstract Geometric Transformation, Crystal Fracture Reveal, Holographic Display |
| Tool names (MidJourney, Kling, Luma) | Product Visualization, Holographic Display, 3D Product 360 Spin |
| Startup / business / media company | Architectural Wireframe Build, Cinematic Camera Sweep |

Use each template at most once across all slots (maximize visual variety).

---

## Visual Asset Protocol

Run for **every slot** after template selection. Scan `sentence_text` and the template's planned visual content for named entities.

---

### Step 1: Entity Detection

Identify entities in `sentence_text` by type:

| Type | Examples |
|---|---|
| `brand` | MidJourney, Kling, Luma, Soloflows, OpenAI, TikTok, YouTube, Veo, Runway |
| `place` | Vietnam, Hanoi, Silicon Valley, Tokyo, New York |
| `product` | iPhone, MacBook, a specific device or software product |
| `person` | Named individual (Elon Musk, a specific influencer) |

---

### Step 2: Brand SVG Logo Fetch

For each `brand` or `product` entity:

1. **WebSearch:** `"{brand_name}" logo SVG site:worldvectorlogo.com OR site:commons.wikimedia.org OR site:brandfetch.com`
2. **WebFetch** the SVG file URL from the best result
3. Save to `br_{N}_comp/assets/logos/{brand-slug}.svg`
4. Use in composition:
   ```html
   <img src="assets/logos/{brand-slug}.svg"
        class="clip"
        data-start="0.5" data-duration="4.0" data-track-index="3"
        style="width:200px; position:absolute; left:440px; top:800px;">
   ```
5. **Do not rasterize to PNG** — SVG stays vector for crisp 1080×1920 output
6. If SVG unavailable after 2 attempts → fallback to PNG ≥ 512px, log: `"logo_format": "png_fallback"`

---

### Step 3: Place / Entity Image Fetch

For each `place` or `person` entity:

1. **WebSearch:** `"{entity_name}" photo high resolution`
2. **WebFetch** first viable image URL (JPG/PNG, ≥ 800px wide)
3. Save to `br_{N}_comp/assets/images/{entity-slug}.jpg`
4. Use as background fill or inset panel in the composition

---

### Step 4: Icon Rule — Lucide Only

**Every icon in every composition uses Lucide. No other icon library. No emoji.**

```html
<!-- Load once in <head> -->
<script src="https://unpkg.com/lucide@latest"></script>

<!-- Declare icon -->
<i data-lucide="trending-up"
   class="clip"
   data-start="1.0" data-duration="3.0" data-track-index="5"
   style="position:absolute; left:480px; top:600px; width:64px; height:64px; color:#00ffcc;"></i>

<!-- Initialize after DOM — place just before </body> -->
<script>
  window.addEventListener('DOMContentLoaded', () => lucide.createIcons());
</script>
```

**Icon name lookup:** `https://lucide.dev/icons/` — all names are lowercase kebab-case.

Common icons for this workflow:

| Use case | Lucide icon name |
|---|---|
| Growth / trend | `trending-up` |
| Success / verified | `check-circle` |
| Speed / energy | `zap` |
| Global / internet | `globe` |
| Mobile / phone | `smartphone` |
| Money / revenue | `dollar-sign` |
| AI / brain | `brain` |
| Video | `video` |
| User / person | `user` |
| Star / quality | `star` |
| Warning | `alert-triangle` |
| Arrow right | `arrow-right` |
| Chart | `bar-chart-2` |

**Banned in compositions:** Unicode emoji (😀🔥), Font Awesome (`<i class="fa ...">`), Material Icons, Heroicons, Feather, any non-Lucide icon system.

---

## Screen Capture Protocol

Trigger when the selected template type is "UI App Showcase" or any template with a phone/screen mockup.

Determine capture target from slot `sentence_text`:

| Text contains | Capture target |
|---|---|
| soloflows, platform, AI influencer, influencer | `https://soloflows.com` — relevant page |
| MidJourney / Kling / Luma / specific AI tool | that tool's homepage (WebSearch then WebFetch) |
| news, percent statistics, market | search for a credible article (WebSearch + WebFetch) |
| influencer names (Vey, Khánh Huyền, CHU SAU, Bruce) | pull image from `BASE/CAMPAIGNs/` influencer photo collection |

**Puppeteer script pattern** (write to `broll_renders/br_{N}_comp/assets/` folder):

```js
// capture-screen.mjs
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Puppeteer is installed ONCE at the pipeline root — do NOT npm install per comp
const PIPELINE_ROOT = 'D:/1. SOLOFLOWS/INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing';
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(PIPELINE_ROOT, 'node_modules', 'puppeteer'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'assets', 'mobile-screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const URL = '{target_url}';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport(VIEWPORT);
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Full-page at 1x DPR for scroll strip
await page.setViewport({ ...VIEWPORT, deviceScaleFactor: 1 });
await page.screenshot({ path: path.join(OUT_DIR, 'mobile-fullpage.png'), type: 'png', fullPage: true });

await browser.close();
```

Run from the composition folder: `node capture-screen.mjs`

Do NOT add `puppeteer` to the comp's `devDependencies` and do NOT run `npm install` in the comp dir. Puppeteer is installed once at `talking-head-editing/node_modules/puppeteer` and shared across all comps via `createRequire`.

---

## Composition Design Rules

Apply these 4 rules to every composition before writing a single line of HTML. They override any template spec wherever there is a conflict.

---

### Rule A: Canvas Orientation & Scaling

Check the template spec's native canvas size vs the target canvas. When they differ, recalculate all pixel positions from scratch — never copy a landscape template's px values into a portrait canvas.

**Portrait target (1080×1920, most social short video):**
- LEFT/RIGHT template splits → convert to TOP/BOTTOM splits
- Horizontal scroll/ticker layouts → vertical reveal
- Any element positioned relative to a 1920px-wide canvas → multiply x by 0.5625, multiply y by 1.778

**Landscape target (1920×1080, 16:9 YouTube/presentation):**
- TOP/BOTTOM template splits → convert to LEFT/RIGHT panels
- Vertical stack layouts → horizontal arrangements
- Any element positioned relative to a 1080px-tall canvas → multiply y by 0.5625, multiply x by 1.778

---

### Rule B: Zone Distribution (hard requirement)

Divide the canvas into 3 equal zones. Every zone must have at least 1 active visual element at peak state (after all animations complete, before fade-out).

**Portrait (1080×1920):**
| Zone | px range | Required content |
|---|---|---|
| Top | 0–640px | Category label / brand identifier / context header |
| Mid | 640–1280px | Primary visual — the most important element |
| Bottom | 1280–1920px | Supporting text / detail / CTA / italic accent |

**Landscape (1920×1080):**
| Zone | px range | Required content |
|---|---|---|
| Left | 0–640px | Supporting visual / secondary info |
| Center | 640–1280px | Primary visual |
| Right | 1280–1920px | Label stack / data / accent |

Maximum 50% of any zone may be empty at peak state. If a template clusters everything in the mid zone, redistribute: pull header text to top zone, push body/accent text to bottom zone.

---

### Rule C: Visual Richness Floor

Every composition must have a minimum of 4 distinct animated layers:
1. **Environment layer** — full-canvas bg with texture/grid/gradient/particles. Never just a solid color block.
2. **Primary visual layer** — the main design element (chart, geometric form, city, logo cards, etc.)
3. **Primary text layer** — the key phrase from the sentence, large, legible, branded
4. **Accent / decoration layer** — floating dots, glow rings, scan lines, diagonal stripe, edge light, badge, or any decorative element that adds depth

Additional requirements:
- Minimum 2 distinct animation behaviors (e.g., scale+opacity is one; translate alone is another; stagger drop is another)
- Every composition must reference at least 1 brand color token from #1F7FFE (Electric Blue) or #CFFF04 (Neon, italic dark-bg only)
- Background default: `#1C1C1E` for dark compositions, `#F4F4F4` for light
- Exception to dark default: explicitly semantic colors are allowed IF the template spec requires it AND brand accents appear on text elements

---

### Rule D: Content–Visual Coherence

The visual design must reinforce the spoken sentence — not be a generic template dropped in.

**Visual metaphor match:** the primary visual element must directly represent the sentence meaning:
- Market flooding → city skyline / crowded grid / density field
- Tool comparison → logo cards / product mockups
- Financial cost → blueprint / data table / bar chart  
- Philosophical / soul → abstract color field / geometric dissolution
- Viral vs cringe → split contrast panels
- Personal taste / eye → geometric transformation / prism / lens

**Typography hierarchy** (from largest to smallest):
1. Primary message — largest type, highest contrast, most prominent animation
2. Supporting context — 40–60% the size of primary, secondary color or muted
3. Metadata / branding — smallest, most muted

**Animation narrative sequence** (always follow this order):
```
0.0–0.3s  → Environment establishes (bg, grid, particles fade in)
0.3–1.2s  → Primary visual reveals (the key design element enters)
0.8–1.8s  → Primary text appears (main message, after visual exists)
1.5–2.5s  → Accent elements fire (decorations, secondary text, badges)
2.5s–(end-0.5s)  → Hold state (all elements visible, ambient motion only)
(end-0.5s)–end   → Fade to black (root opacity 0, 0.5s ease-in)
```

For short compositions (< 4s): compress the sequence proportionally, never skip steps.

**Sentence-driven text content:** the bottom zone accent text (Playfair Display italic, #CFFF04) must quote or directly reference the key phrase of the sentence — not generic filler.

---

## HyperFrames Composition Rules

Always invoke `/hyperframes` first. Key constraints enforced by that skill:

1. Every timed element: `class="clip"` + `data-start` + `data-duration` + `data-track-index`
2. No two elements share the same `data-track-index`
3. GSAP timeline: `paused: true`, registered on `window.__timelines["{composition-id}"]`
4. No `Math.random()`, no `Date.now()`
5. No CSS `transform:` on any element that GSAP animates (use pixel-based `left`/`top` positioning instead)
6. For infinite repeats: use finite repeat count → `Math.max(0, Math.floor(totalDuration / halfCycle) - 1)`
7. For 3D effects: `perspective:` on a **parent** div (not `transform: perspective()`) + `transformPerspective` on the element via `gsap.set()`
8. Containers with GSAP children that overflow: add `data-layout-allow-overflow`

---

## Composition Folder Init

For each new B-roll composition at `broll_renders/br_{N:02d}_comp/`:

```bash
# From project_path
mkdir -p broll_renders/br_{N:02d}_comp/assets/mobile-screenshots

# Copy HyperFrames config from test-broll reference
cp test-broll/package.json broll_renders/br_{N:02d}_comp/
cp test-broll/hyperframes.json broll_renders/br_{N:02d}_comp/

# Edit hyperframes.json: update compositions array to reference this composition
# Edit package.json if needed: scripts should already be correct

cd broll_renders/br_{N:02d}_comp
npm install --silent
```

`hyperframes.json` minimal format:
```json
{
  "compositions": [
    {
      "id": "broll-{N:02d}",
      "file": "index.html",
      "width": 1080,
      "height": 1920,
      "fps": 30,
      "duration": {slot_duration_seconds}
    }
  ]
}
```

---

## broll_timestamp.json Schema

```json
{
  "project": "{project_id}",
  "generated_by": "motion-video-designer",
  "generated_at": "{ISO 8601}",
  "total_brolls": 9,
  "brolls": [
    {
      "id": "br_00",
      "start": 4.936,
      "end": 10.080,
      "slot_duration": 5.144,
      "render_duration": 5.267,
      "segments_covered": [4, 5, 6],
      "sentence_text": "But no one is telling you the ugly truth about why 99%",
      "template_channel": "SchoolofMotion",
      "template_name": "11-Hero-Stat-Reveal-Scene",
      "template_category": "stat-reveal",
      "adaptation": "extended — template 4s → slot 5.234s (hold extended, fade pushed)",
      "logos_used": null,
      "screen_capture_url": null,
      "screen_capture_fallback": false,
      "composition_dir": "broll_renders/br_00_comp",
      "render": "broll_renders/br_00.mp4",
      "render_verified": true
    }
  ]
}
```

**Field notes:**
- `slot_duration` = `end - start` (source video coverage, from cut_plan)
- `render_duration` = actual MP4 duration confirmed by ffprobe (may differ from `slot_duration` due to template truncation/extension)
- `adaptation` = human-readable note on how the template duration was adapted
- `logos_used` = array of asset paths if brand SVG logos were placed, else `null`

Set `"render_verified": true` only after ffprobe confirms `codec_name=h264` and `render_duration` within ±0.5s of `slot_duration`.

---

## Render Verification

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,duration \
  -of default=noprint_wrappers=1 \
  broll_renders/br_{N:02d}.mp4
```

Expected: `codec_name=h264`, `duration` within ±0.5s of the slot duration.

---

## Pipeline Integration (v6)

This skill runs as **Phase 2 (B-roll Design)** in the v6 talking-head editing pipeline. Required reading at session start:

- Pipeline overview: `talking-head-editing/docs/WORKFLOW-template.md`
- **Logic rules (mandatory):** `talking-head-editing/docs/rules/broll-selection-rules.md`
- **Error protocol:** `talking-head-editing/PROTOCOL.md`
- Bug knowledge: `talking-head-editing/docs/debug/bug-codebook/`

**Owner agent:** `motion-video-designer` (Video Hub root).
**Master entry point:** `/edit-talking-head-video {project_path}`.

### Anti Self-Fix Rule

On ANY error (ffmpeg non-zero, missing output, HyperFrames render fail, ffprobe duration mismatch, render_verified failed):

1. STOP. Do NOT retry. Do NOT modify the command.
2. Write `logs/error_report.json` per PROTOCOL.md schema.
3. Invoke:
   ```
   Agent(subagent_type="debug-video-pipeline", prompt=<error_report content>)
   ```
4. Read `logs/fix_plan.json` and apply EXACTLY as specified.
5. If `unknown_error: true` → set manifest.edit_status=failed and exit.

**Likely BUG hits for Phase 2:** BUG-006 (don't use cut_plan duration for math) · BUG-008 (B-roll overflow handled in Phase 5 but flagged here).

## Graph

**Parent:** [[../../../talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]] · [[../../../talking-head-editing/PROTOCOL|PROTOCOL]]
**Rules:** [[../../../talking-head-editing/docs/rules/broll-selection-rules|broll-selection-rules]]
**Owner agent:** [[../../agents/motion-video-designer|motion-video-designer]]
**Debug:** [[../../agents/debug-video-pipeline|debug-video-pipeline]]
**Downstream:** [[../sfx-artist/SKILL|sfx-artist]]
