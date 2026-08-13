# fk-omni-video-gen — Omni Flash Video Generation (Solo Flows fork addition)

Generate video via Google Flow's **Omni Flash** model (`abra_t2v_*` / `abra_r2v_*`) — a model
present in Flow's own web UI but never wired into upstream flowkit, which only ever called Veo
3.1. Reverse-engineered 2026-08-07 by sniffing Flow's own frontend network traffic (see
`ARCHITECTURE.md` "2026-08-07 Solo Flows fork" section for the discovery method). Goes through
the same `FlowClient`/Chrome-extension browser-session mechanism as every other flowkit call —
not a separate Vertex AI/API-key integration.

## When to use this vs Veo 3.1

- Use Omni (`generate-video-text` / `generate-video-refs-omni`) when you specifically want the
  Omni Flash model — e.g. matching a ticket that calls for it, or A/B-testing render quality
  against Veo.
- Use the existing Veo methods (`generate-video`, `generate-video-refs`) for everything else —
  Veo is the hardened, documented, production-default path in this fork (see main `README.md`).

## Endpoints

| Endpoint | Task | Notes |
|---|---|---|
| `POST /api/flow/generate-video-text` | Text-to-video, no image input | model `abra_t2v_{duration_s}s` |
| `POST /api/flow/generate-video-refs-omni` | Reference-to-video, 1+ character/product images | model `abra_r2v_{duration_s}s` |

Both accept `duration_s` (default `4`), one of **`4`, `6`, `8`, `10`** — all four live-verified
working on `PAYGATE_TIER_ONE` 2026-08-07. Credit cost rises with duration (~10/12/15 credits
observed for 6s/8s/10s vs the 4s baseline — get exact current pricing via
`GET /api/flow/credits` before/after a call). Resolution is fixed at 720p (Public Preview
limitation) — use `/api/flow/upscale-video` afterward if you need more, see below.

### Text-to-video example

```bash
curl -s -X POST http://127.0.0.1:8100/api/flow/generate-video-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A close-up of a fresh morning cup of coffee steaming on a wooden table, soft golden light",
    "project_id": "<PID>",
    "scene_id": "scene-1",
    "aspect_ratio": "VIDEO_ASPECT_RATIO_PORTRAIT",
    "duration_s": 6
  }'
```

### Reference-to-video example

Upload reference image(s) first via the existing `/api/flow/upload-image` (same as Veo r2v), then:

```bash
curl -s -X POST http://127.0.0.1:8100/api/flow/generate-video-refs-omni \
  -H "Content-Type: application/json" \
  -d '{
    "reference_media_ids": ["<MEDIA_ID>"],
    "prompt": "A young woman using the reference image as her face, smiling confidently at a cafe table",
    "project_id": "<PID>",
    "scene_id": "scene-1",
    "aspect_ratio": "VIDEO_ASPECT_RATIO_PORTRAIT",
    "duration_s": 4
  }'
```

Response is workflow-mode (has a `"workflows"` array with `primaryMediaId`) — poll completion via
`GET /api/flow/media/<primaryMediaId>` (NOT `check-status`/`operations`, that's the old-schema
path used by Veo's `frame_2_video`/`start_end_frame_2_video` — see `fk-status.md` "Two polling
paths" for the distinction). Once `video.encodedVideo` (base64) appears in the response, decode
and save.

> **Known broken as of 2026-08-13:** this poll always 400s (`INVALID_ARGUMENT`) right now — live-
> reproduced on both a fresh Omni workflow and an old completed Veo media_id, so it's a broken
> `get_media()` request shape, not an Omni- or timing-specific issue. Credits are already spent by
> generation before this fails. Until re-discovered, download the finished clip manually from the
> Flow web UI instead of polling. Full repro + probing notes: `docs/omni-discovery-log.md` §6.

## Upscale (works on TIER_ONE — corrected 2026-08-07)

`fk-doctor.md`'s old note that upscale needs `PAYGATE_TIER_TWO` was wrong for 1080p — live-verified
via `POST /api/flow/upscale-video` with `resolution: VIDEO_RESOLUTION_1080P` on a `PAYGATE_TIER_ONE`
account, no extra credit cost observed. 4K (`VIDEO_RESOLUTION_4K`) tier requirement was not
re-tested — treat it as still TIER_TWO-only until confirmed. Works on Omni-generated clips exactly
like Veo ones (same `upscale_video` method/endpoint, model-agnostic).

## Reference-voice (`referenceAudioIds`) — NOT confirmed working

Flow's frontend analytics payload (`batchLogFrontendEvents` → `MEDIA_GENERATION_SETTINGS`) includes
an empty `"referenceAudioIds": []` field alongside `referenceImages` for r2v requests — suggesting
a planned but not-yet-live voice-cloning-into-video feature. Directly probed 2026-08-07 via
`POST /api/flow/raw` (dev-only raw-request escape hatch, see below):

- `referenceAudioIds` inside `requests[0]` → `400 Unknown name "referenceAudioIds": Cannot find field`
- `referenceAudioIds` at top-level body → same `Unknown name` error
- `imageUsageType: "IMAGE_USAGE_TYPE_AUDIO"` piggybacked into `referenceImages[]` → `400 Invalid value` (field exists, that enum value doesn't)

Conclusion: not accessible via `batchAsyncGenerateVideoReferenceImages` as of 2026-08-07, on this
account. This is a genuine backend gap on Google's side (`aisandbox-pa.googleapis.com`), not
something fixable from this repo — flowkit is a client of that API, not its owner. If you need a
custom/cloned voice on an Omni-generated clip today, use the existing local **OmniVoice TTS**
pipeline instead (`fk-import-voice.md` to clone from a WAV, `fk-gen-narrator.md` to generate
narration) and mix the audio track onto the (silent or model-default-voiced) video in post via
ffmpeg — not true in-generation lip-sync, but delivers a controlled voice track today. Re-probe
periodically; Google may wire this up server-side later — see `docs/omni-discovery-log.md` for
the exact request/response pairs to replay.

## Dev tool: `POST /api/flow/raw`

Added alongside this discovery — a thin passthrough to `client._send()` for probing undocumented
Flow endpoints without writing a typed method first. Body: `{"path": "/v1/...", "method": "POST",
"body": {...}, "captcha_action": "VIDEO_GENERATION"}` (path only, no host/key — those are added
automatically). Dev/reverse-engineering only; once a call shape is confirmed, promote it to a real
typed method on `FlowClient` (see `generate_video_text`/`generate_video_refs_omni` for the
pattern) rather than leaving production call sites on `/raw`.

## Discovery method (for future reverse-engineering)

1. Add a passive `chrome.webRequest.onBeforeRequest` listener in `extension/background.js`
   scoped to `https://aisandbox-pa.googleapis.com/*` with `['requestBody']` — this observes ALL
   requests to that domain, including ones Flow's own website fires natively from its UI, not
   just ones this agent's `handleApiRequest` proxies on command. The existing token-capture
   listener (`onBeforeSendHeaders`) only sees headers, not bodies — this is a separate listener.
2. Reload the extension, perform the action in the Flow web UI (pick a model, generate, click
   upscale, etc.), then read the captured bodies from the extension's service-worker DevTools
   console (`chrome://extensions` → this extension → "service worker" inspect link).
3. The real API request body ≠ the `batchLogFrontendEvents` analytics payload — the analytics
   blob is a simplified/short-form internal representation (e.g. `aspectRatio: "PORTRAIT"`) that
   does NOT match the actual field values the real endpoint expects (`"VIDEO_ASPECT_RATIO_PORTRAIT"`)
   — confirmed by live 400s. Use the analytics payload only to learn the *existence* of a model
   key/field, then verify the real request shape empirically against the actual endpoint.
4. Bodies with large recaptcha tokens get truncated by naive slicing — search for the field of
   interest (e.g. `modelKey`) and log a window around it instead of the first N characters.

## Graph
[[../README|flowkit README]] · [[fk-doctor|fk-doctor (troubleshooting)]] · [[fk-change-model|fk-change-model]] · [[fk-gen-videos|fk-gen-videos (Veo path)]] · [[../../WORKFLOWS/[social]_[ai-commercial-short-video]|ai-commercial-short-video workflow]]
