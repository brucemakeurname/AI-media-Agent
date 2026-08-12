---
name: GPT img 2 gen skill
description: Generate images via GPT Image 2 (OpenAI API direct). Use for carousel slides, single images, and any job where Vertex AI is not required. Distinct from the nano banana Vertex AI skill.
---

# GPT img 2 gen skill

Use this skill for image generation via **GPT Image 2 through OpenAI API directly**. Not Vertex AI — that is the nano banana skill (`nano-banana-image-gen`).

## When to use this vs nano banana

| Use GPT Image 2 (this skill) | Use Vertex AI (nano banana skill) |
|---|---|
| Carousel slides | Keyframes for video production |
| Text-heavy images (posters, infographics, slide titles) | Cinematic / editorial hero images |
| Rapid single image generation | Multi-pass consistency workflows |
| Brand promotion visuals | Character-consistent face generation |

GPT Image 2 is stronger at legible text in images. Use it whenever the slide needs readable copy rendered into the visual.

---

## Step 1: Build the Prompt

GPT Image 2 accepts plain text. Write a descriptive, specific prompt. Do not use vague style words.

**Anti-slop rules (same as nano banana skill):**
- **Color**: exact hex codes or named paint colors — never "vibrant", "bold"
- **Lighting**: name the source — "soft window light from left", "overhead neon strip"
- **Composition**: be spatial — "subject fills left two-thirds, negative space right side"
- **Text in image**: if the slide should show text, write it in quotes — `render the text "Automate Content" in white sans-serif at top-center`
- **Negative**: always end with what to avoid — `no watermarks, no blurry edges, no stock-photo feel`

**NBP JSON prompt (recommended for carousel slides):**

```json
{
  "project_info": {
    "title": "slide title for your own reference",
    "style": "specific aesthetic — e.g. flat design, glassmorphism, editorial photo",
    "aspect_ratio": "1:1 or 9:16",
    "color_grading": "exact palette — e.g. dark navy #0f172a background, purple #667eea accent"
  },
  "main_subject": {
    "description": "what is the hero visual — person, object, abstract",
    "position": "centered / rule-of-thirds left / fills frame",
    "action": "what they are doing",
    "expression": "mood — confident, casual, focused"
  },
  "composition_elements": {
    "foreground": "what is in front",
    "midground": "what is in the middle layer",
    "background": "background description — gradient, scene, flat color",
    "camera_angle": "frontal / low angle / bird's eye",
    "depth_of_field": "shallow / deep / flat"
  },
  "lighting_and_atmosphere": {
    "key_light": "main light source with direction",
    "fill_light": "secondary fill",
    "mood": "emotional tone of the image"
  },
  "text_in_image": "exact text to render, or omit this field if no text",
  "negative_prompt": "what to avoid"
}
```

Stringify the JSON and pass as the `--prompt` argument. The model handles JSON natively.

---

## Step 2: Choose Size

| Platform | Size flag |
|---|---|
| Instagram feed / carousel (square) | `--size 1024x1024` or `--aspect-ratio 1:1` |
| Instagram Story / TikTok slide (vertical) | `--size 1024x1792` or `--aspect-ratio 9:16` |
| YouTube thumbnail / landscape | `--size 1792x1024` or `--aspect-ratio 16:9` |

Default is `1024x1024` if not specified.

---

## Step 3: Call the Client

Client: `.claude/skills/gpt-img-2-gen/clients/openai_gpt_image.py`

`OPENAI_API_KEY` is loaded automatically from `.env` at the Design Hub root. No manual env export needed.

**Single image, no reference:**
```bash
python ".claude/skills/gpt-img-2-gen/clients/openai_gpt_image.py" \
  --prompt "your prompt or JSON string here" \
  --output "{project_path}/images/slide_01.png" \
  --size 1024x1024
```

**With visual reference (for carousel slides 2+):**

Pass slide 1 as `--reference` so GPT Image 2 anchors the visual style via the OpenAI edits endpoint. This enforces consistency across the carousel without needing to re-describe the entire aesthetic.

```bash
python ".claude/skills/gpt-img-2-gen/clients/openai_gpt_image.py" \
  --prompt "your prompt" \
  --output "{project_path}/images/slide_02.png" \
  --size 1024x1024 \
  --reference "{project_path}/images/slide_01.png"
```

**With multiple references (style anchor + logo + product shot, etc.):**

The OpenAI edits endpoint accepts up to 16 input images (`image[]` array). Pass several `--reference` paths to combine them — e.g. slide 1 for style continuity plus the brand logo plus a product photo:

```bash
python ".claude/skills/gpt-img-2-gen/clients/openai_gpt_image.py" \
  --prompt "your prompt" \
  --output "{project_path}/images/slide_03.png" \
  --size 1024x1024 \
  --reference "{project_path}/images/slide_01.png" "{project_path}/assets/logo.png" "{project_path}/assets/product.png"
```

3-5 well-chosen references usually outperform many mixed ones — references compete for influence, so don't pass more than needed.

**Output:** The client prints a JSON result and saves the file:
```json
{
  "output": "/absolute/path/to/slide_01.png",
  "generation_time_ms": 8420,
  "model": "gpt-image-2"
}
```

---

## Step 4: Carousel Generation Order

For multi-slide carousels, always generate in this order:

1. **Slide 1 (hook)** — generate first, no reference. This sets the visual language.
2. **Slides 2 to N-1 (content)** — each passes slide 1 as `--reference`.
3. **Last slide (CTA)** — simpler composition. Still passes slide 1 as reference for color consistency.

Run slides 2+ in parallel if needed (up to 5 concurrent calls).

**Slide role rules:**
| Slide | Role | Notes |
|---|---|---|
| Slide 1 | hook | Bold. Stop-scroll visual. Generate this first. |
| Slides 2 to N-1 | content | Visual continuity with slide 1. |
| Last slide | cta | Simpler composition, breathing room for text overlay. Brand color dominant. |

---

## Step 5: Write Manifest

After all images are generated, write `{project_path}/manifest.json`:

```json
{
  "workflow": "carousel",
  "model": "gpt-image-2",
  "generated_at": "ISO timestamp",
  "slides": [
    {
      "filename": "slide_01.png",
      "path": "/absolute/path/to/slide_01.png",
      "slide_number": 1,
      "role": "hook",
      "generation_time_ms": 8420,
      "status": "approved"
    }
  ]
}
```

---

## Quality Gate

Before marking the job complete:
- [ ] Every slide has a saved file
- [ ] No slide has `status: "failed"` in manifest
- [ ] Slides 2+ are visually consistent with slide 1 (same color palette and style)
- [ ] Manifest written

---

## Hard Rules

- **OPENAI_API_KEY from `.env` only** — never hardcode the key in code, config, or any committed file
- **Single env file** — `.env` at Design Hub root is the only source for `OPENAI_API_KEY`; do not duplicate it elsewhere
- **Model ID is `gpt-image-2`** — do not change it
- **Up to 16 reference images per call** — OpenAI edits endpoint accepts multiple via `image[]`; the client passes them all in one request (no chaining/sequential calls needed). Prefer 3-5 well-chosen refs over many mixed ones.
- **Fail loud** — if the client returns no image, stop and report the error with the full response
