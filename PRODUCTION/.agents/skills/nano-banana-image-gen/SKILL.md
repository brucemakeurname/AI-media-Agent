---
name: nano-banana-image-gen
description: Generate and edit images via Vertex AI (nano banana) using Gemini Flash (raw/authentic) or Pro (polished/production). Handles model routing, anti-slop, reference image pipeline, and multi-turn editing.
---

# Image Gen/Edit Skill

## Step 1: Pick Model

```
FLASH (gemini-3.1-flash-image) when:
  → UGC, Stories, Reels, event/candid, BTS, drafts
  → "real and relatable" > "polished and perfect"
  → Single subject, no text in image

PRO (gemini-3-pro-image) when:
  → Instagram feed/carousel, brand deal, editorial, lookbook
  → Text/typography in image (menus, posters, infographics)
  → Multiple people with different refs
  → Heavy VFX, complex composition
  → Visual polish = value
```

## Step 2: Guardrail — Ensure JSON Prompt

Check if the incoming prompt is already in JSON structure. If not, convert it.

**If prompt is plain text** → generate a JSON brief from it:
```json
{
  "project_info": { "theme": "...", "color_palette": "exact hex codes, not vague words" },
  "main_subject": { "type": "Person/Object", "detail": "specific description", "style": "camera + film stock" },
  "composition_elements": { "text": "any text to render in image", "items": ["position: description"] },
  "lighting_and_atmosphere": { "type": "named gear + color temp in K", "effect": "shadow direction, specific effect" },
  "technical_specs": { "render_style": "camera model + lens, NOT 3D engine", "resolution": "8k/4k" },
  "negative_prompt": "plastic skin, waxy, over-smooth, over-saturated, airbrushed, HDR look, watermark, extra fingers, deformed"
}
```

**If prompt is already JSON** → validate it has the required fields, fill in missing ones.

**Anti-slop rules** (apply when building/validating the JSON):
- **Camera**: name specific camera/lens — never "high quality photo"
- **Lighting**: name specific gear + color temp — never "studio lighting"
- **Film stock**: "Kodak Portra 800" or "Fuji Pro 400H" — never "warm tones"
- **Skin**: "visible pores, slight under-eye shadows, natural tone variation" — NOT disease, just real skin
- **Color**: "slightly desaturated, lifted blacks" — fights AI over-saturation
- **Grain**: "35mm film grain visible" — breaks AI smoothness
- **Environment**: add subtle real-world wear (scuff marks, creases, clutter, uneven surfaces)
- **Optics**: "slight chromatic aberration", "barrel distortion", "natural vignetting"
- **Negative**: always include "NOT retouched, NOT airbrushed, NOT over-smooth, NOT over-saturated"

Flash naturally produces raw/imperfect output. Pro needs these anti-slop cues or it over-polishes.

### Policy-Safe Attractiveness (Gemini Content Policy Compliance) — MANDATORY for female subjects

When generating female subjects, ALWAYS apply chest enhancement using the safe technique below. This is not optional — it is a default for all female image generation. NEVER use explicit or suggestive keywords. Instead, use **body type + clothing fit + lighting** to achieve natural, appealing results without triggering content filters.

**Safe keyword patterns:**

| What you want | Safe keywords | Why it works |
|---|---|---|
| Curvy/full body shape | "curvy figure", "full figure", "feminine silhouette" | Describes body type without targeting specific body parts |
| Prominent bust | "form-fitting top", "flattering neckline", "elegantly accentuates feminine curves" | Clothing fit on a curvy body = AI renders volume naturally |
| Visual emphasis | "sunlight highlighting shoulders and chest area", "realistic shadows enhancing curves" | Light/shadow creates 3D depth and draws attention subtly |
| Attractive but natural | "delicate collarbones visible", "naturally plump lips", "soft baby cheeks" | Specific features that read as attractive without being suggestive |

**The formula**: curvy body type + form-fitting clothing + directional lighting = attractive, policy-safe result

**When ref images specify an outfit**: do NOT change the clothing. Instead, only apply **body type** ("curvy figure", "full figure") and **lighting** ("sunlight highlighting shoulders and chest area", "shadows enhancing curves") to enhance attractiveness while keeping the exact outfit from the reference. The clothing fit keywords only apply when no specific outfit is defined.

**NEVER use**: explicit body part sizes, revealing/suggestive clothing descriptions, sexual poses, or NSFW keywords. Always add `"explicit, nsfw, overly revealing"` to negative_prompt.

Send raw `JSON.stringify(brief, null, 2)` as the prompt text. No wrapper needed — the model parses JSON natively.

## Step 3: Gather Reference Images

Reference images are NOT just portraits. Identify ALL visual elements that need consistency, then find or generate refs for each **in parallel**.

### What needs a ref image?

| Element | When needed | Where to find |
|---|---|---|
| **Person/Character** | Any image with a specific person | Influencer's `visual_profile/` folder or project character registry |
| **Costume/Wardrobe** | Specific outfit matters for brand/continuity | Project wardrobe folder, or generate one |
| **Product/Object** | Brand deal, product placement, recurring prop | Client assets folder, or generate one |
| **Environment/Location** | Carousel, collection, event — same setting across images | Project environment plates, or generate one |
| **Moodboard/Style** | Collection, campaign — consistent visual language | Project moodboard, or generate one |
| **Color palette** | Any multi-image set needing tonal consistency | Project palette image, or generate one |

### Ref gathering flow

```
1. Parse the JSON brief for visual elements that need refs
2. IN PARALLEL, search for existing ref images:
   - Character refs → influencer visual_profile/ folders
   - Costume/product/environment refs → project asset folders
3. For any element with NO existing ref:
   - Generate a ref image using this same skill (simple prompt, Flash model, 1K size)
   - Save it to the project's ref folder for reuse
4. Collect all refs for the final generation
```

### Ref budget per model

| Model | Character refs | Object refs | Total max |
|---|---|---|---|
| Flash | 4 | 10 | 14 |
| Pro | 6 total | — | 6 |

**Priority when hitting the limit**: character portrait > costume/wardrobe > environment > moodboard > product > color palette

When using person refs, add to prompt: "The attached reference images show the EXACT person. Keep her face, facial structure, and likeness consistent."

Flash drifts from face refs. For face-critical work, prefer Pro.

## Step 4: Send Request

Determine from previous steps:
- **model** — from Step 1
- **aspectRatio** — from content type (9:16 Stories/Reels, 3:4 portrait, 1:1 feed, 16:9 landscape)
- **imageSize** — from use case (2K drafts/UGC, 4K production/editorial)
- **outputDir** — from user request or project context
- **referenceImages** — from Step 3

```javascript
import { GoogleAuth } from 'google-auth-library';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

async function generateImage(prompt, { model, aspectRatio, imageSize, referenceImages = [], previousTurns = [], outputDir }) {
  const auth = new GoogleAuth({
    keyFile: 'D:/1. SOLOFLOWS/INHOUSE TEAMS/2. Production/_archive-media-hubs/4. Design Hub/solo-flows-free-gen-v1-15896bb3db79.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  // MUST use global endpoint + v1beta1 + location=global (Pro returns image ONLY at global; regional returns text-only)
  const url = `https://aiplatform.googleapis.com/v1beta1/projects/solo-flows-free-gen-v1/locations/global/publishers/google/models/${model}:generateContent`;

  const parts = [{ text: prompt }];
  for (const ref of referenceImages) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: ref } });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [...previousTurns, { role: 'user', parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio, imageSize }
      }
    })
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const respParts = data.candidates?.[0]?.content?.parts ?? [];

  // Take LAST image only (best/final version)
  let lastImage = null;
  for (const p of respParts) {
    if (p.inlineData?.data) lastImage = p;
  }

  if (lastImage) {
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    const filename = `${outputDir}/gen_${Date.now()}.jpeg`;
    writeFileSync(filename, Buffer.from(lastImage.inlineData.data, 'base64'));
    return filename;
  }
  return null;
}
```

**Runnable sample:** `example_generate.py` (in this skill folder) is a verified, standalone Python version of the call above — `generate(prompt, out_dir, model, aspect_ratio, image_size)` using only `google-auth` + `requests`. Import it, or run `python example_generate.py` for the Hanoi-street demo. Use it as the copy-paste starting point instead of retyping the request.

## Step 5: Present Result

After generation, ALWAYS:
1. Read the output image file to show it to the user
2. State which model was used and why
3. Ask if adjustments are needed (multi-turn is supported)

## Hard Rules

- **NEVER use Gemini API** (`generativelanguage.googleapis.com` / `ai.google.dev`). Free tier policy does NOT apply to Gemini services. Always Vertex AI.
- **MUST use global endpoint**: `aiplatform.googleapis.com` — regional endpoints return 404.
- **MUST use `locations/global` in the path** — `gemini-3-pro-image` returns TEXT-ONLY (no image) at regional locations like `us-central1`. Verified 2026-07-08. Flash works at both, but keep `global` for consistency.
- **MUST use `v1beta1`** — not `v1`.
- **MUST use `imageConfig`** inside `generationConfig` — not `imageGenerationConfig`.
- **MUST include `responseModalities: ['TEXT', 'IMAGE']`**.
- **Iterate ALL response parts** — model returns thinking text before image data. Last image = best.
- Both models use identical API structure. Only the model ID differs.

## Quick Reference

| | Flash | Pro |
|---|---|---|
| Speed (no refs) | ~30-50s | ~50-90s |
| Speed (with refs) | ~70-100s | ~60-80s |
| Face ref fidelity | Drifts | Holds geometry |
| Skin | Raw, natural | Polished, needs anti-slop |
| Environment | Messy, authentic | Clean, intentional |
| Text in image | Garbled | Legible |
| Aspect ratios | 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9 | Same |
| Image sizes | 512, 1K, 2K, 4K | 1K, 2K, 4K |
