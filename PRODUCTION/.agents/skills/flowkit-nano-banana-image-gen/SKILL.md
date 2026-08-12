---
name: flowkit-nano-banana-image-gen
description: >
  Generate image assets with Nano Banana Pro or Nano Banana 2 through Google Flow
  and Flowkit's native project, reference, image-generation, and media workflows.
  Use for Flowkit-backed image generation, product visuals, campaign statics, and
  reference-guided images. Never use a direct Google API client.
---

# Flowkit Nano Banana Image Gen

Use Flowkit's native workflow skills as the source of truth. This skill is an
orchestrator; it does not replace Flowkit's project/scene generation contract and
must not call Google Flow or Vertex AI directly.

## Read Order

1. `PRODUCTION/video_modules/flowkit/AGENTS.md`
2. `PRODUCTION/video_modules/flowkit/skills/fk-change-model.md`
3. `PRODUCTION/video_modules/flowkit/skills/fk-create-project.md` when a project is needed
4. `PRODUCTION/video_modules/flowkit/skills/fk-gen-refs.md` when references are needed
5. `PRODUCTION/video_modules/flowkit/skills/fk-gen-images.md`
6. `PRODUCTION/video_modules/flowkit/skills/fk-refresh-urls.md` before downloading expired media

## Models

| User choice | Flowkit image model value |
| --- | --- |
| `pro` / Nano Banana Pro (default) | `GEM_PIX_2` |
| `2` / Nano Banana 2 | `NARWHAL` |

Flowkit reads its active image model through `NANO_BANANA_PRO`. Set the chosen value
with Flowkit's native model command before each generation:

```bash
# Nano Banana Pro
curl -s -X PATCH http://127.0.0.1:8100/api/models \
  -H 'Content-Type: application/json' \
  -d '{"image_models":{"NANO_BANANA_PRO":"GEM_PIX_2"}}'

# Nano Banana 2
curl -s -X PATCH http://127.0.0.1:8100/api/models \
  -H 'Content-Type: application/json' \
  -d '{"image_models":{"NANO_BANANA_PRO":"NARWHAL"}}'
```

Verify the applied mapping with `GET /api/models`. Model settings persist in Flowkit;
restore the prior image-model mapping when the task specifically needs to preserve a
shared default.

## Preconditions

```bash
curl -s http://127.0.0.1:8100/health
```

Continue only when `extension_connected` is `true`. The Google Flow extension must be
open on the intended Chrome profile and have a fresh token. Never print its token,
browser cookies, signed URLs, or other credentials.

## Standard Workflow

### 1. Resolve the production context

- Confirm the active campaign `Ticket.md`: product/SKU, factual source, platform,
  aspect ratio, language, CTA, and output location.
- For an existing Flowkit project, obtain `project_id` and `video_id`.
- For a new request, use `/fk-create-project` to create a minimal project with one
  ROOT scene. Do not reuse an unrelated client/product project merely for a smoke test.

### 2. Choose model

- Default to `GEM_PIX_2` / Nano Banana Pro.
- Use `NARWHAL` only when the requester chooses Nano Banana 2.
- Call `/fk-change-model image <model_key>` or use the exact Flowkit `PATCH /api/models`
  command above. Do not edit Flowkit source code or bypass Flowkit with a Google client.

### 3. Prepare reference assets when needed

- For people, products, locations, or objects needing visual consistency, register
  them in the Flowkit project and run `/fk-gen-refs <project_id>`.
- Stop if required entities lack `media_id`; do not send unapproved campaign assets.
- For one-off local references, follow `/fk-upload-image` and use the returned media ID.

### 4. Generate scene images

Run Flowkit's native image workflow:

```text
/fk-gen-images <project_id> <video_id>
```

It determines orientation from the project, validates references, submits ROOT scenes as
`GENERATE_IMAGE`, uses `EDIT_IMAGE` for continuation scenes, polls request status, and
stores valid image UUIDs and URLs on each scene. Use `REGENERATE_IMAGE` only for an
intentional new rendition; it clears downstream video/upscale status.

### 5. Download selected output

1. Get the project output path and scene records using the commands in `fk-gen-images.md`.
2. Select the approved scene's `${orientation}_image_url`.
3. If its URL has expired, run `/fk-refresh-urls <project_id>` first.
4. Download the selected image into the campaign production-unit root using a descriptive,
   versioned filename. Verify the actual format with `file` and use the matching extension:
   Google Flow may return JPEG bytes even when a caller requested a `.png` filename. Keep the
   prompt, Flowkit IDs, QA, and handoff note in `node/`.
5. Verify the downloaded file has image data, correct dimensions/crop, legible text,
   correct packshot/variant, safe claims, and a current CTA.

## Output and Traceability

For a production deliverable, save:

- Final `.png` or `.jpg` at
  `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/`.
- `node/image-generation-log.json` with only: `model`, `project_id`, `video_id`,
  `scene_id`, `media_id`, `output_path`, `generated_at`, and `status`.
- `node/prompt.txt` with the submitted prompt and references used.

Never save credentials, cookies, Google Flow tokens, or signed download URLs to campaign files.

## Failure Handling

- **Extension disconnected or no token:** stop; reconnect Flowkit extension on the intended Chrome profile and refresh Google Flow.
- **Missing project/video/scene:** create or select the correct Flowkit project; do not use an unrelated active project.
- **Reference missing:** run `/fk-gen-refs <project_id>` before `/fk-gen-images`.
- **Expired media URL:** run `/fk-refresh-urls <project_id>`, then retry the download once.
- **Generation failure:** preserve the Flowkit request ID and error summary in `node/`, but never expose authentication material.

## Hard Rules

- Use Flowkit native skills and local APIs only; never call Google Flow/Vertex AI directly.
- Preserve the active ticket's approved product facts and Singapore claim rules.
- Do not overwrite approved assets; create a revision filename or date-folder suffix.
- Do not treat historical template price, offer, gift, claim, date, or CTA copy as current campaign data.
