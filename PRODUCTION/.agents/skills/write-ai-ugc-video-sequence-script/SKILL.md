---
name: write-ai-ugc-video-sequence-script
description: Consume a locked node/shooting-script.md plus its local F5-TTS timing lock, retrieve and score candidate templates from BASE/BRAND KITs/5. Video_Prompt_Template, then write one 4/6/8/10s full-JSON Omni prompt per minimum-count sequence. Each prompt can contain timed sub-scenes, jumpcuts, transitions, and (for AI-clone work) accepted crawler keyframe refs. Part C locks reuse of the TTS audio and optional BGM. content-executive or designer, single pass.
---

# write-ai-ugc-video-sequence-script

Produces `node/ugc-sequence-script.md` — the locked sequence-prompt list `video-editor` renders via
Flowkit Omni. Its sole narrative inputs are the locked `node/shooting-script.md` and its
`node/timing/timing-lock.json`, which provide approved dialogue, measured audio durations, minimum-count
4/6/8/10s sequence boundaries, sub-scene timing, reference needs, and hard constraints.

**This is the raw/authentic sibling of `write-ai-commercial-video-sequence-script`** — same underlying
renderer (Omni `reference_to_video`), same ≤3-refs-per-scene schema, same shared-reference continuity
mechanism — but the opposite register guard (inject UGC/handheld keywords, forbid TVC/commercial) and
a different grounding source (retrieved `posing`/`dancing`/`indie` templates, not a TVC shooting script).

**Two mechanisms borrowed from siblings, combined:**
- **Retrieval + scoring** — from `photography-direction`'s `standalone` mode: retrieve 3-5 candidate
  templates, score each on the same 8-criterion rubric, converge on the highest (template-first, per
  `creative-direction` Method 2/3's corrected template-first-field-substitution approach — never
  synthesize a bespoke scene from scratch when a retrieved template already fits).
- **Reference context + Omni scene schema** — from `write-ai-commercial-video-sequence-script`:
  resolve a fixed reference set (character face, product, setting plate) once, then reuse ≤3 of those
  refs per scene. **Reusing the same refs across every scene is what holds identity/wardrobe/setting
  consistent** — the Omni equivalent of a pinned keyframe chain. There is no first/last-frame morph
  here (that was the retired Veo pipeline); raw UGC content is a natural fit for hard cuts between
  beats, so cross-cut frame-morph continuity is neither available nor needed.

## Inputs

| Param | Source |
|---|---|
| `shooting_script_path` | `node/shooting-script.md` — locked sequence/sub-scene plan, dialogue, references, and hard constraints |
| `timing_lock_path` | `node/timing/timing-lock.json` — required for dialogue-bearing work; local F5-TTS WAV duration evidence and assigned sequence/sub-scene windows |
| `video_prompt_library_root` | `BASE/BRAND KITs/5. Video_Prompt_Template/` — groups `posing/`, `dancing/`, `indie/` (raw/authentic register). **Prune `commercial/`** — that group is TVC-crafted content and would drift the pipeline into the wrong register. |
| `character_ref_dir` | named influencer face-reference folder identified in the shooting script, if any |
| `clone_keyframe_dir` | AI-clone only: accepted `iconic-frames/` directory recorded in the locked shooting script |
| `output_path` | `node/ugc-sequence-script.md` |

## Step A — Preserve the TTS Timing Lock and Minimum Sequence Plan

Use the locked shooting script's sequence boundaries and `node/timing/timing-lock.json` as the source
of truth. Do not re-estimate spoken duration, merge, or delete narrative beats; flag a mismatch for
revision instead.

1. **One sequence = one Omni call.** Its `duration_s` must equal the corresponding locked sequence
   duration and be exactly `4`, `6`, `8`, or `10` seconds. Do not split a valid locked sequence into
   separate calls merely because it contains a jumpcut.
2. If dialogue exists but `timing-lock.json` is missing, invalid, or does not fully fit into the planned
   sequence total, stop and return the work to `write-shooting-script`; never use LLM timing estimates.
3. A sequence may carry multiple timed sub-scenes. Preserve each sub-scene's local time range, dialogue
   window, and transition. The sum of all prompt durations must equal the locked render duration and be
   at least the measured TTS duration.
4. Write a one-line rationale per **sequence** proving it is part of the minimum-count plan and preserves
   the shooting-script timing.
5. **AI-clone keyframe anchor:** If the shooting script identifies clone keyframes, select the accepted
   keyframe nearest each sequence/sub-scene's matching source beat. Each sequence must include at least
   one selected clone keyframe in its refs. Use more only for an internal composition-changing jumpcut,
   while keeping the total Flowkit reference count at `≤3`.

## Step B — Retrieve and score the grounding template(s)

Run once per scene (a multi-scene shooting script may ground different scenes in different templates
if their beats differ; a single-scene shooting script runs this once).

1. **Method 1 — shooting script → UGC direction:** extract subject/persona, mood, setting,
   action, platform, and any hard constraints (`Video Requirement`) — same shape as
   `photography-direction` Method 1, not a message/metaphor brief.
2. **Method 2 — retrieve:** grep `tag` + `image_vibe`/`image_type` + `group` across
   `posing/`/`dancing/`/`indie/` (same retrieval helper as `photography-direction`, path substituted):
   ```bash
   find "BASE/BRAND KITs/5. Video_Prompt_Template" \( -path "*/commercial/*" \) -prune -o -iname "*.json" -print | xargs grep -l "<tag_or_vibe>"
   ```
   Read each match's `prompt.generated_prompt_string`, `prompt.composition_elements`/`main_subject`,
   `prompt.reference_elements`, and `policy_review`. Record `patterns_to_adapt` (framing, pacing,
   dialogue style, setting) and `patterns_not_to_copy` (a template's specific face/identity if the
   shooting script has its own named influencer). Apply `policy_review.changes` precedents proactively.
3. **Method 3 — score → select (template-first):** score every retrieved candidate on the same
   8-criterion rubric `photography-direction` uses (`vibe_authenticity`, `styling_accuracy`,
   `human_realism`, `mood_coherence`, `brand_fit`, `platform_utility`, `rendering_feasibility`,
   `reference_readiness`, each 0-5, total 0-40). Select the highest. **Only diverge a fresh direction**
   (write one from scratch, not sourced from any retrieved template) if every candidate scores below
   **24/40** — log `action: "diverged_no_template_fit"` for traceability, per `creative-direction`'s
   corrected Method 3 fallback rule. Never blend pieces of multiple templates into one bespoke scene
   when a single retrieved template already scores acceptably — reuse its `generated_prompt_string`/
   beat content near-verbatim, substituting only the shooting script's subject/dialogue/setting where they
   conflict with the template's.
4. Record the selection in the output's Production Notes: which template, its score, and the rationale
   (kept vs. diverged).

## Step B.1 — Real-photo garment/product references need reinforced anti-logo negatives

If the shooting script requires a specific real garment/product (e.g. "a dress from Brand X's real Summer
collection") and a real reference photo is sourced (WebSearch/WebFetch of real fashion-press coverage
— never invent brand details from scratch when a real look exists), pass that photo as a reference
image alongside the character refs. This is higher trademark/design-copy sensitivity than a
fully-invented garment — a real photo gives the model much stronger material to copy a protected
logo/hardware detail from than a generic description does. Verified failure mode: a close-up/medium-shot
reference reproduced a brand's interlocking-ring hardware clasp at the neckline almost verbatim from
the reference photo, despite a generic negative term already present. Fix: state explicitly in the
ref's own prompt which specific area must stay plain (e.g. "plain cloth buttons only, no metal
clasp/buckle/interlocking-ring hardware of any kind"), and add the specific hardware shape to the
scene's negative wording (`"interlocking rings", "double circle buckle", "logo hardware ornament"`
etc.) — a generic `"trademarked monogram pattern"` term alone is not reliably enough for a model with
a strong real-photo reference to copy from. Always visually inspect any reference image generated
against a real-brand photo before assigning it to scenes — don't assume the negative wording caught it.

## Step B.2 — Camera framing for dialogue/"experience" beats: medium shot, POV holding phone

When a scene's beat is the shooting script's spoken/dialogue moment AND its concept is an "experience"
format (trying a product, testing a garment, reacting to something) — not every scene, only the one(s)
carrying dialogue — frame it as a **medium shot (waist-up, not full body), mirror-selfie POV with her
own phone visibly held in frame** (back of the phone, camera bump, hand/arm holding it), rather than a
full-body pose shot. This matches how real UGC/try-on-haul content actually frames the "here's what I
think" moment — full-body shots read as generic posing, medium-shot-with-visible-phone reads as
authentically POV/experiential. Non-dialogue reveal/action beats (e.g. the initial full-body mirror
reveal) can stay full-body — this rule applies specifically to the beat where she speaks to camera
about the experience.

## Step C — Part A: resolve the fixed reference context

The reference set is what holds identity/wardrobe/setting consistent across every sequence (the Omni
analog of the retired keyframe chain). Resolve it once, before writing any sequence prompt.

1. **Check the Brand Kit first** for every fixed element via `element-resolver` — the named
   influencer's face (`character_ref_dir` if the shooting script has one), any real product packaging/logo.
   Never invent packaging/logo; if a real product shot is needed and the Brand Kit lacks a clean one,
   log it in `Gaps Open` and flag rather than fabricate (label/trademark accuracy is a hard
   requirement — same rule as the commercial skill).
2. **For anything missing** — a fresh character look not already in a Brand Kit, or a setting/context
   plate the beats need — pick prompt craft via `photography-direction` (mode `reference`) and render
   it via `nano-banana-image-gen` (Flash for raw/candid, **Pro when facial likeness is the priority**).
   These generated plates lock identity/environment across every scene that reuses them.
3. If the shooting script needs a specific real garment/product reference photo, apply Step B.1's reinforced
   anti-logo handling when generating/preparing that ref.
4. Save every resolved/generated ref to `node/elements/` (or `node/refs/` for a fresh context plate
   that isn't an `element-resolver`-tracked asset) and record it in the output's **Part A** section:
   ref name, purpose, which nano-banana model was used and why, file path.

## Step D — Part B: write every sequence's full-JSON Omni prompt

For each locked sequence, in order, write one Omni-schema JSON block grounded in its selected template.
One block is one Omni call, even where the sequence contains several visual sub-scenes:

1. **Assign ≤3 refs** from Part A's set, tagged `ref_context` / `ref_product` / `ref_character`
   (Omni's own reference cap — 2 verified working in one call, see `gemini-omni-video-gen/SKILL.md`
   Step 3). Reuse the **same** character ref (and setting plate, where the beat shares a location)
   across scenes — this is the continuity mechanism.
2. **Translate the timed sequence into the Omni JSON schema** (`scene_description`, `timeline`, `style`,
   `camera_direction`, `lighting`, `voice`, `SFX`, `environment`, `element`, `motion`, `ending`,
   `text`, `keyword`) — grounded in the selected template's own `generated_prompt_string`/`motion`/
   dialogue content (never invented). Keep the template's original raw/candid/authentic tone.
   `timeline` is required: each item gives `start_s`, `end_s`, `visual_action`, `dialogue`, and
   `transition_after`. Use explicit local timing such as `0-4s: action A; 4-8s: jumpcut to action B;
   8-10s: match-cut transition C`. The final `end_s` must equal `duration_s`.
3. **Inject the raw-UGC keyword guard into every scene's `keyword` array** — always carry
   `"UGC"`, `"handheld"`, `"selfie"`, `"authentic"` (plus content-specific tags), and **never**
   `"TVC"`/`"commercial"`/`"cinematic"`/`"premium"`. This is the exact inverse of
   `write-ai-commercial-video-sequence-script`'s guard — it's the single biggest lever keeping the
   render from drifting into the sibling workflow's polished register. Sanity-check that
   `style`/`camera_direction`/`voice` read as raw/handheld/POV, not premium-commercial.
4. **Preserve speech exactly.** `voice` is only the exact approved dialogue assigned to the sequence;
   do not prepend persona, language, accent, pacing, emotion, or delivery notes. Keep full native-language
   diacritics. Put dialogue time ranges in `timeline` and retain the authoritative final audio in the
   F5-TTS timing lock; this prevents prompt-metadata from corrupting the line used for TTS/subtitles.
5. **Keep jumpcuts visual.** Put pacing, facial reaction, handheld movement, and transitions in
   `timeline`, `scene_description`, `camera_direction`, `motion`, and `ending`, never by altering the
   approved dialogue in `voice`.
6. **Script a line (or at least a non-verbal audio cue) for every beat with an active/reactive
   expression, not only the scene's key-message beat.** Verified failure mode (Veo, same TTS-lip
   risk applies to Omni): leaving an earlier beat with no spoken/cued audio produced a silent span
   while her mouth still visibly moved as if speaking. A short reaction line ("Ôi bộ váy này đẹp quá
   đi mất!") for an early beat, or at minimum an explicit gasp/laugh/hum cue in `SFX`, avoids this.
   When a scripted action (e.g. reaching for and raising a phone) needs to read as gradual, say so
   explicitly in `motion` ("takes a clearly visible couple of seconds, not an instant cut").
7. **Follow Omni's real-face RAI rules** (`gemini-omni-video-gen/SKILL.md` RAI section) when a real
   influencer face ref is used: don't literally write "real person photography" (use "photorealistic"),
   don't write identity-fidelity language ("exactly matching the reference"), frame adults
   unambiguously as adults, avoid bathroom settings — relocate the same wet-hair/steam aesthetic to a
   living room/kitchen. These are model-level content filters, not prompt-quality issues.

## Step E — Part C: lock the optional audio/BGM spec

Most raw UGC clips need **no separate BGM layer**. The pre-generated F5-TTS timing-lock audio is
the authoritative dialogue track; retain light generated/location SFX only where it does not obscure
the TTS. Adding an instrumental on top can read as over-produced. Only write a BGM spec (mood, track
path from the local library, mix volume, fade timing) if `Video Requirement` explicitly asks for it.

## Output — `node/ugc-sequence-script.md`

```markdown
# UGC Sequence Script — {{topic}}

## Production Notes
- Sequence prompt count: N = {{n}} — minimum count from `node/timing/timing-lock.json`
- TTS timing lock: `node/timing/timing-lock.json` (measured dialogue: {{measured_dialogue_duration_sec}}s)
- Duration budget: sum of every JSON `duration_s`; only `4`, `6`, `8`, or `10`; must cover TTS duration.
- Aspect ratio (locked across all scenes, `response_format.aspect_ratio`): 9:16 default
- Named influencer / character ref dir, if any:
- `voice` contract: exact approved dialogue only; timing and visual pacing stay in `timeline`.

## Sequence count rationale
| Sequence | Render duration | Narrative beat(s) / internal jumpcuts | Minimum-count rationale |
|---|---|---|

## Template retrieval & scoring
| Sequence | Candidate template | Score (/40) | Selected? | Notes |
|---|---|---|---|---|

## PART A — Reference Context

### REF-A · {{name}} ({{type}})
> {{prompt used, if generated}}
- Purpose:
- nano-banana model / why (Flash vs Pro):
- File: `node/elements/...`

(one entry per resolved/generated ref)

### REF-KF-{{timestamp}} · Clone keyframe (source composition reference)
> Preserves source framing, visual beat, camera movement, and transition intent only. Replace source
brand, product, creator likeness, dialogue, and claims with approved company assets/content.
- File: `{{clone_keyframe_path}}`
- Source timestamp: {{timestamp}}s

## PART B — Sequence Prompts

### Sequence 1
**Ref (n):** `REF-A-...` · `REF-C-...` · `REF-KF-{{timestamp}}`   (≤3 total; AI-clone requires ≥1 `REF-KF`)
```json
{
  "scene": 1,
  "duration_s": 8,
  "scene_description": "",
  "reference_keyframes": [{"ref_id": "REF-KF-{{timestamp}}", "source_timestamp_s": 0, "purpose": "composition and pacing anchor"}],
  "timeline": [
    {
      "start_s": 0,
      "end_s": 4,
      "visual_action": "",
      "dialogue": "",
      "transition_after": "hard jumpcut to the next sub-scene"
    },
    {
      "start_s": 4,
      "end_s": 8,
      "visual_action": "",
      "dialogue": "",
      "transition_after": "hold for ending"
    }
  ],
  "style": "raw handheld UGC, natural",
  "camera_direction": "",
  "lighting": "",
  "voice": "",
  "SFX": "",
  "environment": "",
  "element": [{"element_name_1": "", "prop_name_1": ""}],
  "motion": "",
  "ending": "",
  "text": "",
  "keyword": ["UGC", "handheld", "selfie", "authentic"]
}
```

(one `### Sequence N` block per Omni call, same fenced-JSON shape — `video-editor` parses each block,
validates the full `timeline`, and sends the complete JSON object to Omni)

## PART C — Audio
- BGM needed: yes/no (per Video Requirement)
- If yes: mood / track path / mix volume / fade timing

## Bảng gán REF (≤3/scene)
| Sequence | Nội dung | Ref context | Ref sản phẩm | Ref nhân vật | Ref keyframe clone |
|---|---|---|---|---|

## Revision Log
- round 1: initial, by designer

## Gaps Open
```

## Do / Don't

- DO use `node/timing/timing-lock.json` as the timing authority for dialogue; never use a word-count
  estimate as a substitute.
- DO produce the fewest sequence prompts that fully cover the measured TTS duration and the locked
  narrative plan.
- DO set `duration_s` in every Part B JSON block to exactly one of `4`, `6`, `8`, or `10`, and ensure
  its `timeline` ends exactly at that value.
- DO use a sequence's `timeline` for multiple sub-scenes, jumpcuts, and transitions within its one Omni prompt.
- DO reuse the same character/setting ref across every scene — that shared-reference reuse is what
  holds identity consistent, now that there is no first/last-frame keyframe morph.
- DO copy exact approved dialogue into both the relevant `timeline[].dialogue` and `voice`; keep
  voice metadata, accent notes, and pacing directions out of `voice`.
- DO inject `"UGC"`/`"handheld"`/`"selfie"`/`"authentic"` keywords and **forbid**
  `"TVC"`/`"commercial"`/`"cinematic"`/`"premium"` in every scene — the inverse of the commercial
  skill's guard, and the biggest lever keeping this pipeline in the raw register.
- DO prune the `commercial/` group from retrieval — that group's content is TVC-crafted, the sibling
  `ai-commercial-short-video` workflow's territory.
- DO score template-first and only diverge below the 24/40 threshold — never blend fragments of
  several templates into one bespoke scene when a single retrieved template already fits.
- DO cap every scene at ≤3 refs — Omni's reference ceiling (see `gemini-omni-video-gen/SKILL.md`).
- DO include at least one accepted `REF-KF-*` source keyframe in every AI-clone sequence and map it to
  the matching Flowkit `reference_media_ids`; use it only for composition/pacing, never source identity,
  branding, dialogue, product claims, or logo reproduction.
- DON'T write a first_frame/last_frame keyframe pair or any Veo morph — that pipeline is retired for
  this visual type; Omni composites each scene around reused reference images instead.
- DON'T reopen upstream brief sources; consume the locked `node/shooting-script.md` as the sole narrative
  input so scene order, timing, dialogue, and constraints remain locked.
- DON'T invent scene content the selected template doesn't describe — substitute only the shooting script's
  subject/dialogue/setting where they conflict with the template.
- DON'T trust a generic negative term alone to block logo/hardware replication when a real brand photo
  is used as a reference — name the specific hardware shape explicitly (Step B.1) and visually inspect
  the rendered reference before assigning it.
- DON'T frame every scene full-body — reserve medium-shot/POV-phone-visible framing (Step B.2)
  specifically for whichever scene carries spoken dialogue in an "experience"-format script.
- DON'T add a voice/persona/accent/delivery clause to `voice`, rewrite dialogue, or use `voice` as a
  visual-realism field; that information belongs in the timing lock or visual fields.
- DON'T omit clone keyframe refs from an AI-clone sequence or exceed the three-reference Omni limit to
  compensate for multiple source frames; choose the closest anchor(s) for the locked sub-scenes.

## Graph

**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Retrieval/scoring mechanism borrowed from:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/photography-direction/SKILL|photography-direction]]
**Ref-context + Omni scene schema borrowed from (TVC sibling):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-ai-commercial-video-sequence-script/SKILL|write-ai-commercial-video-sequence-script]]
**Scene-count / no-fixed-count principle from:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-ai-timelapse-video-sequence-script/SKILL|write-ai-timelapse-video-sequence-script]]
**Renderer (how to call Omni `reference_to_video`):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/gemini-omni-video-gen/SKILL|gemini-omni-video-gen]]
**Ref resolution:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/element-resolver/SKILL|element-resolver]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen]]
**Prompt library:** `BASE/BRAND KITs/5. Video_Prompt_Template/`
**Consumers:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/content-executive|content-executive]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/designer|designer]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/video-editor|video-editor]]
**Workflow:** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/[social]_[ai-ugc-short-video]|ai-ugc-short-video workflow]]
