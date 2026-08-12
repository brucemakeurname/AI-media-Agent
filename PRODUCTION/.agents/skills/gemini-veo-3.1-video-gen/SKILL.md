---
name: gemini-veo-3.1-video-gen
description: Complete reference for generating video via Google Veo 3.1 on Vertex AI, using this skill's own bundled client.py/render.py/sequence.py/stitcher.py (the former veo3-api-render module, folded in here 2026-07-21) — model IDs, every request mode (text_to_video, image_to_video, first+last frame morph), full parameter reference, hard API restrictions, RAI-filter behavior and retry pattern, and failure-mode diagnosis. Any skill or role that needs to call Veo 3.1 should point here instead of re-documenting the API inline.
---

# gemini-veo-3.1-video-gen

Reference skill for **how to call Veo 3.1** (and its 3.0/3.1-fast siblings). The runnable client
code lives in this same skill folder — `client.py` / `render.py` / `sequence.py` / `stitcher.py` —
folded in from the standalone `VIDEO_MODULES/veo3-api-render/` module (archived 2026-07-21, see
`archive/VIDEO_MODULES/veo3-api-render/`; this skill is now the sole place that module's code and
docs live). This is the team's video model for **pinned-keyframe / first+last-frame-morph** work — currently
just `ai-construction-timelapse-short-video`. **AI-scene UGC and commercial shorts render on
`gemini-omni-video-gen` instead** (cheaper per second, no frame-morph needed — moved there
2026-08-03; the old `UGC-video-Veo3.1-gen` wrapper is archived).
Does not itself write creative prompts — pair with `ai-timelapse-video` (the timelapse keyframe-chain
pipeline) or call directly when you already have a first frame + prompt in hand.

## 1. When to use Veo 3.1 vs alternatives

| Need | Use |
|---|---|
| Production ticket, need `durationSeconds` control (4/6/8, exact) | **Veo 3.1** (this skill) |
| Documented, hardened path this team already ships on | **Veo 3.1** |
| Batch >5 clips/hour, predictable quota/billing | **Veo 3.1** |
| Model's own scene-planning shown back (`thought` step), one-off prototyping | `gemini-omni-video-gen` instead |
| Editing an already-generated video by describing the change in words | `gemini-omni-video-gen`'s `edit` task — Veo has no equivalent |
| First+last frame morph (start and end keyframe both pinned) | Veo 3.1 **full** only (`lastFrame` param) — verified live 2026-07-22 on this project, no allowlist block |
| Need a Flow-UI-only feature (new model dropped in UI first) | `veo3-render/` (Flow UI via Kimi WebBridge), not this API path |

## 2. Auth & endpoint

Same service-account key as `nano-banana-image-gen` (project `solo-flows-free-gen-v1`),
loaded from this skill folder's own
`.claude/skills/gemini-veo-3.1-video-gen/solo-flows-free-gen-v1-15896bb3db79.json`.

```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/us-central1/publishers/google/models/{model}:predictLongRunning
POST .../{model}:fetchPredictOperation   (poll every ~8s until done)
```

- **Regional endpoint `us-central1`, NOT `global`** — this is the opposite of `nano-banana-image-gen`
  and `gemini-omni-video-gen`, both of which require `global`. Don't copy-paste the `global`
  convention from those skills onto Veo calls.
- **`v1`, not `v1beta1`** — again the opposite of the other two Vertex skills in this team.
- **Asynchronous `predictLongRunning` + poll loop** — unlike Omni's synchronous `interactions` call.
  `client.py`'s `VeoVertexClient` handles the poll internally via a calibrated `poll_schedule`
  (default `[65.0, 15.0, 20.0]`s, max 3 attempts — tuned against real 8s/720p renders observed at
  63.8-71.0s on 2026-07-28; a fixed 8s-interval loop was inflating Cloud Monitoring's
  `model_invocation_count` ~9-10x per video with zero cost benefit, since status polls don't
  regenerate the video). Don't build a second poll loop around it. If real renders start exceeding
  ~100s (3rd poll misses), pass a longer `poll_schedule` rather than reverting to tight intervals.
- **NEVER call the Gemini Developer API** (`generativelanguage.googleapis.com`) for this model.

## 3. Models

| Alias in `client.py` | Model ID | Notes |
|---|---|---|
| `MODEL_VEO_31` (`full`/`3.1`) | `veo-3.1-generate-001` | Full quality + audio. Only tier with `lastFrame` morph. |
| `MODEL_VEO_31_FAST` (`fast`/`lite`) | `veo-3.1-fast-generate-001` | Faster/cheaper tier, matches Flow's "Lite" tier. |
| `MODEL_VEO_30` (`3.0`, default in `client.py`'s signature) | `veo-3.0-generate-001` | Older generation, still GA and working. |
| `MODEL_VEO_20` | `veo-2.0-generate-001` | Legacy — don't use for new work. |

**Model ID gotcha:** GA suffixes are `-001`, not `-preview`. `veo-3.1-generate-preview` and
`veo-3.1-fast-generate-preview` are stale IDs from earlier docs/sessions and 404 on this project
(corrected 2026-07-21) — always use the `-001` GA suffix.

All Veo 3.x models generate synchronized audio by default (`generate_audio=True`); pass `False` to
disable.

## 4. Request modes

### 4a. `text_to_video`

No `first_frame`/`last_frame` passed — the model invents the opening frame from the prompt text
alone. **Not recommended for any character-consistent UGC/influencer content** — the model has no
anchor for likeness and will drift. Fine for b-roll/establishing shots with no named character.

### 4b. `image_to_video` (the team's default for character content)

Pass `first_frame=<path>`. The image is base64-encoded and sent as `instance.image`
(`{"bytesBase64Encoded": ..., "mimeType": ...}`). Veo animates forward from this exact frame — this
is why `ai-timelapse-video` always generates a keyframe first via `nano-banana-image-gen` rather
than calling Veo with text alone. The first frame's likeness, wardrobe, and framing carry directly
into frame 1 of the output; write the accompanying prompt text to describe **motion continuing
from** that frame, not a re-description of the frame itself.

### 4c. First+last frame morph (`veo-3.1-generate-001` only)

Pass both `first_frame` and `last_frame` — Veo interpolates between the two pinned keyframes.
**Verified live 2026-07-22** on `solo-flows-free-gen-v1`: a real `predictLongRunning` call
with both frames set (`veo-3.1-generate-001`, 4s/720p/9:16) succeeded on the first attempt, no
allowlist error, and the returned video's actual first/last extracted frames matched the two input
images — confirming a real morph, not silent first-frame-only animation. No allowlist gate exists
on this project; safe to promise this mode to a ticket.

## 5. Parameters reference

| Param | Values | Notes |
|---|---|---|
| `duration_seconds` | `4` / `6` / `8` | Hard ceiling is 8 for Veo 3.1 — no higher value is accepted. |
| `aspect_ratio` | `"16:9"` / `"9:16"` / `"1:1"` | Match the platform target — `9:16` for Stories/Reels/UGC, `16:9` for landscape/YouTube. |
| `resolution` | `"720p"` / `"1080p"` | 1080p costs more and renders slower — reserve for hero/campaign final delivery, default to 720p for drafts/UGC. |
| `sample_count` | `1`-`4` | Generates N variations in one call — useful for picking the best take without re-billing per attempt, but each sample still counts toward quota/cost. |
| `generate_audio` | `bool` | Default `True` on Veo 3.x (synchronized dialogue/SFX/ambience per the prompt text). |
| `person_generation` | `"allow_adult"` / `"allow_all"` / `"dont_allow"` | Policy gate. Default `"allow_adult"` in `client.py`. Set `"dont_allow"` to short-circuit on a sensitive prompt rather than let the RAI filter decide. |
| `first_frame` | path | See §4b. |
| `last_frame` | path | See §4c — full model only, allowlist-gated. |
| `storage_uri` | `"gs://bucket/path/"` | Output goes to GCS instead of inline base64 — use for high-volume runs; response then carries `gcs_uri` instead of `video_b64`, and `save_video()` will raise if you call it without downloading from GCS first. |
| `negative_prompt` | string | Reuse the source creative prompt's own negative_prompt verbatim where one exists — don't write a fresh one from scratch if the ticket/template already specified one. |
| `seed` | int | For reproducibility across re-renders of the same shot. |

**No `fps`/`duration` sub-second control exists.** Veo does not expose a frame-rate parameter —
if a prompt asks for "60fps" or similar, that's a **text-only aesthetic hint** the model may or may
not honor, not a real encode setting; say so explicitly when reporting results back (verified: no
such field in `generate_video()`'s signature or the underlying `parameters` payload).

## 6. RAI (content-safety) filtering — real, probabilistic, not a prompt-correctness signal

Veo 3.1 blocks some real-face-reference renders even on policy-clean, already-`policy_review:
remediated` prompts. Verified behavior this session: an identical `image_to_video` call with the
same first frame and same prompt was blocked on attempt 1 (`No videos in response`,
`raiMediaFilteredReasons: [...support code...]`) and succeeded cleanly on attempt 2 with zero prompt
changes.

**Practical rule:** retry the identical call once or twice before touching the prompt. Only start
softening wording (removing edgy adjectives, rephrasing wardrobe descriptions) after 3+ consecutive
filtered attempts — at that point treat it as a real signal, not noise.

Blocked renders are not billed (Vertex's own confirmation in the error payload) — don't build retry
backoff logic that assumes otherwise, and don't hesitate to retry on cost grounds.

This is a different filter shape than `gemini-omni-video-gen`'s — that model returns typed errors
(`content_blocked` / `safety`) synchronously in the same call; Veo's shows up as an empty
`videos`/`predictions` array inside an otherwise-`done: true` operation, with the reason text buried
in `raiMediaFilteredReasons`.

## 7. Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `403 PERMISSION_DENIED` | Service account missing `roles/aiplatform.user` | Grant on project, wait ~60s for propagation |
| `400 INVALID_ARGUMENT: duration` | Asked for a duration outside 4/6/8 | Use exactly 4, 6, or 8 |
| `400 quota exceeded` | Project quota hit | Wait, or request a quota bump |
| Operation never finishes (>600s) | Backend hang | Re-submit; rare |
| `No videos in response` / `raiMediaFilteredReasons` present | RAI content filter (see §6) | Retry identical call 1-2x before rephrasing |

## 8. Cost & quota

Billed per-second-of-output, per-resolution, per Vertex AI pricing — independent of any Google
account's Flow subscription; check current limits at
`console.cloud.google.com/iam-admin/quotas?project=solo-flows-free-gen-v1` filtered to service
`aiplatform.googleapis.com`. For high-volume runs, set `storage_uri` to land output directly in GCS
instead of paying inline-base64 transfer overhead.

## 9. Minimal runnable example

```python
import asyncio
from client import VeoVertexClient, MODEL_VEO_31

async def main():
    async with VeoVertexClient() as c:
        result = await c.generate_video(
            "Camera slowly pulls back, soft breeze moves her hair.",
            model=MODEL_VEO_31,
            duration_seconds=8,
            aspect_ratio="9:16",
            resolution="720p",
            first_frame="keyframe.jpg",
            negative_prompt="blurry, watermark, distorted, extra fingers",
        )
        out = await c.save_video(result, "output/clip.mp4")
        print(f"Done in {result.generation_time_ms/1000:.1f}s via {result.model}")

asyncio.run(main())
```

## Do / Don't

- DO always pass `first_frame` for any named-character/UGC content — never bare `text_to_video` for
  those tickets.
- DO retry an RAI-filtered call 1-2x before rephrasing the prompt.
- DO reuse the source creative prompt's own `negative_prompt` rather than writing a new one.
- DON'T call the `global` endpoint or `v1beta1` for Veo — that's the Omni/nano-banana convention,
  not this one. Veo is `us-central1` + `v1`.
- DON'T ask for a duration above 8s in a single call — 8s is the hard ceiling for this model.
- DON'T treat a single RAI-filtered attempt as proof the prompt needs rewriting.
- DON'T expect an `fps`/frame-rate parameter — describe motion smoothness in prose only.

## Graph

**Used by:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/ai-timelapse-video/SKILL|ai-timelapse-video]] (construction-timelapse, first+last-frame morph, no-audio) · [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/video-editor|video-editor role]]
**Former module (archived 2026-07-21):** `archive/VIDEO_MODULES/veo3-api-render/` (old CLAUDE.md, campaign_report.md, design-sequence.md, production-guideline.md, prior render output — historical reference only, code moved into this skill folder)
**Sibling (different model/API surface):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/gemini-omni-video-gen/SKILL|gemini-omni-video-gen]]
**Keyframe source:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen]]
