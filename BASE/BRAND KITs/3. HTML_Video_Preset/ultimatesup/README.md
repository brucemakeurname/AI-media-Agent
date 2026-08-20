# Ultimate Sup HTML video preset

Reusable transparent overlay library for Ultimate Sup Singapore social video. It keeps the
`blockframe` full-stage structure, then reduces the visible grammar to the screenshot-derived UI:
  brand ribbon, metric chip, bookmark/date metadata, solid information box, bold outlined
type, and transparent product PNGs.

## Use order

1. Read `GUIDELINE.md`.
2. Pick one module from `modules/module-map.json`.
3. Use the matching `.hbs` module and its named animator in `animation.js`.
4. Render as a full 1080×1920 transparent ProRes 4444 overlay; keep all painted surfaces bounded
   to intentional inner blocks.
5. Burn the overlay before subtitles, then verify exact ticket copy, product variant, offer terms,
   alpha, timing, and subtitle-safe area.

Use `centered: true` only when an information box must occupy the visual center; the preset keeps
the normal solid-white treatment by default and changes the centered variant to a 90% white fill.

Do not invent a new animation when a module or motion profile already covers the scene. Product
images, prices, voucher values, dates, claims, and CTA text remain ticket-controlled inputs.

## Bundle

- `style.css` — scoped Ultimate Sup tokens, bold sans-serif typography, UI elements, and block styles.
- `animation.js` — deterministic GSAP timelines for the named modules.
- `scene-map.json` — renderer-facing module map.
- `modules/` — reusable overlay scene templates.
- `blocks/` — shared HTML fragments and layout anatomy.
- `animations/` — named frame entrance/attention/exit motion profiles.
- `motion/` — selection rules and timing tokens.
- `audio/bgm-policy.json` — Brand Kit BGM source, default track, and `-17 dB` gain rule.
- `preview/index.html` — visual gallery for all six modules.
- `preview/*.png` and `sample.png` — rendered module previews/contact sheet.
- `assets/products/` — local alpha-cutout derivatives for PNG-only product presentation.
