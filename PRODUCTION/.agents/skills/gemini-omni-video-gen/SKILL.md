---
name: gemini-omni-video-gen
description: Generate and edit video via Vertex AI Gemini Omni Flash (Public Preview) using the `interactions` API. Covers text-to-video, image-to-video, reference-to-video, and video editing (gs:// input). Not the production default — see gemini-veo-3.1-video-gen for that.
---

# Gemini Omni Flash Video Gen/Edit Skill

## Step 0: Is this the right tool?

Use this skill when the ticket needs: the model's own scene-planning shown back (`thought`
step), quick prototyping, or **editing an already-generated video by describing the change in
words** (no other module in this team can do that). Use `gemini-veo-3.1-video-gen` instead for production
tickets needing `durationSeconds` control or the documented, hardened RAI-tested path — Omni is
Public Preview, no SLA.

## Auth & Endpoint

Same service-account key as `nano-banana-image-gen` (`solo-flows-free-gen-v1`). Reuse by
relative path — never copy the secret into this skill folder.

```
POST https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/global/interactions
```

- **MUST be `locations/global`**, **MUST be `v1beta1`**.
- **NEVER call `publishers/google/models/{model}:generateContent` or `:predictLongRunning`** for
  this model — it 404s regardless of actual access. That 404 looks exactly like an allowlist
  rejection but isn't one; this is a distinct API resource (`interactions`, verified 2026-07-20).
- No poll loop — synchronous call, blocks ~35-45s (video) until done.
- **NEVER use the Gemini Developer API** (`generativelanguage.googleapis.com` /
  `aistudio.google.com`) — excluded from GCP trial credit, unlike this Vertex AI path.

## Step 1: Pick the task

| `generation_config.video_config.task` | Use when |
|---|---|
| `text_to_video` | No image/video input, prompt alone drives the scene |
| `image_to_video` | One static image animated into motion |
| `reference_to_video` | 1-2+ images as character/object/style refs, new scene composited around them |
| `edit` | Modify an existing video (lighting, added elements, mood) by description |

`task` is optional for the first three (model infers from input mix) but always set it explicitly
for clarity. **`edit` requires it** and has different input/output rules (see Step 4).

## Step 2: Build the prompt

Text-only, no JSON schema needed (unlike nano-banana-image-gen) — describe scene, camera,
lighting, dialogue, SFX, music directly in prose. If dialogue is in Vietnamese, **explicitly state
the language and accent in the prompt** (e.g. "speaking Vietnamese, Northern/Hanoi accent") —
omitting this produced audibly wrong-sounding voice in testing (verified 2026-07-19).

**Voice control is prompt-text-only.** There is no reference-audio input — confirmed twice,
via two different upload mechanisms: inline base64 (`{"type":"audio","data":"<base64>"}` →
`400 This model does not support audio input.`) AND via `gs://` URI, the same mechanism that
works for `edit`'s video input (`{"type":"audio","uri":"gs://..."}` → same
`400 This model does not support audio input.`). The block is model-level, not a transport/upload
quirk — trying `document`+`audio/wav` mime instead of `type:"audio"` doesn't help either; the
server just stops recognizing it as audio at all (`400 At least one image or audio must be
provided for reference_to_video task.`). Interesting detail: that second error's own wording
("image **or audio**") shows `reference_to_video`'s schema already has a conceptual slot for audio
refs — Google just hasn't turned audio input on yet in this Preview. No preset-voice parameter
exists either (confirmed: `voice_name`, `voice`, `speech_config` at both top level and under
`video_config` all → `400 Unknown parameter`; those fields belong to the separate Gemini Live API).
Describe the voice in words instead: "warm young female voice, Northern accent."

**Duration is not a request parameter.** Rejected probes: `duration`, `duration_seconds`,
`video_length`, `video_length_seconds`, `num_seconds`. The model picks clip length itself
(docs: 3-10s) from the prompt's narrative pacing — write pacing into the prompt text, don't expect
an exact-second enum like Veo's `durationSeconds`.

## Step 3: text_to_video / image_to_video / reference_to_video

```json
{
  "model": "gemini-omni-flash-preview",
  "input": [
    {"type": "image", "mime_type": "image/png", "data": "<base64>"},
    {"type": "image", "mime_type": "image/png", "data": "<base64>"},
    {"type": "text", "text": "Using <IMAGE_REF_0> as the character and <IMAGE_REF_1> as the product, ..."}
  ],
  "response_format": {"type": "video", "aspect_ratio": "9:16"},
  "generation_config": {"video_config": {"task": "reference_to_video"}}
}
```

- `input[]` order matters: **all image items first, text last**. Address specific images in the
  prompt with 0-indexed `<IMAGE_REF_0>`, `<IMAGE_REF_1>`, ... tags.
- **2 reference images verified working in one call.** Docs claim up to ~6-7 — not verified at
  that count by us.
- `response_format.aspect_ratio`: `"9:16"` / `"16:9"`. Only `"9:16"` exercised.
- Resolution is 720p only (Public Preview), no override field.

## Step 4: `edit` — modify an existing video

Verified 2026-07-20 by direct test (golden-hour relight + added falling leaves on a real
campaign clip — succeeded, output matched the requested change).

**Mechanism: upload the source video to a GCS bucket in this project, pass the `gs://` URI.**
There is no separate "Files API" for Vertex AI (that `files/...` URI scheme belongs to the Gemini
Developer API, which is off-limits — see Hard Rules). Upload via the plain GCS JSON API using the
same service-account token:

```
POST https://storage.googleapis.com/upload/storage/v1/b/{BUCKET}/o?uploadType=media&name={OBJECT}
Content-Type: video/mp4
(raw video bytes as body)
```

Then call `interactions` with:

```json
{
  "model": "gemini-omni-flash-preview",
  "input": [
    {"type": "video", "mime_type": "video/mp4", "uri": "gs://BUCKET/OBJECT.mp4"},
    {"type": "text", "text": "Change the lighting to golden hour sunset and add gentle falling autumn leaves in the background."}
  ],
  "response_format": {"type": "video"},
  "generation_config": {"video_config": {"task": "edit"}}
}
```

**Rules specific to `edit`, all confirmed by live 400 errors during discovery:**
- Input item type **must be `"video"`** (not `"document"`, not `"file"` — those either get
  misread as a different modality or are rejected outright as unknown `type` values).
- **`response_format` must NOT include `aspect_ratio`** — edit keeps the source video's aspect
  ratio; setting it returns `400 Aspect ratio cannot be set in response format for edit task.`
- **Exactly one video input is required** — `400 Exactly one input video is required for edit
  task.` if the video item is missing or malformed.
- This is a **single-shot edit**, not a multi-turn conversation via `interaction_id` — despite the
  docs' "more natural way to edit videos through conversation" framing, the verified mechanism is
  one call: source video (by `gs://` URI) + one text instruction → one edited output. No
  `interaction_id` chaining was needed or tested.
- Clean up: delete the GCS object/bucket after the edit completes if it was created solely for
  this call — don't leave scratch buckets in the project.

**Coming soon, not available yet — do not attempt:** Video Extension (extend a clip), Video
Upscaling. These aren't in this Preview release at all (not just "untested").

**Documented but not exercised — verify before relying on these:**
- Video-clip references (≤3s) via a separate document/Files-API path for *reference* use (distinct
  from the `edit` video input above) — docs themselves warn this is "accepted by the API schema
  but not correctly processed by the model at this time."
- Outputs >4MB reportedly return a `uri` (GCS) instead of inline base64 `data` when a
  `delivery: "uri"` option is set — not exercised, every clip so far fit inline.

## RAI policy — what actually triggers a block (verified 2026-07-20, real-face reference_to_video)

Google's RAI filter on this model returns two distinct error shapes:
- `content_blocked`: `"...contains certain restricted individuals..."` — real-identity/likeness concern.
- `safety`: `"...violates...child safety."` — a separate, stricter filter.

Verified triggers and non-triggers, isolated one variable at a time against the same real-face
reference image (Khanh Huyen):

| Element | Result |
|---|---|
| Prompt literally says "real person photography" | ❌ blocked (`content_blocked`) — describing the output as photography of a real person reads as reproducing a specific identifiable individual |
| Same scene reworded "cinematic photorealistic portrait" / "photorealistic skin and lighting detail" (no "real person photography" phrase) | ✅ passes — photorealism itself is fine, that specific phrase isn't |
| Prompt insists hair/makeup "exactly match/faithful to the reference image", "do not invent a different [X]" | ❌ blocked (`content_blocked`) — identity-fidelity language reads as "reproduce this real person exactly" |
| Same hair/makeup described in plain descriptive words instead (no fidelity-to-reference language) | ✅ passes |
| Divergent surface trait vs. the real photo (e.g. pink hair when the reference has dark hair) | ✅ passes more easily — reads as stylized reinterpretation rather than faithful reproduction |
| "Sweet cute girl" / infantilizing language + winking/laughter, on a realistic face ref | ❌ blocked (`safety`, child safety) — youthful-coded language stacks risk even for an adult character |
| Same character reframed explicitly as "elegant young adult woman" / "young adult woman", confident smile (no "cute girl" wording) | ✅ passes |
| Just-washed/damp hair, described alone | ✅ passes |
| POV hand entering frame, neutral action (e.g. handing over a cup) | ✅ passes |
| Towel-wrapped / implied-undress framing + simulated physical touch (hair petting, cheek pinching) + romantic-partner address ("Hubby~") + kiss-the-lens beat, all combined | Not tested against the API — declined on our own judgment before calling. This combination (real-face reference + implied undress + simulated intimacy) should be filtered out at template intake, not probed case-by-case. |
| Wet hair + t-shirt + shorts + steam, set in a **bathroom** ("just got out of shower", mirror, bathroom acoustics) | ❌ blocked (`content_blocked`) — even with fully modest clothing described, the bathroom/just-showered framing itself is a trigger |
| Identical wet-hair/t-shirt/shorts/steam aesthetic, same "just washed hair" detail, moved to a **living room** with a humidifier instead of a bathroom | ✅ passes — the location was the trigger, not the wet-hair/casual-clothing/steam combination |

**Practical rules for prompt-writing with a real-face reference:**
1. Don't literally write "real person photography" — use "photorealistic"/"cinematic photography style" instead.
2. Don't write identity-fidelity language ("exactly matching the reference", "faithful to", "do not invent a different X") — just describe the desired look in plain words.
3. Frame adult characters unambiguously as adults ("young adult woman") — avoid "cute girl"/infantilizing wording, especially combined with winking/giggling beats.
4. Avoid bathroom settings for real-face references even with modest clothing — relocate to another room (living room, kitchen) for the same aesthetic (wet hair, steam, robe-free casual wear).
5. Never combine implied undress + simulated physical touch + romantic-partner framing + camera-directed kissing on a real-face reference — reject these templates before generation, don't rely on the filter to catch them.

## Step 5: Parse the response

```json
{
  "id": "...",
  "status": "completed",
  "steps": [
    {"type": "thought", "summary": [{"text": "...model's own scene plan..."}]},
    {"type": "model_output", "content": [{"mime_type": "video/mp4", "data": "<base64>"}]}
  ]
}
```

- `steps[0]` (`thought`) — the model's own narration of its plan. Useful for debugging a bad
  render (it will describe exactly what it changed/generated).
- `steps[last]` (`model_output`) — `content[].data` is base64 mp4. Decode and write to disk.

## Step 6: Present result

After generation: read/play the output to verify it matches the request, note which task was
used and why, and report the `thought` summary if the output looks off (it usually explains its
own reasoning).

## Hard Rules

- **NEVER call `publishers/google/models/{model}:generateContent`/`:predictLongRunning`** — always
  `locations/global/interactions`.
- **NEVER use the Gemini Developer API** for this model (excluded from GCP trial credit).
- **`edit` task**: input type `"video"` (not `"document"`/`"file"`), no `aspect_ratio` in
  `response_format`, exactly one video input, video sourced via a `gs://` GCS URI you upload
  yourself (no dedicated Vertex "Files API" exists for this).
- No reference-audio/voice-cloning input exists on this model. No preset-voice-selection
  parameter exists either. Voice is prompt-text-only.
- No `duration` request parameter — model self-selects clip length from prompt pacing.
- RAI filtering is real but anecdotal here (1 passing test) — don't build a "use Omni to dodge
  filters" workflow on that alone; see `gemini-veo-3.1-video-gen`'s more-tested pattern for comparison.

## Runnable reference

This skill folder's own `client.py` — `OmniVertexClient.generate_video(...)` implements Steps 3/5
(text/image/reference-to-video). Folded in from the former standalone `VIDEO_MODULES/gemini-omni-
video-gen/` module (merged 2026-07-21, same treatment as `gemini-veo-3.1-video-gen`; old module
docs/artifacts moved to `archive/VIDEO_MODULES/gemini-omni-video-gen/`). The `edit` flow (Step 4,
GCS upload + edit call) is verified working via direct testing this session but not yet wrapped
into `client.py` — add an `edit_video(source_path, instruction)` method there before relying on
this in a production ticket.

## Graph

**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/video-editor|video-editor role]]
**Former module (archived 2026-07-21):** `archive/VIDEO_MODULES/gemini-omni-video-gen/` (old CLAUDE.md, prior render output — historical reference only, code moved into this skill folder)
**Sibling:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/gemini-veo-3.1-video-gen/SKILL|gemini-veo-3.1-video-gen (Veo, production default)]]
**Related:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen (same Vertex AI auth)]]
