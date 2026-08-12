# HTML Creative Prompt Template — Structure

Read-only, cross-brand. **HTML/HyperFrames counterpart to `1. Creative_Prompt_Template/`** (which is
for AI-generated images). Consumed by the Social Media `html-creative-direction` skill as its
**primary retrieval source** — this folder, not `VIDEO_MODULES/hyperframes/` directly, is what the
skill links to.

## Origin

Copied from the vendored HyperFrames framework's `frame-presets/` (13 named frame-scale design
systems, each a `FRAME.md` — colors/typography/spacing/components in frontmatter = normative rule,
markdown body = usage guide/Frame Treatments). Source of truth for the mechanism itself (the
render pipeline, the composition contract, the broader block/component registry) remains
`INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/hyperframes/` — **this folder is a curated
copy of just the creative-direction layer**, versioned independently so the skill doesn't depend on
reaching into a vendored third-party framework folder for its core reference material.

## Structure

```
2. HTML_Creative_Prompt_Template/
├── HTML-CREATIVE-TEMPLATE-STRUCTURE.md   ← THIS FILE
├── frame-md-schema.md                    ← canonical frame.md format authority
├── IMAGE-SOURCING-GUIDE.md               ← when/how to crawl + insert a real photo into a slide
├── biennale-yellow/
│   ├── FRAME.md         ← full rule/guide (colors, typography, components, Frame Treatments)
│   └── sample-3x4.png   ← rendered sample at 1080×1440 (3:4), verified via hyperframes snapshot
├── blockframe/
├── blue-professional/
├── bold-poster/
├── broadside/
├── capsule/
├── cartesian/
├── claude/
├── cobalt-grid/
├── coral/
├── creative-mode/
├── daisy-days/
└── editorial-forest/
```

13 presets total — same count as the vendored source. Each preset folder = one visual identity a
ticket can select. **Sample format:** `FRAME.md` (rule) + `sample-3x4.png` (proof it renders
correctly at the standard library canvas — 3:4, 1080×1440).

## Choosing a preset (mood → identity)

| Preset | Look | Pick when |
|---|---|---|
| `biennale-yellow` | Literary-editorial catalogue, parchment + indigo + yellow bloom | confident / atmospheric / museum-catalogue |
| `blockframe` | Maximalist neobrutalist, 4px borders, hard shadows, candy pastels | bold / punchy / playful-loud |
| `blue-professional` | Consulting-grade, cream + single cobalt accent, no shadow | measured / executive / premium |
| `bold-poster` | Populist editorial poster, tilted display, red/off-white | powerful / printed / vintage gravitas |
| `broadside` | Protest-poster, dark/orange, massive lowercase type | bold / typographic / declarative |
| `capsule` | Playful editorial, every container a pill, candy accents | friendly / soft / approachable |
| `cartesian` | Museum-catalog, taupe hairline grid, zero shadow/fill | sparse / literary / restrained |
| `claude` | Warm-editorial brand book, cream + terracotta coral | considered / literary / developer-facing |
| `cobalt-grid` | Two-color risograph, graph-paper grid, serif + mono | restrained / systemic / editorial |
| `coral` | Bold editorial magazine, hard-edge color regions | structuralist / graphic confidence |
| `creative-mode` | Neo-brutalist editorial, cream + rationed accents | sparse / graphic / punchy-restrained |
| `daisy-days` | Cheerful picture-book, pastels, hand-drawn ornament | playful / childlike / whimsy |
| `editorial-forest` | Serif-led literary, green/pink/cream triad | spacious / restrained / quiet confidence |

## Palette — full token list + cycling rule per preset

⚠️ **Read before authoring a multi-slide carousel.** Each preset's `colors:` frontmatter often holds
**more tokens than the one accent named in the mood table above** — and roughly a third of the 13
have a real **cross-slide color-cycling mechanism** that must be followed (or deliberately not
followed) consistently across a carousel. Getting this wrong is either "every slide looks the same
when the preset's whole identity is the cycle" or "an accidental second accent color" on presets that
explicitly forbid one.

| Preset | Full palette (frontmatter tokens) | Cycling rule |
|---|---|---|
| `biennale-yellow` | paper, paper-deep, sun, sun-soft, haze, ink, ember | **No color cycling** — one ink (indigo) + one sun-bloom per frame. (Only a *label* rotates, not color.) |
| `blockframe` | black, white, offwhite, pink, blue, green, yellow, cream | **Cycles** — "five candy pastels cycle as full-bleed grounds across frames... the color cycling is the primary rhythm." Never reuse the same ground on consecutive slides. |
| `blue-professional` | bg, primary(cobalt), text, text-muted, text-light, accent-light/medium, border, card-bg, positive, negative | **No cycling** — "single cobalt... no second accent color." Every slide same cobalt. |
| `bold-poster` | bg, dark, red, light | **No color cycling** (only display-type *tilt angles* rotate, e.g. −6°/−4°/2°) — "one saturated tomato red duy nhất." |
| `broadside` | ink-black(+alt), fire-orange, cream(+muted/hint), border-dark, ink-on-orange (4 opacities) | **No cycling** — exactly two registers (dark/orange), "one register per frame," pick one and hold it. |
| `capsule` | cream, ink, outline, white, coral, lime, lavender, sky, violet, yellow, peach, mint (9 candy) | **Cycles per-element** — pills/icons pick "any candy" freely; not a full-bleed ground cycle like blockframe, more a confetti scatter. Vary color choices slide to slide, don't lock one candy color as "the" brand color. |
| `cartesian` | bg-primary, bg-secondary, text-primary, text-secondary, accent, line, white-overlay | **No cycling** — five-tone warm-stone only, no candy accents at all. |
| `claude` | ink, cream, tile(+strong), coral, navy(+soft/elev) | **No cycling** — "the ONE voltage moment per frame... never two corals in one frame." Coral is scarce by design, not rotated. |
| `cobalt-grid` | paper, paper-2, ink(cobalt), ink-soft, grid, ink-faint | **No cycling, strictly two-color** — "never a second hue... emphasis comes from size... never from color." |
| `coral` | coral(+dark), cream(+dark), black, gray, light-gray, white | **No cycling** — three fixed surfaces (coral/black/cream) meeting at hard edges; not a rotation, a fixed split. |
| `creative-mode` | cream(+2), ink(+2), green(+dark), pink(+dark), orange, yellow | **Cycles on a fixed sequence** — step-card colors "alternate cream with accents and ENDS on green" (a specific order, not free choice: don't randomize, follow the documented sequence). |
| `daisy-days` | cream, turquoise, soft-pink, butter, mint, lavender, peach, sky, coral, text-dark/muted, white | **Cycles** — "cream default + rotating pastel surfaces"; step-circle fills specifically **"rotate coral → mint → sky → lavender"** (order matters); coral reserved as a small marker only, never a surface. |
| `editorial-forest` | green(+deep/lite), pink(+deep), cream(+2), ink | **Cycles with a diversity constraint** — tile fills "rotate; never repeat one across a grid... mix 3 of 4, never repeat one." Pick 3 of the 4 fills per grid, no repeats. |

**Rule of thumb:** if a preset's own Composition Rules say "single accent" / "no second color" / "the
ONE voltage moment," a multi-slide carousel keeps that one accent identical on every slide (only
content changes). If it says "cycle" / "rotate" / "alternate," the carousel's cohesion comes from
**varying** the ground/fill per the documented order — reusing one color on every slide there reads
as a bug, not restraint. `html-creative-direction` Step 4 must record which case applies before
authoring `node/html-direction.md`.

## Schema authority

`frame-md-schema.md` is the canonical `frame.md` structure. When adopting a preset for a real
ticket: copy its `FRAME.md` to `node/frame.md`, then override color/font tokens with the ticket's
real Brand Kit — keep the preset's **structural** tokens (radii, shadow style, spacing ratios,
component shapes), since those encode the mood. See that skill's Step 2.

## Image sourcing

`IMAGE-SOURCING-GUIDE.md` — when a slide needs a real photo (news/product/event content) vs. when
it should stay pure typography/decoration, and the verified crawl → attribute → place mechanism.

## Vertical-fill discipline (read before authoring any 9:16/3:4 slide)

Every preset is authored natively for **1920×1080 (16:9)**. Porting to a taller canvas (9:16, 3:4)
by simply top-anchoring the same content **leaves the bottom of the frame dead** — verified
repeatedly while building this library (7 of the first 13 samples needed a second pass after
leaving 35-60% of the frame empty). Before treating any slide as done: styled content/chrome must
reach **≥80-85% down the canvas**, filled with the preset's own real components (never invented
off-brand elements, never just stretched whitespace). Full rule + worked fix: `html-creative-direction/SKILL.md` Step 3.5.

Read by: `html-creative-direction` skill (retrieval + brand-token override). Maintained by: human
operator (Nam) + Social Media designer role.

## Graph

**Parent:** [[BRAND-KIT-STRUCTURE|Brand Kit Structure]]
**Sibling:** [[../1. Creative_Prompt_Template/|Creative Prompt Template (image)]]
**Consumer:** [[../../../INHOUSE TEAMS/2. Production/Social Media/.claude/skills/html-creative-direction/SKILL|html-creative-direction skill]]
**Source framework:** `INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/hyperframes/`
