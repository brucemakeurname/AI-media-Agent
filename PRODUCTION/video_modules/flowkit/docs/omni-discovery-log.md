# Omni Flash Discovery Log — 2026-08-07

Raw findings from reverse-engineering Google Flow's Omni Flash model into this fork. Kept
separate from `skills/fk-omni-video-gen.md` (the usage doc) so the exact evidence trail survives
even if the skill doc gets rewritten later. Account used: `PAYGATE_TIER_ONE`, `G1_TIER1`,
`SERVICE_TIER_INTERMEDIATE`.

## Method

Added a passive `chrome.webRequest.onBeforeRequest` listener in `extension/background.js`
(separate from the pre-existing `onBeforeSendHeaders` token-capture listener) scoped to
`https://aisandbox-pa.googleapis.com/*`, logging every request's method/url/body to the
extension's service-worker console — including requests Flow's own website fires natively from
its UI, not just ones the agent proxies on command.

## 1. Text-to-video model key

User selected "Omni" in Flow's model picker, prompted "a sun", generated. Captured via the
`flow:batchLogFrontendEvents` analytics call (frontend's own internal logging, not the real API
request body):

```json
{"modelKey":"abra_t2v_4s","apiPathname":"batchAsyncGenerateVideoText","aspectRatio":"PORTRAIT","outputsPerPrompt":1,"structuredPrompt":{"parts":[{"text":"a sun"}]},"referenceImages":[],"referenceAudioIds":[],"shouldReturnSilentVideos":false}
```

Confirmed live via direct API call (`POST /v1/video:batchAsyncGenerateVideoText`) — note the real
endpoint needs `aspectRatio: "VIDEO_ASPECT_RATIO_PORTRAIT"` (long form), NOT `"PORTRAIT"` as shown
in the analytics blob above (that short form → `400 INVALID_ARGUMENT` on
`requests[0].aspect_ratio`). Successful response:

```json
{"videoModelControlInput":{"videoModelName":"abra_t2v_4s","videoGenerationMode":"VIDEO_GENERATION_MODE_TEXT_TO_VIDEO","videoAspectRatio":"VIDEO_ASPECT_RATIO_PORTRAIT","videoResolution":"VIDEO_RESOLUTION_720P"}}
```

Downloaded and verified via `ffprobe`: 720x1280, h264, 4.01s, ~1MB.

## 2. Reference-to-video model key

User uploaded a reference image, selected Omni, prompted "a girl drinking cofee", generated.
Same analytics-event method:

```json
{"modelKey":"abra_r2v_4s","apiPathname":"batchAsyncGenerateVideoReferenceImages","aspectRatio":"PORTRAIT","outputsPerPrompt":1,"structuredPrompt":{"parts":[{"text":"a girl drinking cofee"}]},"referenceImages":[{"imageId":"fe_id_6d10a27c-9116-47b0-8be8-fe7695070ce8"}],"referenceAudioIds":[],"shouldReturnSilentVideos":false}
```

Confirmed live via `POST /v1/video:batchAsyncGenerateVideoReferenceImages` with a Khánh Huyền
face reference image (uploaded via the existing `upload_image` method), model
`abra_r2v_4s`, mode `VIDEO_GENERATION_MODE_REFERENCE_TO_VIDEO`,
`videoModelCapabilities: ["VIDEO_MODEL_CAPABILITY_MULTI_REFERENCE"]`, 720p. Downloaded and
verified: 720x1280, h264, 4.01s, ~1MB, character face carried through into the generated clip.

## 3. Duration variants

Guessed the model-key suffix might parametrize duration given the literal `_4s` in the name.
Hot-patched `models.json` via `PATCH /api/models` (no restart needed) to swap in `abra_t2v_6s`,
`abra_t2v_8s`, `abra_t2v_10s` one at a time and called `generate-video-text` for each — all
three succeeded (no model-not-found error), with credits dropping 928→918→906→891 (deltas
10/12/15, i.e. cost rises with duration). Repeated for `abra_r2v_{6,8,10}s` via
`generate-video-refs-omni` — credits 881→869→854 (same 10/12/15 delta pattern). Conclusion:
Omni Flash supports **4 discrete duration levels — 4s, 6s, 8s, 10s** — confirmed for both
text-to-video and reference-to-video, on `PAYGATE_TIER_ONE`.

Not tested: whether `abra_t2v_*`/`abra_r2v_*` durations differ for `PAYGATE_TIER_TWO` (may use a
different key family entirely, the way Veo does — see `skills/fk-change-model.md`'s tier table).

## 4. Upscale tier-gate correction

`skills/fk-doctor.md` claimed (pre-2026-08-07) that upscale requires `PAYGATE_TIER_TWO` and
`PAYGATE_TIER_ONE` cannot upscale. Directly disproved: user manually triggered upscale+download
in the Flow UI on `PAYGATE_TIER_ONE` and it worked. Confirmed programmatically —
`POST /api/flow/upscale-video` with `resolution: VIDEO_RESOLUTION_1080P` against an
Omni-generated clip succeeded (`videoModelName: veo_3_1_upsampler_1080p`,
`mediaGenerationStatus: MEDIA_GENERATION_STATUS_PENDING` → polled to completion). Output verified
via `ffprobe`: 1080x1920 (up from the source 720x1280), 4.0s. `remainingCredits` unchanged
(928→928) across the upscale call — either free or already bundled into generation cost. 4K
upscale (`veo_3_1_upsampler_4k`) was NOT re-tested — the TIER_TWO requirement for 4K specifically
remains unconfirmed, don't assume it's also unlocked.

## 5. Reference-voice (`referenceAudioIds`) — inconclusive, not live

The analytics payloads above both show an empty `"referenceAudioIds": []` array alongside
`referenceImages`, suggesting Flow's frontend has a code path reserved for voice-reference input
that may not be wired to the backend yet. Directly probed via a new dev-only
`POST /api/flow/raw` passthrough (added specifically for this investigation — see
`skills/fk-omni-video-gen.md`), three placements tried against
`batchAsyncGenerateVideoReferenceImages`:

1. `requests[0].referenceAudioIds = ["fake-audio-id-test-0001"]` →
   `400 Unknown name "referenceAudioIds" at 'requests[0]': Cannot find field.`
2. top-level `body.referenceAudioIds = ["fake-audio-id-test-0002"]` →
   `400 Unknown name "referenceAudioIds": Cannot find field.`
3. `referenceImages[1] = {mediaId: ..., imageUsageType: "IMAGE_USAGE_TYPE_AUDIO"}` →
   `400 Invalid value at 'requests[0].reference_images[1].image_usage_type' ... "IMAGE_USAGE_TYPE_AUDIO"`
   (the field `image_usage_type` is real and enum-validated — `IMAGE_USAGE_TYPE_AUDIO` just isn't
   a member of it; `IMAGE_USAGE_TYPE_ASSET` is the only confirmed-valid value so far)

No fourth guess was attempted (diminishing returns on blind guessing against a real paid API).
Conclusion: not accessible today. This is a Google-side backend gap
(`aisandbox-pa.googleapis.com`), not something this fork's client code can work around — flowkit
calls that API, it doesn't own it. Re-probe if Google ships more of the Omni Public Preview
surface later. Practical workaround for a custom voice today: local OmniVoice TTS
(`fk-import-voice.md`/`fk-gen-narrator.md`) mixed onto the clip in post via ffmpeg — not
in-generation lip-sync, but a controlled voice track.

## Graph
[[../skills/fk-omni-video-gen|fk-omni-video-gen (usage doc)]] · [[../skills/fk-doctor|fk-doctor]] · [[../README|flowkit README]]
