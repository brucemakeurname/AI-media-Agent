# UGC Sequence Script — Mutant Big Greens Smoothie (Banana & Chestnut) — REDO (corrected source)

## Structural Fidelity Contract (hard constraints, inherited from `node/shooting-script.md`)
- `subject_visibility: hands-only` — no face/head in any scene. Every scene below is explicitly written hands-only.
- `audio_mode: voiceover narration` — VO over B-roll only, no on-camera lip-synced dialogue.
- `background_continuity: single location` — one kitchen counter set across all 4 sequences.
- Any relevant recommendation applied below preserves this contract; no scene introduces a face, a second location, or lip-synced dialogue.

## Production Notes
- Workflow: `ai-clone-short-video` (redo — see `node/shooting-script.md` Correction Context for root-cause of the 2026-08-13 fabricated-source pass this supersedes)
- Sequence prompt count: N = 4 — matches `node/shooting-script.md`'s 4-sequence plan (one per source message-stack beat; see that file's Production Notes for the minimal-count-vs-narrative-fidelity rationale)
- TTS timing lock: `node/timing/timing-lock.json` (measured dialogue: 27.90s; real Applio TTS+VC measurement redone this pass)
- Duration budget: 8s + 8s + 6s + 8s = 30s (covers the 27.90s measured dialogue)
- Aspect ratio (locked across all scenes, `response_format.aspect_ratio`): 9:16 (`VIDEO_ASPECT_RATIO_PORTRAIT`)
- Named influencer / character ref dir: **none — hands-only demo, no character/face reference used or needed**
- `voice` contract: exact approved dialogue only per sequence; timing/visual pacing stay in `timeline`.

## Sequence count rationale
| Sequence | Render duration | Narrative beat(s) / internal jumpcuts | Minimum-count rationale |
|---|---|---|---|
| Sequence 1 | 8s | Hook / claim stat (Line 1, full) + 0.32s hold | Covers Line 1 (7.68s) intact within the smallest bucket ≥ its duration; matches source Sequence 1's hook-claim beat. |
| Sequence 2 | 8s | Product reveal / prep, daily-use framing (Line 2, full) + 0.46s hold | Covers Line 2 (7.54s) intact; matches source Sequence 2's product-reveal beat. |
| Sequence 3 | 6s | Pour / taste proof (Line 3, full) + 0.32s hold | Covers Line 3 (5.68s) intact in the smallest sufficient bucket; matches source Sequence 3's pour/taste beat. |
| Sequence 4 | 8s | Bonus benefit + CTA (Line 4, full) + 1.00s hold | Covers Line 4 (7.00s) intact; matches source Sequence 4's bonus-benefit+CTA beat. |

## Template retrieval & scoring
Retrieval pruned `commercial/` per this skill's Method (TVC register, wrong register for raw UGC). Grepped
`posing/`, `ugc/`, `indie/`, `dancing/` for `kitchen|product demo|drink|smoothie|scoop|hand-only|hands-only|no face|top-down|overhead`.
No candidate in the library depicts a hands-only, no-face, product-demo scene — the two closest hits
both center an on-camera presenter, which directly conflicts with this ticket's hard `subject_visibility:
hands-only` constraint from the Structural Fidelity Contract.

| Sequence | Candidate template | Score (/40) | Selected? | Notes |
|---|---|---|---|---|
| All 4 | `ugc/passionate-beauty-streamer-recommends-product.json` | 17/40 (vibe_authenticity 2, styling_accuracy 1, human_realism 3, mood_coherence 3, brand_fit 2, platform_utility 3, rendering_feasibility 2, reference_readiness 1) | No | Closest craft match for product-close-up hand gestures/motion language (`patterns_to_adapt`: alternating medium/close-up product framing, natural hand rotation of product), but its core mechanic is an on-camera presenter's face and voice-to-camera delivery (`patterns_not_to_copy`: presenter identity/face, on-camera delivery) — directly conflicts with hands-only/VO-only constraint. |
| All 4 | `ugc/hardcore-takeaway-milk-tea-girl.json` | 8/40 (vibe_authenticity 2, styling_accuracy 0, human_realism 2, mood_coherence 1, brand_fit 1, platform_utility 1, rendering_feasibility 1, reference_readiness 0) | No | Two-character on-camera comedy sketch; no product-demo/hands-only relevance beyond a generic "hand over drink" beat. |

Both candidates score below the 24/40 template-first threshold. **Action: `diverged_no_template_fit`.**
Wrote a bespoke hands-only direction grounded directly in the corrected crawler reference
(`Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669.md`) and its accepted keyframes,
adapting only the closest template's generic craft (close-up product framing, natural hand motion, no
zoom/pan/rotation stacking) while discarding its presenter-face mechanic entirely.

## PART A — Reference Context

### REF-A · Hand/forearm — product handler (character, hands-only)
- Description: A single hand/forearm (neutral skin tone, no visible tattoos/jewelry/sleeve branding) — the only "character" element in this clone. **No face, no head, ever.** Used to hold, scoop, pour, and present product across all 4 sequences for identity continuity.
- Status: **not yet resolved** — no existing Brand Kit hand-only reference plate found. Flagged in Gaps Open for designer to generate via `photography-direction` (mode `reference`) + `nano-banana-image-gen`, framed explicitly hands-only/no-face per this contract, before Flowkit registration.
- File: n/a (designer to generate and save to `node/elements/`)

### REF-B · Mutant Big Greens tub (product)
- Description: Mutant Big Greens tub, green label, brand logo clearly legible — real Brand Kit asset, no fabricated packaging.
- Purpose: Product identity anchor across Sequences 2 and 4 (powder scoop, tub-in-frame CTA beat).
- File: `BASE/BRAND KITs/UltimateSup/Product/Mutant_big_green.jpg`

### REF-C · Kitchen counter set (environment)
- Description: Single-location kitchen counter matching the corrected source's composition — dark stone counter, cream cabinets, copper/tin-tile backsplash, wood cutting board — the one consistent set for all 4 sequences.
- Status: **not yet resolved** — no existing Brand Kit plate of this exact set found. Flagged in Gaps Open for designer to generate via `photography-direction`/`nano-banana-image-gen` (Flash, raw/candid register) before Flowkit registration; must be reused identically across all 4 sequences for `background_continuity: single location`.
- File: n/a (designer to generate and save to `node/refs/`)

### REF-KF-candidate_01 · Clone keyframe (source composition reference — Sequence 1)
> Preserves source hand-holds-finished-drink framing/composition only. Replace source product (Bloom Clear Protein pink drink) with Mutant Big Greens green smoothie; no face, no location change.
- File: `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669-keyframes/candidate_01.jpg`
- Source timestamp: ~0–2.5s (source Sequence 1)

### REF-KF-candidate_03 · Clone keyframe (source composition reference — Sequence 2)
> Preserves source scoop-from-pouch-beside-empty-tumbler framing/composition only. Replace source powder/pouch with Mutant Big Greens tub; add banana/chestnut prep visible on the board.
- File: `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669-keyframes/candidate_03.jpg`
- Source timestamp: ~5.0–7.5s (source Sequence 2)

### REF-KF-candidate_05 · Clone keyframe (source composition reference — Sequence 3)
> Preserves source pour-from-tumbler-into-glass-with-fruit framing/composition only. Replace source strawberry slices with banana slices; no face, no location change.
- File: `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669-keyframes/candidate_05.jpg`
- Source timestamp: ~13.0–15.5s (source Sequence 3)

### REF-KF-candidate_07 · Clone keyframe (source composition reference — Sequence 4)
> Preserves source hold-glass-with-pouch-visible-in-frame framing/composition only. Replace source pink drink/pouch with green smoothie/Mutant tub; no face, no location change.
- File: `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669-keyframes/candidate_07.jpg`
- Source timestamp: ~19.0–21.5s (source Sequence 4)

## PART B — Sequence Prompts

### Sequence 1
**Ref (3):** `REF-C-kitchen-counter` · `REF-B-mutant-big-greens-tub` · `REF-KF-candidate_01`
```json
{
  "scene": 1,
  "duration_s": 8,
  "scene_description": "Hands-only UGC B-roll: a hand holds a filled green-smoothie tumbler on a dark stone kitchen counter, voiceover narration only, no face, no on-camera talking creator, single consistent kitchen location.",
  "reference_keyframes": [{"ref_id": "REF-KF-candidate_01", "source_timestamp_s": 1.0, "purpose": "composition and pacing anchor for the opening hand-holds-drink shot"}],
  "timeline": [
    {
      "start_s": 0,
      "end_s": 7.68,
      "visual_action": "A hand and forearm only (no face, no head in frame) hold a tall green smoothie tumbler with visible condensation, straw in place, and gently rotate it toward camera on the kitchen counter. Fingers grip naturally, thumb resting on the tumbler's ridge.",
      "dialogue": "This is Mutant Big Greens, real greens goodness with no added sugar, blended into a smoothie you will actually want to drink.",
      "transition_after": "hold on tumbler, no cut yet"
    },
    {
      "start_s": 7.68,
      "end_s": 8,
      "visual_action": "Brief static hold on the same tumbler, hand steady, no new action, VO trails off into silence.",
      "dialogue": "",
      "transition_after": "hard cut to Sequence 2's ingredient-prep counter"
    }
  ],
  "style": "raw handheld UGC, natural, hands-only product B-roll, no face ever in frame",
  "camera_direction": "Static-to-subtle-handheld phone framing, close-up on hand and tumbler, camera never tilts up toward a face because there is no face in this shot.",
  "lighting": "Natural window light on the kitchen counter, slightly imperfect, warm and lived-in, not studio-polished.",
  "voice": "This is Mutant Big Greens, real greens goodness with no added sugar, blended into a smoothie you will actually want to drink.",
  "SFX": "Soft ambient kitchen room tone, faint ice/glass clink as the tumbler rotates.",
  "environment": "Single kitchen counter set — dark stone counter, cream cabinets, copper/tin-tile backsplash, wood cutting board visible in background.",
  "element": [{"element_name_1": "green smoothie tumbler with straw", "prop_name_1": "condensation droplets on glass"}],
  "motion": "Hand rotates tumbler slightly, thumb adjusts grip, natural micro-movement — no camera zoom/pan/rotation stacking.",
  "ending": "Hold on tumbler before hard cut.",
  "text": "Mutant Big Greens Smoothie",
  "keyword": ["UGC", "handheld", "hands-only", "no face", "authentic", "voiceover", "product B-roll", "single location"]
}
```

### Sequence 2
**Ref (3):** `REF-C-kitchen-counter` · `REF-B-mutant-big-greens-tub` · `REF-KF-candidate_03`
```json
{
  "scene": 2,
  "duration_s": 8,
  "scene_description": "Hands-only UGC B-roll: a hand scoops Mutant Big Greens powder into a blender jar beside fresh banana and chestnut prep, same kitchen counter, voiceover narration only, no face.",
  "reference_keyframes": [{"ref_id": "REF-KF-candidate_03", "source_timestamp_s": 6.0, "purpose": "composition and pacing anchor for the scoop-into-jar beat"}],
  "timeline": [
    {
      "start_s": 0,
      "end_s": 7.54,
      "visual_action": "A hand (no face, no head) tips a scoop of green powder from an open Mutant Big Greens tub into an empty blender jar, then reaches to place a fresh banana slice and a chestnut piece beside it on the wood cutting board. Fingers visibly grip the scoop handle and the banana slice.",
      "dialogue": "It has become my everyday scoop, greens, banana, and chestnut, all in one glass before I am even out the door.",
      "transition_after": "hold on jar, no cut yet"
    },
    {
      "start_s": 7.54,
      "end_s": 8,
      "visual_action": "Hand rests briefly on the jar lid, static hold, no new action, VO trails off.",
      "dialogue": "",
      "transition_after": "jumpcut to Sequence 3's pour"
    }
  ],
  "style": "raw handheld UGC, natural, hands-only product B-roll, no face ever in frame",
  "camera_direction": "Close-up angled POV shot looking down at the kitchen counter, hand and jar in frame, no camera movement toward a face.",
  "lighting": "Natural window light, slightly imperfect, warm and lived-in.",
  "voice": "It has become my everyday scoop, greens, banana, and chestnut, all in one glass before I am even out the door.",
  "SFX": "Powder-scoop rustle, soft counter taps as banana/chestnut are placed down.",
  "environment": "Single kitchen counter set — same dark stone counter, cream cabinets, copper/tin-tile backsplash, wood cutting board as Sequence 1.",
  "element": [{"element_name_1": "Mutant Big Greens tub (open lid)", "prop_name_1": "banana slice and chestnut piece on cutting board"}],
  "motion": "Scoop tips powder into jar, hand reaches for banana slice, natural sequential hand action — no zoom/pan/rotation stacking.",
  "ending": "Hold on jar lid before jumpcut.",
  "text": "Banana & Chestnut Recipe",
  "keyword": ["UGC", "handheld", "hands-only", "no face", "authentic", "voiceover", "product B-roll", "single location"]
}
```

### Sequence 3
**Ref (3):** `REF-C-kitchen-counter` · `REF-B-mutant-big-greens-tub` · `REF-KF-candidate_05`
```json
{
  "scene": 3,
  "duration_s": 6,
  "scene_description": "Hands-only UGC B-roll: a hand pours the blended green smoothie into a clear glass with banana slices, same kitchen counter, voiceover narration only, no face.",
  "reference_keyframes": [{"ref_id": "REF-KF-candidate_05", "source_timestamp_s": 14.0, "purpose": "composition and pacing anchor for the pour beat"}],
  "timeline": [
    {
      "start_s": 0,
      "end_s": 5.68,
      "visual_action": "A hand (no face, no head) tilts the blender jar and pours smooth green liquid in a steady stream into a clear glass, banana slices already floating inside. Pouring hand stays steady, wrist angled naturally.",
      "dialogue": "And it is smooth, not grassy, tastes more like a banana treat than a greens supplement.",
      "transition_after": "hold on glass, no cut yet"
    },
    {
      "start_s": 5.68,
      "end_s": 6,
      "visual_action": "Pour completes, glass sits full on the counter, static hold, VO trails off.",
      "dialogue": "",
      "transition_after": "hard cut to Sequence 4's finished-glass beat"
    }
  ],
  "style": "raw handheld UGC, natural, hands-only product B-roll, no face ever in frame",
  "camera_direction": "Steady handheld close-up shot focused on the pouring action, no camera movement toward a face.",
  "lighting": "Natural window light, slightly imperfect, warm and lived-in.",
  "voice": "And it is smooth, not grassy, tastes more like a banana treat than a greens supplement.",
  "SFX": "Pouring liquid sound, soft splash as it settles in the glass.",
  "environment": "Single kitchen counter set — same dark stone counter, cream cabinets, copper/tin-tile backsplash, wood cutting board as Sequences 1-2.",
  "element": [{"element_name_1": "clear glass with banana slices", "prop_name_1": "blender jar mid-pour"}],
  "motion": "Steady pour stream, wrist angle holds constant, natural micro-shake only — no zoom/pan/rotation stacking.",
  "ending": "Hold on full glass before hard cut.",
  "text": "Smooth, Not Grassy",
  "keyword": ["UGC", "handheld", "hands-only", "no face", "authentic", "voiceover", "product B-roll", "single location"]
}
```

### Sequence 4
**Ref (3):** `REF-C-kitchen-counter` · `REF-B-mutant-big-greens-tub` · `REF-KF-candidate_07`
```json
{
  "scene": 4,
  "duration_s": 8,
  "scene_description": "Hands-only UGC B-roll: a hand holds the finished glass up with the Mutant Big Greens tub visible on the counter, same kitchen counter, voiceover narration only, no face, closes on CTA.",
  "reference_keyframes": [{"ref_id": "REF-KF-candidate_07", "source_timestamp_s": 20.0, "purpose": "composition and pacing anchor for the hold-glass-with-product-visible CTA beat"}],
  "timeline": [
    {
      "start_s": 0,
      "end_s": 7.0,
      "visual_action": "A hand (no face, no head) lifts the finished green smoothie glass slightly toward camera, then rests it back down beside the Mutant Big Greens tub, both clearly in frame on the counter.",
      "dialogue": "Bonus, it supports my everyday nutrition on busy training days, grab your tub now at Ultimate Sup Singapore.",
      "transition_after": "hold on glass and tub, no cut yet"
    },
    {
      "start_s": 7.0,
      "end_s": 8,
      "visual_action": "Static hold on glass and tub together, no new action, final frame of the video.",
      "dialogue": "",
      "transition_after": "end of video"
    }
  ],
  "style": "raw handheld UGC, natural, hands-only product B-roll, no face ever in frame",
  "camera_direction": "Medium close-up handheld framing on hand, glass, and tub, no camera movement toward a face.",
  "lighting": "Natural window light, slightly imperfect, warm and lived-in.",
  "voice": "Bonus, it supports my everyday nutrition on busy training days, grab your tub now at Ultimate Sup Singapore.",
  "SFX": "Soft ambient kitchen room tone.",
  "environment": "Single kitchen counter set — same dark stone counter, cream cabinets, copper/tin-tile backsplash, wood cutting board as Sequences 1-3.",
  "element": [{"element_name_1": "finished green smoothie glass", "prop_name_1": "Mutant Big Greens tub on counter"}],
  "motion": "Hand lifts glass slightly, rests back down beside tub, natural single gesture — no zoom/pan/rotation stacking.",
  "ending": "Hold on glass and tub together for the final frame.",
  "text": "Get Yours @ Ultimate Sup SG",
  "keyword": ["UGC", "handheld", "hands-only", "no face", "authentic", "voiceover", "product B-roll", "single location"]
}
```

## PART C — Audio
- BGM needed: **no** — `Video-requirement` in `Ticket.md` is "None specified"; per this skill's Method E, raw hands-only VO B-roll needs no separate instrumental layer, and the source itself carries no persistent music bed.
- Spoken voice: Applio `voice_1_male` (trained Singapore male brand voice, TTS + RVC), timing-locked via `node/timing/timing-lock.json` (real measured durations: line_01 7.68s, line_02 7.54s, line_03 5.68s, line_04 7.00s — total 27.90s). This is the authoritative narration track; each Omni scene's own generated VO audio gets Applio Voice Sync (Mode 2) applied per scene at render time (video-editor step), not a splice of these pre-production WAVs.
- Location SFX only (soft kitchen room tone, glass clink, powder rustle, pour sound) as specified per scene above — kept low enough to never obscure the VO.

## Bảng gán REF (≤3/scene)
| Sequence | Nội dung | Ref context | Ref sản phẩm | Ref nhân vật | Ref keyframe clone |
|---|---|---|---|---|---|
| Sequence 1 | Hook / claim stat — hand holds finished drink | REF-C | REF-B | REF-A (hand-only) | REF-KF-candidate_01 |
| Sequence 2 | Product reveal / prep — scoop + banana/chestnut | REF-C | REF-B | REF-A (hand-only) | REF-KF-candidate_03 |
| Sequence 3 | Pour / taste proof | REF-C | REF-B | REF-A (hand-only) | REF-KF-candidate_05 |
| Sequence 4 | Bonus benefit + CTA — hold glass + tub | REF-C | REF-B | REF-A (hand-only) | REF-KF-candidate_07 |

## Revision Log
- round 1 (2026-08-13, superseded): fabricated on-camera-creator draft built on a fabricated source description — INVALID, do not reuse; superseded and root-caused in the corrected crawler reference.
- round 2 (2026-08-14): full redo by content-executive against the corrected, grounded source reference (`Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669.md`, corrected 2026-08-14). Real Applio TTS+VC timing lock regenerated (27.90s measured). All 4 sequences rewritten hands-only/VO-only/single-location per the Structural Fidelity Contract. Template retrieval run against `posing/ugc/indie/dancing`; both closest candidates scored below the 24/40 threshold (17/40 and 8/40) due to conflicting on-camera-presenter mechanics, so this sequence script diverges from any single template (`action: diverged_no_template_fit`) and is grounded directly in the corrected crawler reference's own hands-only shot list instead.

## Gaps Open
- **REF-A (hand/forearm reference plate)** — not yet generated. Designer must resolve via `photography-direction` (mode `reference`) + `nano-banana-image-gen`, explicitly hands-only/no-face, before Flowkit registration (`fk-create-project`/`fk-gen-refs`).
- **REF-C (kitchen counter environment plate)** — not yet generated. Designer must resolve via `photography-direction`/`nano-banana-image-gen` (Flash, raw/candid register), matching the corrected source's dark-stone-counter/cream-cabinet/copper-tile-backsplash/wood-cutting-board composition, and reuse it identically across all 4 sequences for single-location continuity.
- No content/claim/structural gaps — Structural Fidelity self-check below passed at 9/10, no `REVIEW REQUIRED` needed.

## Realism Diagnosis (7T Framework Check — adapted for hands-only/VO content)
- **Thật người (real person):** Hand/forearm only — natural skin texture, slight asymmetry in grip, no face present by design (satisfies the hard hands-only constraint, not a realism gap). (Pass)
- **Thật việc (real action):** One concrete action per scene — hold/rotate tumbler, scoop powder + place banana/chestnut, pour into glass, lift glass beside tub. Each clip stays to a single action, per the "keep each scene simple" rule. (Pass)
- **Thật tay (real hands):** Every claim beat has an assigned hand action per the skill's Hands Rule — product intro → hold/rotate; product reveal → scoop/place; proof/demo → pour; result/CTA → lift and rest beside tub. (Pass)
- **Thật mặt (real face):** N/A by design — no face is ever in frame anywhere in this script, matching the source's `subject_visibility: hands-only` hard constraint exactly. (Intentionally absent, not a gap.)
- **Thật giọng (real voice):** VO carries natural claim-stack cadence (short declarative clauses, comma pauses matching the source's rhythm); Applio-measured real durations (not LLM-estimated) lock the pacing. (Pass)
- **Thật cảnh (lived-in background):** Same lived-in kitchen counter across all 4 scenes — stone counter, cream cabinets, copper-tile backsplash, wood cutting board, matching the source's single-location continuity; no studio-perfect or cinematic wording used. (Pass)
- **Thật máy (real camera):** One camera behavior per scene — static-to-subtle-handheld close-up (Seq 1), close-up angled POV (Seq 2), steady handheld close-up (Seq 3), medium close-up handheld (Seq 4). No zoom+pan+rotation stacking in any scene. (Pass)
- **Negative prompt (applied to every scene via `keyword`/style guard):** distorted hands, extra fingers, warped product label, stiff/frozen hand posture, studio-perfect lighting, cinematic/commercial look, glossy ad style, any face or head in frame, any second location.
- **Score:** 7/7 applicable criteria pass (face criterion is N/A-by-design, not scored as a failure).

## Structural Fidelity Self-Check (against corrected source)
| Criterion | Source | This script | Match |
|---|---|---|---|
| Shot count / sequence count | 4 sequences | 4 sequences | Match |
| Subject visibility | Hands-only, no face | Hands-only, no face in all 4 scenes | Match |
| Audio mode | Voiceover narration | Voiceover narration only, no lip-sync | Match |
| Location count | Single kitchen location | Single kitchen location across all 4 scenes | Match |
| Cut rhythm | Hard cuts between beats, VO continuous over B-roll | Hard cuts between the 4 sequences, VO carried per-scene | Match |
| Message-stack arc | Claim stat → daily-use/product name → taste proof → bonus benefit + CTA | Claim stat → daily-use/product name → taste proof → bonus benefit + CTA | Match |
| Brand/product/wording | Bloom Clear Protein, Strawberry Watermelon, scarcity CTA | Mutant Big Greens, banana & chestnut, direct CTA (scarcity dropped per brand voice guideline) | Intentional approved substitution |
**Estimated score: 9/10** — the one point held back is the CTA register (scarcity language deliberately not carried over, since Ultimate Sup's brand voice guideline explicitly forbids manufactured urgency/scarcity; this is a brand-safety-driven wording substitution, not a structural-fidelity failure, and is within this ticket's explicitly permitted "exact wording" change). No unresolved conflict — **no `REVIEW REQUIRED` needed.**
