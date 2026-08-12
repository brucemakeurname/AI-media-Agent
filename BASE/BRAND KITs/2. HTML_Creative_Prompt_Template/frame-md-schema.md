# frame.md — Schema Authority

Canonical structure for `frame.md`, the frame-scale design system every preset in this library
ships as. Copied/adapted from HyperFrames' own `hyperframes-creative/references/design-spec.md` —
that file remains the deeper reference (precedence rules, `design-picker.md`, consumption contract);
this doc is the schema summary scoped to this library.

## What it is

`frame.md` is a **YAML frontmatter + markdown body** file. The two layers are not equal:

- **Frontmatter is the normative layer** — `colors`, `typography`, `spacing`, `components` are the
  real, machine-readable values. Quote them verbatim (exact hex, font family, weight); never invent
  or round them.
- **Prose is context** — the `##` sections (Overview, The Frame, Frame Treatments, Composition
  Rules, …) carry intent, when-to-use, and constraints the tokens alone can't hold.

## Frontmatter shape (every preset in this library follows this)

```yaml
version: alpha
name: "{Preset Name} — Frame (video / frame layer)"
description: >
  One paragraph: what's fixed (atoms), what's free (composition).
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  {token}: "#hex"        # every color the preset uses, named semantically
  # A preset's colors: block usually holds MORE tokens than its one named "accent" —
  # secondary surfaces, opacity variants, and (in ~5/13 presets) a real multi-color
  # cycling set. Read the full block, not just the first token. See "Palette iteration"
  # below and the per-preset table in HTML-CREATIVE-TEMPLATE-STRUCTURE.md.

typography:
  {token}: { fontFamily: "...", cqw: N, weight: N, lineHeight: N, ... }
  # cqw = container-query-width unit; px ÷ 1920 × 100 = cqw at native 16:9

spacing:
  {token}: "Ncqw"         # or px for fixed chrome (labels, page numbers)

components:
  {name}:
    backgroundColor / border / rounded / shadow / typography: "..."
    description: "what this component is for and its hard rules"
```

## Body sections (every preset documents these)

1. **Overview** — the one-paragraph identity + "Key characteristics at frame scale" bullet list.
2. **The Frame** — Frame Craft Bar (3-4 eyeball tests: Squint/Silence/Restraint/Reference), canvas
   sizes (16:9 primary, 9:16 + 1:1 documented), the container-unit law.
3. **Colors / Typography / Depth & Surface / Shapes / Components** — prose expansion of the
   frontmatter tokens, with the Do/Don't boundaries for each.
4. **Frame Treatments** — 5-6 **named, composable layouts** (e.g. Cover, Dashboard, Pull Quote,
   Closing/CTA), each with a fixed recipe shape: `ground · container · composes · focal · chrome ·
   accent · silence · Fixed/Free · density`. **These are the retrieval unit** — `html-creative-
   direction` Step 3 matches a ticket's content-format to one of these, not to the preset as a whole.
5. **Composition Rules** — Do / Don't, preset-specific.
6. **Aspect-Ratio Behavior** — a table of how each Frame Treatment reflows for 16:9/9:16/1:1.
   **Read this as a repositioning hint only** — it does NOT solve vertical-fill on its own; see
   `HTML-CREATIVE-TEMPLATE-STRUCTURE.md`'s vertical-fill section before authoring a taller canvas.
7. **Approved Entities / Numerals & Claims** — no fabricated stats; placeholder syntax
   (`— figure —`, `{metric}`) until the real ticket content is known.
8. **Pre-Render Self-Audit** — a checklist mirroring the Frame Craft Bar, for a final pass before
   treating a composition as done.
9. **Known Gaps** — what this preset doesn't cover yet (motion is explicitly out of scope for all 13;
   9:16/1:1 marked "guidance" not guaranteed).

## Palette iteration — a real, distinct schema concept

The `colors:` block encodes one of two fundamentally different systems, and a preset's Composition
Rules ("Do/Don't") state which one applies — this is not optional styling, it's part of the atom
contract:

- **Fixed-accent presets** (`blue-professional`, `cobalt-grid`, `cartesian`, `claude`, `coral`,
  `broadside`, `bold-poster`, `biennale-yellow`) — one accent color (or a strict two-color system)
  used **identically on every frame**. Their Composition Rules explicitly forbid a second accent
  ("no second accent color," "never a second hue," "the ONE voltage moment per frame"). A multi-slide
  carousel in one of these keeps the exact same accent hex on slide 1 and slide N.
- **Cycling-palette presets** (`blockframe`, `capsule`, `creative-mode`, `daisy-days`,
  `editorial-forest`) — multiple ground/fill colors that **rotate across frames or across repeated
  elements within one frame**, per a documented rule (a literal cycle order, a "never repeat" grid
  constraint, or free "any candy" selection). Using the same single color on every slide of one of
  these preset's carousels is the failure mode — the cycling **is** the rhythm.

**Full per-preset palette + exact cycling rule (quoted from each `FRAME.md`):** see
`HTML-CREATIVE-TEMPLATE-STRUCTURE.md`'s "Palette — full token list + cycling rule per preset" table.
Read it before Step 4 of `html-creative-direction` (per-slide direction) on any multi-slide ticket.

## Resolving which spec to use for a real ticket

1. Pick a preset from this library (see the mood table in `HTML-CREATIVE-TEMPLATE-STRUCTURE.md`) or
   ask `html-creative-direction`'s retrieval step to score candidates.
2. Copy that preset's `FRAME.md` to `node/frame.md` in the campaign folder.
3. Override `colors`/`typography.fontFamily` tokens with the ticket's real Brand Kit — logo, hex
   palette, brand fonts. **Keep the structural tokens** (radii, shadow shape, spacing ratios,
   component geometry) — those carry the preset's mood and are what makes it feel designed rather
   than generic.
4. Author each slide as its own composition (never literally copy a Frame Treatment's example HTML
   verbatim with placeholder content still in it — write real content into its slots).

## Graph

**Parent:** [[HTML-CREATIVE-TEMPLATE-STRUCTURE|Structure]]
**Deeper reference:** `INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/hyperframes/skills/hyperframes-creative/references/design-spec.md`
