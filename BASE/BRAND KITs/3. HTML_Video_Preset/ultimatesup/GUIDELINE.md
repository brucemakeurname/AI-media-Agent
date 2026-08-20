# Ultimate Sup overlay preset

## Direction

Use the `blockframe` bundle as the structural base: 1080×1920 stage and full transparent coverage.
Use the attached social UI as the visual reference: yellow brand ribbon (skewed parallelogram with 5px black border), metric chip,
bookmark/date metadata, play-count marker, and a bounded 100% solid white information box.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--us-ink` | `#111111` | Editorial rules, headers, offer blocks, primary text on light surfaces |
| `--us-yellow` | `#FFD21F` | Brand ribbon background, sale badge, active progress, CTA emphasis |
| `--us-glass` | `#FFFFFF` | 100% solid white information box (non-translucent) |
| `--us-glass-strong` | `#FFFFFF` | Solid white UI metadata strip and metric chip |
| `--us-white` | `#FFFFFF` | Text on dark surfaces and clean product panels |
| `--us-charcoal` | `#2A2A2A` | Secondary text and rules |

## Layout rules

- Transparent full-stage overlay; no generic wrapper or full-frame surface may paint behind the
  footage.
- Position bounded inner blocks where the scene needs them; do not animate a lower-third bar across
  the frame.
- Keep the face, product label, and CTA clear unless the ticket explicitly reserves that area.
- Use one dominant product or offer moment. Use gallery layouts only when the ticket explicitly
  promotes multiple products.
- Information boxes are 720px wide and 200px above the bottom of the 1080×1920 frame by default.
- If an information box must sit in the visual center, set `centered: true`: place it at the frame center and reduce only its white fill to 90% opacity so the face remains visible behind it.
- Product PNGs are 320px high (`1/6` frame height), with the product name directly underneath.
- A product shown for less than 1.5s is centered; a longer product moment uses the lower third.
- Do not add product plinths, filled product cards, decorative panels, or full-width lower thirds.
- Product-brand colours are secondary cues; Ultimate Sup remains the retailer identity.

## Typography

- All text: `Archivo`, bold/black weights only, with a sans-serif fallback.
- Standalone ordinary text: white fill with black stroke.
- Standalone emphasis text: Ultimate Sup yellow fill with black stroke.
- Route every font size through `var(--v-text-scale)`.

## Claim and asset guardrails

The preset controls layout and motion, not publication rights. Use only approved packshots and
exact ticket copy. Never reuse historical prices, dates, voucher values, gifts, or claims from the
homepage reference images. Ultimate Sup is the retailer; Mutant, PVL, NutraBio, and other names
remain product brands.

## Renderer contract

- Stage: 1080×1920, transparent body.
- Coverage: full 1080×1920 transparent stage; only intentional inner blocks paint pixels.
- Product assets: use PNGs with alpha; do not paint a background behind the product.
- Layering: burn the overlay first and subtitles after it.
- Output: ProRes 4444 MOV, `yuva444p12le`.
- Entry: 0.08–0.28s staggered frame/content reveal.
- Exit: fade and slight lift during the final 0.50s.
- Animation source: named module animator only; do not author ad hoc motion in the composition.

## Audio rule

- Use BGM only from `BASE/BRAND KITs/UltimateSup/BGM/`.
- If the ticket does not name a track, use `bgm_ugc_funky_hiphop_lifestyle.mp3`.
- Default BGM gain is `-17 dB`; keep voice, subtitle timing, and approved SFX above the music bed.
- A ticket may override the default track, but not with an unapproved external or generated track.
