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

## 6. `GET /v1/media/{id}` poll endpoint is currently broken — not Omni-specific (2026-08-13)

Production run on `UltimateSup Plus` (see `DOCS/flowkit-handoff-mutant-big-greens-2026-08-13.md`) hit
`400 INVALID_ARGUMENT` ("Request contains an invalid argument.") on every poll of
`GET /api/flow/media/<primaryMediaId>` after a successful Omni `generate-video-text`/
`generate-video-refs-omni` call. Reproduced live the same day with a fresh diagnostic project
(cost: 7 credits, `887→880`, tier `PAYGATE_TIER_ONE`):

1. New Omni text-to-video request (`abra_t2v_4s`) → `remainingCredits` dropped, workflow returned
   `primaryMediaId` normally — generation submission itself works fine.
2. Immediate poll and poll after 40s wait → **identical 400 both times** — ruling out a
   still-generating/not-ready timing issue.
3. Tested the exact same `get_media()` call against an **old, already-`COMPLETED` Veo scene's**
   `vertical_video_media_id` (pulled from `flow_agent.db`) → **same 400.** This means the bug is
   NOT specific to Omni's workflow-mode media — the `GET /v1/media/{id}` polling path itself is
   currently broken for this account, for both models.
4. Tried variants via the `/api/flow/raw` dev passthrough: dropping `clientContext.tool` entirely,
   swapping `PINHOLE`→`BACKBONE`, resource-name form `media/{id}` instead of bare `{id}` — all
   identical generic 400. `POST /v1/media:batchGet?names=...` returned a *different*, more specific
   `Cannot bind query parameter` error — confirming the gateway is alive and validating fields, so
   this isn't a dead endpoint, just the wrong request shape/contract for `GET /v1/media/{id}`.

**Conclusion:** `agent/services/flow_client.py:get_media()` (`GET /v1/media/{mediaId}?key=...&clientContext.tool=PINHOLE`)
no longer matches what `aisandbox-pa.googleapis.com` expects — likely Google changed the real
request contract for this endpoint since it was last confirmed working (this discovery log's
2026-08-07 entries describe direct generation download success, but never explicitly show a
successful poll through this exact endpoint — that step may have been assumed, not verified).
`agent/sdk/services/operations.py:_poll_workflows()` calls the same broken `get_media()`, so the
"proper" internal SDK polling path is equally affected, not just the manual curl instructions in
`fk-omni-video-gen.md`.

**Practical impact today:** any Omni-generated clip is unrecoverable via the API poll path — credits
are already spent by the time this fails. **Workaround until re-discovered:** after submitting an
Omni request, open the Flow web UI (`labs.google/fx/tools/flow`) for that project and manually
download the finished clip once it appears there, instead of relying on `/api/flow/media/<id>`
polling. Re-run the discovery method (§ below) on `GET /v1/media/{id}` specifically before trusting
this path again — needs a fresh `chrome.webRequest` capture of what Flow's own frontend sends when
it polls, since guessing query-param variants blind hit diminishing returns fast (3 variants tried,
all failed identically).

## 7. Real fix for §6 — correct current polling contract, captured live from Flow's own UI (2026-08-13)

Continuation of §6 same day. Rather than keep guessing query-param variants against the dead
`GET /v1/media/{id}` endpoint, widened the extension's existing passive sniffer
(`chrome.webRequest.onBeforeRequest`, scoped to `aisandbox-pa.googleapis.com/*`) and had a human
manually do **More → Download → 1080p** on a real generated clip in the Flow web UI while watching
the captured traffic. This is the same discovery method as the original 2026-08-07 Omni find —
observe Flow's own frontend, don't guess.

**Real, currently-live contract, captured verbatim:**

- Upscale submit: `POST /v1/video:batchAsyncGenerateVideoUpsampleVideo` — body has
  `mediaGenerationContext: {batchId, audioFailurePreference: "BLOCK_SILENCED_VIDEOS"}` and a
  **flat** `clientContext: {projectId, tool: "PINHOLE", userPaygateTier, sessionId,
  recaptchaContext}` at the top level (not nested under `requests[]` the way the old
  `upscale_video()` method built it — that's the actual bug in the old code: an incomplete
  `clientContext` missing `projectId`/`tool`/`userPaygateTier`). Full `requests`/`media` field
  shape past the recaptcha token wasn't captured (truncated at 400 chars by the sniffer's own
  logging) — `agent/services/flow_client.py:upscale_video()` endpoint path was already correct
  (`ENDPOINTS["upscale_video"]`), only the body needs the same `clientContext` completeness fix
  described above; not yet applied to that method (only the status-poll side below was fixed and
  confirmed).
- **Status poll — this IS fully fixed and confirmed working**: `POST
  /v1/video:batchCheckAsyncVideoGenerationStatus` (same endpoint the old `check_video_status()`
  already pointed `ENDPOINTS["check_video_status"]` at) with body `{"media": [{"name": "<media_id
  or media_id_upsampled>", "projectId": "<project_id>"}]}` — a completely different shape than the
  old `operations`-list body. Live-confirmed: returns `200` with full metadata including
  `mediaMetadata.mediaStatus.mediaGenerationStatus: MEDIA_GENERATION_STATUS_SUCCESSFUL` for both a
  plain r2v generation and its upscale (`<media_id>_upsampled`). New method
  `FlowClient.check_media_status(media_id, project_id)`, exposed as `GET
  /api/flow/media-status/{media_id}?project_id=...`, and wired into
  `agent/sdk/services/operations.py:_poll_workflows()` (replacing the dead `get_media()` call) —
  `_poll_operations`/`_poll_workflows` now take a `project_id` param, threaded through all 6 call
  sites in `OperationService`.
- Upscaled media's resource name is `"<original_media_id>_upsampled"` — not a fresh independent
  UUID. `videoGenerationMode` becomes `VIDEO_GENERATION_MODE_VIDEO_TO_VIDEO` with
  `videoModelName: veo_3_1_upsampler_1080p`/`videoModelCapabilities: ["VIDEO_MODEL_CAPABILITY_UPSCALING"]`.

**The byte-retrieval gap — what's actually proven, and a correction (2026-08-13, second pass).**

CRITICAL CONTEXT found by checking the last known-good run: the `sensodyne-ugc-2026-08-07` test
DID download 1080p **fully programmatically** through flowkit — its `node/scenes/scene1_full.json`
is a 3.49 MB file whose content is a `get_media` response with the entire MP4 inlined as base64 in
`video.encodedVideo` (`AAAAIGZ0eXBpc29t...` = MP4 `ftyp` box). So the OLD byte-retrieval path was a
**plain REST call returning bytes** (`GET /v1/media/{id}` → `video.encodedVideo`), which
`_poll_workflows` decoded to disk — NOT a Service-Worker/UI-only mechanism.

That path is now dead, and this is airtight: the exact media_id downloaded fine on 2026-08-07
(`62cc47cf-5d70-4658-a21e-01731faa12ab`, sensodyne scene 1) returns `400 INVALID_ARGUMENT` on
`get_media` today. Same media, same account, same code — Google changed/retired the endpoint
between 2026-08-07 and 2026-08-13. So §6's "get_media broke" is confirmed to be a real regression
against a path that genuinely used to deliver bytes, not a path that never worked.

**Correction to the earlier "CONFIRMED unreachable via Service Worker" claim (which was too
strong):** What was actually tested exhaustively (3 independent runs, incl. after adding
`https://flow-content.google/*` to `manifest.json` `host_permissions` — note a `webRequest` `urls`
filter is silently a no-op for hosts not also in `host_permissions`) is that **today's Flow-UI
Download button** does not surface any byte-fetch in `chrome.webRequest` — `nativeRequestLog` only
ever shows `aisandbox-pa.googleapis.com` + `labs.google`, never a video-bytes host. That likely
means the *UI's* download reads from a Service-Worker/Cache the extension can't observe. But that
does NOT prove **no replacement REST endpoint exists** — the old `get_media`/`encodedVideo` was a
findable API, and its replacement may also be one; the UI just doesn't route through it in a
webRequest-visible way. Finding it needs a different method than sniffing the UI (e.g. probing
likely successor endpoints directly against `aisandbox-pa`, or inspecting the page's
Service-Worker cache), which was out of scope for this session.

### GAP CLOSED — full automated download found and implemented (2026-08-13, third pass)

The replacement for the retired `get_media`/`encodedVideo` byte path was found by having a human
open the Flow-page **Network tab** (not the extension's `chrome.webRequest` sniffer, which is blind
to it) and use Network **search** (searches response bodies) for `flow-content.google/video` while
clicking Download. The byte GET is `GET https://flow-content.google/video/<name>?Expires&KeyName=labs-flow-prod-cdn-key&Signature`
served **206 from disk cache** (why the sniffer never saw a network request — the `<video>` preview
had already cached it). And the signed URL is minted by a tRPC redirect endpoint:

```
GET https://labs.google/fx/api/trpc/media.getMediaUrlRedirect?name=<media_id>
  → 302 Location: https://flow-content.google/video/<media_id>?Expires=…&KeyName=labs-flow-prod-cdn-key&Signature=…
```

Key facts:
- `<name>` is the **media_id itself** (720p) or `<media_id>_upsampled` (1080p) — the CDN path
  segment equals the flow media id; there is no separate "content id" (earlier confusion).
- The CDN URL is **signature-authed** — the `Signature` query param is the whole auth, no Google
  bearer token needed. So once resolved, any plain HTTP client can fetch the bytes.

**Implemented, fully automated, verified end-to-end 2026-08-13:**
- Extension `background.js`: new `get_media_url` handler — GETs the tRPC redirect with
  `redirect:'follow'`, reads `resp.url` (final CDN URL) without downloading the body. CORS-free
  because both `labs.google` and `flow-content.google` are in `manifest.json` `host_permissions`
  (adding `flow-content.google` there was the actual enabler — a `webRequest`/`fetch` to a host not
  in `host_permissions` is silently blocked/CORS-restricted).
- `FlowClient.get_media_download_url(media_id)` → returns the signed CDN URL.
- `GET /api/flow/media-url/{media_id}` (resolve only) and `POST /api/flow/download-video`
  (`{media_id, save_path, upscaled}`) — the latter resolves the URL then streams the bytes to disk
  via `httpx` (agent-side, no extension needed for the byte transfer since the URL is public).
- Verified: automated 1080p download of a 4s test clip AND both real UGC script sequences
  (10s + 8s) → real `1080×1920 h264+aac` MP4s on disk, **zero manual UI clicks**.

**Full headless pipeline now works:** `generate-video-refs-omni` → `upscale-video` →
`media-status` poll (`check_media_status`) → `download-video`. The only remaining manual step in
the whole flow is the one-time human action of pasting the Network-tab find that revealed
`media.getMediaUrlRedirect` — now that it's known and coded, nothing is manual anymore.

_Superseded note:_ the "download requires a manual UI click / is unreachable via API" conclusion
from the first/second pass above is now WRONG — kept only to show the investigation path. The
byte-download is fully automated as of this pass.

## Graph
[[../skills/fk-omni-video-gen|fk-omni-video-gen (usage doc)]] · [[../skills/fk-doctor|fk-doctor]] · [[../README|flowkit README]] · [[../../../../../DOCS/flowkit-handoff-mutant-big-greens-2026-08-13|2026-08-13 handoff report — original symptom]]
