---
name: split-4-image
description: Generate ONE large composed image at gpt-image-2's max native resolution (2K–4K, no upscaling) then slice it into a 4-grid (2×2) or 4-strip for split-grid social posts. Tiles are named in upload order so the 4 pieces reassemble correctly on the target platform (Facebook 4-photo grid).
---

# split-4-image

Produce a **split-4** social asset: one large, deliberately-composed image cut into 4 tiles that
read as a single picture when the platform reassembles them into a grid. This is a
**Facebook-first** trick — Facebook renders a 4-photo post as a 2×2 collage, so four square tiles
uploaded in the right order look like one seamless image on the feed.

## Engine rule (hard)

The source image **must** come from `gpt-img-2-gen` at a **native large size — no upscaling.**
gpt-image-2 supports true 2K–4K output directly (verified against OpenAI's image-generation guide
2026-08-03): any `size` with **max edge ≤ 3840px**, **both edges a multiple of 16**, **aspect ratio
≤ 3:1**, and **total pixels ≤ 8,294,400** (~8.3MP; >2560×1440 is flagged "experimental" but works).
`codex image_gen` and antigravity `generate_image` cap far lower and produce soft tiles — never
source the base from an in-session tool for this visual type.

| Layout | Base size (gpt-img-2-gen, native) | Tiles | Note |
|--------|-----------------------------------|-------|------|
| `grid-2x2` (default, Facebook 2×2) | **`2880x2880`** (largest allowed square) | 4 × **1440×1440** | square tiles → clean FB 2×2 collage |
| `grid-2x2` true-4K landscape | `3840x2160` | 4 × 1920×1080 | 16:9 tiles — only if the design is landscape |
| `strip-4` (seamless 4-panel swipe) | `3840x1280` (3:1 max) | 4 × 960×1280 | portrait panels for an IG/carousel swipe |

Default to `2880x2880` (square) for the Facebook grid unless the ticket's composition is explicitly
landscape.

## Step 1 — Compose one prompt for the whole canvas

Write a single prompt that describes the **full composition** with the 4 regions in mind (e.g. "a
2×2 layout where top-left shows …, top-right …, bottom-left …, bottom-right …"). Keep the
subject/background continuous across the seams so the reassembled grid reads as one picture. Apply
the anti-slop rules from `gpt-img-2-gen`. If the design carries a headline, keep it within one tile
(text spanning a seam breaks when the platform adds gutters between photos).

## Step 2 — Generate the large base image (native, no upscale)

```bash
python "../gpt-img-2-gen/clients/openai_gpt_image.py" \
  --prompt "<the composed prompt>" \
  --output "<output_dir>/_base.png" \
  --size 2880x2880          # grid-2x2 square (or 3840x2160 landscape / 3840x1280 strip-4)
```

## Step 3 — Slice into 4 (correct upload order)

```bash
python slice.py --input "<output_dir>/_base.png" --out-dir "<output_dir>" \
  --rows 2 --cols 2 --prefix slide     # strip-4 → --rows 1 --cols 4
```

Outputs `slide_1.jpg … slide_4.jpg` in **reading order (left→right, top→bottom)** — for a 2×2 that
is `slide_1`=top-left, `slide_2`=top-right, `slide_3`=bottom-left, `slide_4`=bottom-right.

## Facebook upload order (the whole point of the naming)

Facebook lays out a **4-photo** post as a 2×2 collage, filling it in the order the photos are added:
first photo → top-left, then top-right, bottom-left, bottom-right. Uploading `slide_1 → slide_4` in
filename order therefore reassembles the original picture. Two hard requirements for a clean grid:

- **Tiles must be square (1:1).** Facebook only renders a symmetric 2×2 when all four are square;
  mixed/portrait aspect ratios trigger its "1 big + 3 small" layout instead. `2880x2880` → 1440²
  square tiles satisfies this.
- **Exactly 4 photos in the post** — a 3- or 5-photo post uses a different layout.

Instagram/other platforms do not reassemble multi-photo posts into a seamless grid the same way —
this trick is Facebook-specific. On IG the tiles are just a normal 4-slide carousel (swipe), which
is what `strip-4` is for. Verify the final layout on the actual target platform before treating a
ticket as done — Facebook's collage algorithm has changed over time.

## Notes
- Keep the base `_base.png` in the output dir for QA/reassembly and as the reviewer's whole-picture
  preview (e.g. the Notion `THUMBNAIL`).
- No upscaling anywhere — the base is generated at the target resolution natively. If a base ever
  comes back smaller than the table above, regenerate with an explicit `--size`, never upscale a
  small base (the seams and any in-image text degrade).
- For batch, generate the base per item then slice; the slicer is deterministic and cheap.

## Graph
[[../../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../../../WORKFLOWS/[social]_[split-4-img]|split-4-img workflow]] · [[../gpt-img-2-gen/SKILL|gpt-img-2-gen (base renderer)]]
