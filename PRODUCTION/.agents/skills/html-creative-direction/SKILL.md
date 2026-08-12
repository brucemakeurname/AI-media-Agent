---
name: html-creative-direction
description: Brand-adaptive creative direction for the CONTENT slides (2..N) of an HTML-composed carousel — the cover (slide 1) is always an AI-generated photo via gpt-img-2-gen/creative-direction, never HTML, per Nam's 2026-08-03 rule (HTML/CSS can't fake a photorealistic hook). Retrieve+score a Frame Treatment from the curated 13-preset library at `BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/`, apply the ticket's Brand Kit tokens, author each content slide as a valid HyperFrames composition, and render HTML→PNG via `hyperframes snapshot` (the render engine, vendored at `video_modules/hyperframes`). html-carousel first (static slides); short-video (MP4 via `hyperframes render`) is the same contract with `render` instead of `snapshot`. Designer picks this per ticket, as a sibling to creative-direction / photography-direction / html-carousel-gen.
---

# html-creative-direction

The **HTML/HyperFrames** creative-direction mechanism — the brand-adaptive counterpart to
`html-carousel-gen`'s single fixed design system. Where `creative-direction` grounds AI **image**
generation in the `1. Creative_Prompt_Template` library, this skill grounds **HTML-composed**
visuals in `BASE/BRAND KITs/1a. HTML_Creative_Prompt_Template/` — a curated, versioned copy of
HyperFrames' 13 named frame-presets (design system + sample render each) — and renders
deterministically to PNG via the vendored HyperFrames engine.

**Hard rule (2026-08-03, Nam): the cover slide is NEVER HTML.** Slide 1 of any html-carousel is
generated via `gpt-img-2-gen` (through `creative-direction`, same mechanism `img-carousel` uses for
its own cover) — a real/photorealistic AI image, because HTML/CSS cannot fake a credible product
photo or human subject the way a hook slide needs. **This skill owns slides 2..N only** — the
content slides, where typography/data/quote/chart layouts (exactly what the 13 presets are built
for) genuinely outperform a generated photo. The workflow (`[social]_[html-carousel].md`) is what
sequences "cover via gpt-img-2-gen, then content via this skill" — see that file.

**Verified working on this env 2026-08-03** — `bun install` in `video_modules/hyperframes` (exit 0),
CLI v0.7.66; `hyperframes snapshot` rendered 13/13 presets to clean 3:4 (1080×1440) samples with
correct Vietnamese diacritics and brand tokens, plus a live Dân Trí photo-sourcing test (see
`IMAGE-SOURCING-GUIDE.md`).

**Scope now:** html-carousel — static content slides → PNG (cover excluded, see above). **Later
(same contract):** short-video — animated compositions → MP4 via `hyperframes render`. Keep this
skill **separate** from `html-carousel-gen` (the legacy fixed-design fallback); the designer chooses
one per ticket.

## Where the template library and the render engine live (read for depth, don't duplicate)

**Template library (retrieval source — read this first):**
`BASE/BRAND KITs/1a. HTML_Creative_Prompt_Template/` — 13 preset folders (`{preset}/FRAME.md` +
`{preset}/sample-3x4.png`), plus `HTML-CREATIVE-TEMPLATE-STRUCTURE.md` (index + mood table),
`frame-md-schema.md` (schema authority), `IMAGE-SOURCING-GUIDE.md` (real-photo crawl mechanism).
**This folder, not the vendored hyperframes path, is what Steps 2-3 below link to.**

**Render engine (mechanism only):** vendored at
`video_modules/hyperframes/`. Delegate to its own skills
for anything the template library doesn't already cover:
- `skills/hyperframes-creative/` — the original source of the 13 presets, plus palettes/typography/
  composition-patterns/house-style/data-in-motion for anything beyond the 13 (rare).
- `skills/hyperframes-registry/` — block/example discovery (secondary source, motion-first — see Step 3).
- `skills/hyperframes-core/` — the composition contract (`data-*` timing, `class="clip"`,
  `window.__timelines`). Read before authoring composition HTML.
- `skills/hyperframes-cli/` — `snapshot` (→ PNG), `render` (→ MP4), `lint`, `check`.

## Inputs

| Param | Source |
|---|---|
| `ticket_path` | `Ticket.md` — brand, channel (→ canvas size), format, language, `output_dir` |
| `brief_path` | `node/creative-brief.md` (+ `node/slides-copy.md` if content-executive wrote per-slide copy) — topic, slide count, per-slide points, on-slide copy |
| `brand_kit` | `BASE/BRAND KITs/{brand}_Brand_Kit/` — palette, fonts, logo. Tokens are **law**. |
| `cover_path` | `{{campaign_folder}}/slide_01.png` — the already-rendered `gpt-img-2-gen` cover (written by the workflow before this skill runs). Read for mood/color harmony (Step 4); this skill never generates or edits it. |
| `hyperframes_root` | `video_modules/hyperframes/` — registry + skills |
| `output` | slides 2..N → `{{campaign_folder}}/` root; direction + working files → `node/` |

## Canvas size by channel (set on the root `data-width`/`data-height` AND `body`)

| Channel / use | Ratio | Pixels |
|---|---|---|
| Stories / Reels cover / TikTok | 9:16 | **1080×1920** |
| Instagram/Facebook feed carousel | 1:1 | 1080×1080 |
| Portrait feed (max real estate) | 4:5 | 1080×1350 |
| Template library sample standard | 3:4 | 1080×1440 (all 13 `sample-3x4.png` use this) |

## Step 1 — Intake

Read `Ticket.md` + `node/creative-brief.md` (+ `node/slides-copy.md`). Extract topic, **slide count**
(cover + N content [+ CTA] — this skill only authors the N content slides; the workflow handles
slide 1 separately via `gpt-img-2-gen`), per-slide points, language (Vietnamese default), brand,
channel → canvas size. Same brief contract as every other direction mechanism; participates in the shared
`# Gap Request — Round N` / `## Round N answers` loop if the brief is missing something (never guess).

## Step 2 — Brand spec (`node/frame.md`) — start from a frame-preset

**Primary retrieval source: `BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/{preset}/FRAME.md`**
— 13 preset folders, each a complete, pre-scored frame-scale design system
(colors/typography/spacing/components in frontmatter = normative; all 13 verified rendered
2026-08-03 at 3:4 — clean, correct Vietnamese diacritics, tokens applied consistently; samples at
each preset's own `sample-3x4.png`). Pick the closest **mood** match (see the table in
`HTML-CREATIVE-TEMPLATE-STRUCTURE.md` for the full look/pick-when per preset — e.g.
`blue-professional` = consulting-grade restraint, single cobalt accent; `claude` = warm-editorial,
terracotta; `blockframe` = neobrutalist, punchy; `bold-poster` = editorial poster, red). Copy the
chosen preset's `FRAME.md` to `node/frame.md`, then **override its color/font tokens with the
ticket's real Brand Kit** (palette, fonts, logo) — keep the preset's **structural** tokens (radii,
shadow style, spacing ratios, component shapes) since those encode the mood; only the brand-identity
tokens (hex values, font families) change. Solo Flows 2026 defaults if no client Brand Kit
overrides: background `#FAF6EC`, ink `#10233F`, accent yellow `#F2B705`, blue `#2472F8`; display
Montserrat, body Inter; logo from the brand kit's `1. logo/`. `atoms are sacred, composition is
free, numbers come from the script` — the preset's own principle; never invent stats, always
resolve them from the ticket. Schema authority + full resolution rules:
`2. HTML_Creative_Prompt_Template/frame-md-schema.md`.

**If no preset mood fits**, fall back to the vendored
`video_modules/hyperframes/skills/hyperframes-creative/references/{visual-styles,house-style}.md`
or the interactive `design-picker.md` before writing a fully bespoke spec.

## Step 3 — Retrieve + score a Frame Treatment (template-first)

Each `FRAME.md` documents **5-6 named "Frame Treatments"** in its own body (e.g.
`blue-professional` has Cover / Dashboard / Bar Ranking / Pull Quote / Split+Highlight /
Closing-CTA) — these are the **static-composition-ready layouts**, each with a documented recipe
(ground · composes · focal · chrome · accent · silence · density) and an **aspect-ratio behavior
table** (how the treatment reflows for 16:9/9:16/1:1). Match the ticket's content-format + per-slide
role to a Frame Treatment (same template-first discipline as `creative-direction` Method 2/3):

- stat / data / % → **Dashboard**/**Stat Grid** treatment
- ranked list / comparison → **Bar Ranking**
- quote / testimonial → **Pull Quote**
- narrative / two-part content → **Split + Highlight**
- hook / cover slide → **Cover**
- CTA / final slide → **Closing/CTA**

Log the chosen preset + treatment + why in `node/html-direction.md`. Only design a fresh treatment
from the vendored `hyperframes-creative/references/composition-patterns.md` if the preset's own
treatments don't fit the content shape — this should be rare; the 13-preset library covers the
common moods already.

**Secondary source (optional, only if the 13-preset library genuinely doesn't fit):**
`video_modules/hyperframes/registry/{blocks,examples}/`. ⚠️ **Verified finding 2026-08-03: these are
motion-first, NOT built for a single static frame.** Grabbing an arbitrary timestamp via `snapshot`
produces either an empty pre-entrance frame, mid-transition overlapping layers, or a sparse frame
(elements that haven't entered yet) — confirmed live on the `vignelli` example (6.92s = two caption
layers overlapping; 0s = blank; 10.38s = clean but sparse). **Never literally snapshot a registry
block/example mid-timeline and ship it as a slide.** Some *are* usable as-is because their content is
inherently static/single-state (`data-chart` rendered cleanly at any
mid-animation timestamp since a chart doesn't "enter" piecewise) — verify per item before trusting
one. When in doubt, prefer a preset's Frame Treatment and author the static composition yourself
(Step 5) using the block only as visual-language inspiration, same as this skill already does for
frame-presets.

## Step 3.5 — Vertical-fill check (mandatory whenever canvas ≠ the preset's native 16:9)

⚠️ **Verified failure mode 2026-08-03, hit on every first-pass 9:16 render:** every `frame-preset`
is authored for **1920×1080**. Its aspect-ratio table (e.g. "title top, diagonal band below" for
9:16) is a **repositioning** hint only — it does NOT redistribute content mass to fill the extra
height. Naively top-anchoring the 16:9 composition onto a 1080×1920 canvas leaves **30-60% of the
bottom of the frame visually dead** (confirmed by direct measurement: an unfixed `blockframe` Stat
Grid slide left ~36% empty below the last card; an unfixed `cobalt-grid` Hero Cover left ~55-60%
empty below the headline). This is a **design defect, not intentional "silence"** — the presets'
own "silence" principle means deliberate breathing room *around* content, not a dead void where
composition simply ran out.

**Before rendering, check:** does styled content (cards, type, chrome, decoration) reach at least
**~80-85% down the canvas**, with only a genuine footer/margin left unstyled at the very bottom? If
not, fix it — do not ship a top-heavy slide. Three real levers, use the ones that fit the
treatment's own component set (never invent off-brand elements):
1. **Widen rhythm** — increase gaps between existing content blocks (e.g. 70px → 150px between stat
   cards) so the same content spans more height.
2. **Add real mass from the preset's own components** — a decoration unit the `FRAME.md` already
   defines (BlockFrame's `stripe-block`/`star-burst`, Cobalt Grid's `qr-block`/pixel-stack, etc.),
   or a closing/footer element (brand lockup + page-dots, a `Closing/CTA` treatment block) — never
   just stretch empty whitespace bigger.
3. **Scale the display ramp up**, not just reposition it — a headline sized for a 1080px-tall frame
   often reads too small once given 1920px of height to work with.

Re-verify after any fix by eyeballing the rendered PNG (or a `snapshot --frames 1`) before moving to
Step 5 for the remaining slides — don't discover this after all N slides are authored.

## Step 4 — Per-slide direction (`node/html-direction.md`)

**Slide 1 (cover) is out of scope for this skill** — it's an AI-generated photo via
`gpt-img-2-gen`/`creative-direction`, authored by the workflow before this skill ever runs (see
`[social]_[html-carousel].md`). This skill's job starts at slide 2. Content slides 2..N = **one
shared template** — identical layout/type/component set, only per-slide copy/data changes — same
cohesion rule as `img-carousel` uses for its own content slides. The chosen preset's palette should
be picked to **harmonize with the cover photo's own dominant colors/mood** (read the cover's
creative-direction output before Step 2, if it exists yet) so the carousel reads as one piece even
though slide 1 and slides 2..N come from two different render mechanisms. **Palette is the one
exception among content slides, and it depends on the chosen
preset's own cycling rule** (see `2. HTML_Creative_Prompt_Template/HTML-CREATIVE-TEMPLATE-STRUCTURE.md`'s
palette table — resolve this once, up front, before authoring any slide):
- **Fixed-accent preset** (`blue-professional`, `cobalt-grid`, `cartesian`, `claude`, `coral`,
  `broadside`, `bold-poster`, `biennale-yellow`) — palette IS identical on every slide, no exception.
- **Cycling-palette preset** (`blockframe`, `capsule`, `creative-mode`, `daisy-days`,
  `editorial-forest`) — ground/fill color **must vary per slide/element** following that preset's
  documented order (e.g. `daisy-days` step fills: coral → mint → sky → lavender, in that order;
  `editorial-forest` tiles: mix 3 of 4, never repeat one). Using one static color across the whole
  carousel on one of these presets is a defect, not restraint — record the intended per-slide color
  assignment in `node/html-direction.md` before authoring.

Map each slide's copy (from `node/slides-copy.md`) into the chosen layout's slots. Record: canvas
size, chosen preset + Frame Treatment + score, per-slide role + content mapping + (if cycling)
per-slide color assignment, which `frame.md` tokens drive each region.

## Step 5 — Author each slide as a valid HyperFrames composition

Each slide is a self-contained composition project dir (`node/build/slide_NN/index.html`). **The
HyperFrames contract is mandatory** or `snapshot` fails (`StaticGuard`) — the root element needs
`data-composition-id` + `data-width`/`data-height` + `data-start`/`data-duration`, and a
`window.__timelines` entry must be registered (a paused no-op timeline is fine for a static slide):

```html
<!doctype html>
<html lang="vi"><head>
  <meta charset="UTF-8" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; background:#FAF6EC;
                 font-family:"Montserrat","Inter",sans-serif; }
    #root { width:1080px; height:1920px; position:relative; /* brand layout here */ }
  </style>
</head><body>
  <div id="root"
       data-composition-id="sf-slide-01" data-width="1080" data-height="1920"
       data-start="0" data-duration="2">
    <!-- brand-tokened layout from Step 3, content from Step 4 -->
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    var tl = gsap.timeline({ paused: true });
    tl.to({ v: 0 }, { v: 1, duration: 2 }, 0);   // no-op tween → defines duration (static slide)
    window.__timelines["sf-slide-01"] = tl;
  </script>
</body></html>
```

Rules that bit during verification (bake them in): body **and** `#root` both carry the pixel
size; Vietnamese copy is written with **full diacritics** (renders correctly — verified); fonts are
Google-Fonts families HyperFrames fetches deterministically; keep any headline/CTA inside the safe
zone.

## Step 6 — Render HTML → PNG (`hyperframes snapshot`)

Per slide, from the hyperframes root:

```bash
cd "video_modules/hyperframes"
npx hyperframes snapshot "<abs path>/node/build/slide_01" \
  --frames 1 --output "<abs path>/node/build/slide_01/out" --describe false
```

`--describe false` skips the Gemini vision pass (it auto-runs when `GEMINI_API_KEY` is set — useful
for AI QA, off by default here). Copy the produced `frame-*.png` to `{{campaign_folder}}/slide_01.png`
… `slide_0N.png`. (Optionally `hyperframes lint`/`check` the project first as a structure/contrast gate.)

## Step 7 — QA + output

Benchmarks: Vietnamese diacritics intact; brand tokens (palette/fonts/logo) applied on every slide;
cover reads as a strong hook; content slides 2..N are visibly one template; copy legible in the safe
zone; canvas matches the channel ratio; slide count matches `node/slides-copy.md`; **styled
content/chrome reaches ≥80-85% down the canvas on every 9:16 slide (Step 3.5) — no top-heavy slide
with a dead bottom third.** **Palette cycling matches the preset's own rule (Step 4)** — a
fixed-accent preset shows the identical accent on every slide; a cycling-palette preset shows real
color variation per its documented order, not one static color repeated. Append an
`## Output` section to `node/html-direction.md` (slide count, canvas, paths, layout used). Final PNGs
live in `{{campaign_folder}}/` root; `manifest.json` is written later by `notion-publisher`.

## Boundaries

- **Never render the cover.** Slide 1 is always `gpt-img-2-gen`/`creative-direction` (real AI photo)
  — this rule is not a stylistic default, it's hard: HTML/CSS cannot produce a credible
  photorealistic hook, and the workflow enforces this ordering (cover rendered first, this skill
  runs second and reads the cover's mood for palette harmony). If a ticket seems to want an
  all-HTML cover, escalate rather than silently comply.
- **html-carousel first (static PNG).** Short-video is the same composition contract with real GSAP
  timelines + `hyperframes render` → MP4 instead of `snapshot`; do not attempt the video engine here
  until that lane is opened.
- **Separate from `html-carousel-gen`.** That skill is the legacy single-design fallback; this one is
  HyperFrames-backed and brand-adaptive. The designer picks one per ticket — do not merge them.
- **Don't duplicate HyperFrames.** Pull palettes/typography/composition-patterns/discovery from its
  own skills; this skill is the bridge (ticket + brand kit → registry layout + `frame.md` → PNG).

## Do / Don't

- DO retrieve template-first from a `frame-preset`'s named Frame Treatments and reuse a proven
  layout; only design fresh if nothing fits (`hyperframes-creative` composition-patterns).
- DO carry the full HyperFrames contract on every slide (`data-composition-id`/`data-width`/
  `data-height`/`data-duration` + a registered `window.__timelines`) — `snapshot` hard-fails without it.
- DO run the Step 3.5 vertical-fill check on every 9:16 (or any non-16:9) slide — verified to fail
  silently otherwise (30-60% dead bottom space). Fill with the preset's own decoration/closing
  components, not by inventing off-brand elements or stretching whitespace.
- DO check the chosen preset's palette-cycling rule (Step 4 / `HTML-CREATIVE-TEMPLATE-STRUCTURE.md`
  palette table) before authoring a multi-slide carousel — 5 of 13 presets require real per-slide
  color variation; treating every preset as fixed-single-accent is as wrong as adding a second
  accent to a preset that forbids one.
- DO keep one shared template across content slides; only the cover diverges (thumbnail-grade).
- DO write Vietnamese with full diacritics — verified to render correctly.
- DON'T literally snapshot a `registry/blocks/`or`registry/examples/` item mid-timeline and ship it
  as a static slide — verified motion-first, produces overlapping/sparse/empty frames. Use presets'
  Frame Treatments as the primary static source; registry items only as visual-language inspiration.
- DON'T hardcode brand colors — resolve tokens from the ticket's Brand Kit (SF 2026 warm palette is
  only the default).
- DON'T render MP4 / run the video engine for html-carousel — `snapshot` (PNG) is the whole render.

## Graph

**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Driven by:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/designer|designer role]]
**Siblings (direction mechanisms):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/creative-direction/SKILL|creative-direction]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/photography-direction/SKILL|photography-direction]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/html-carousel-gen/SKILL|html-carousel-gen (legacy fixed design)]]
**Template library (primary retrieval):** `BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/HTML-CREATIVE-TEMPLATE-STRUCTURE.md` · `BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/frame-md-schema.md` · `BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/IMAGE-SOURCING-GUIDE.md`
**HyperFrames (vendored render engine):** `video_modules/hyperframes/skills/{hyperframes-creative,hyperframes-registry,hyperframes-core,hyperframes-cli}` · `video_modules/hyperframes/registry/{blocks,examples}`
**Goal:** `goal/[social]_[html-carousel].md`
