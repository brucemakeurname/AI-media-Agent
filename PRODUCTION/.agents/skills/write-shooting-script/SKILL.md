---
name: write-shooting-script
description: Convert Ticket.md's simple visual script, optional voice script, and video requirement into node/shooting-script.md — a standard shooting script with TTS-measured timing, minimum 4/6/8/10s Omni sequence packing, and timed sub-scenes/jumpcuts per sequence. Content-executive only, single pass + gap-answer revisions.
---

# write-shooting-script

Turns the ticket's raw visual and optional voice fields into a standard shooting script — the missing step
between "what the ad should say" (`Visual-concept-Script`) and "what each Omni render call needs"
(`node/ugc-sequence-script.md` or `node/commercial-sequence-script.md`, written by the selected sequence skill). That skill no
longer reads `Ticket.md` directly for creative content — it reads this file instead.

## Inputs

| Param | Source |
|---|---|
| `ticket_path` | `Ticket.md` — visual concept/script, optional spoken `Voice Over`/dialogue script, `Voice` persona, and `Video-requirement` |
| `target_duration_sec` | from `Video-requirement` if stated; otherwise derive from measured TTS duration rounded up by minimal permitted sequence packing |
| `timing_audio_dir` | `node/timing/` — per-line Applio TTS WAVs and `timing-lock.json` created before sequence division when dialogue exists |
| `output_path` | `node/shooting-script.md` |
| `revision_notes` | (revision pass only) answered gaps from `node/gap-request.md` |

## Method 1 — Extract the narrative arc

Read `Visual-concept-Script` end to end before splitting anything. Identify: central message,
biz_niche/industry, target audience, TVC arc beats present (hook → problem/symptom → turning
point → mechanism/proof → payoff → reinforcement → CTA — not all briefs need all 7), the
character(s) if any, product, and any hard constraints from `Video-requirement` (packaging
accuracy, forbidden claims, required setting, subtitle need, aspect ratio).

Extract spoken dialogue independently from the visual script. `Voice` may only name the requested
persona (for example `voice_1_male`); it is not dialogue. Use a dedicated `Voice Over`/`Dialogue` body
section when present. If no spoken script exists, mark the ticket `no-dialogue` and do not invent VO.

## Method 2 — Format-aware creative translation (interim: Claude's own knowledge, not a library)

Unlike `creative-direction`/`photography-direction`, there is no curated shooting-script reference library on
disk yet (nothing under `BASE/BRAND KITs/2a. Video_Prompt_Template/` mirrors
`1. Creative_Prompt_Template/`'s retrieval-by-metadata pattern — that folder currently holds only
worked examples, not a tagged library). Until one exists, translate each arc beat into concrete
format-appropriate craft — UGC phone actions or commercial shot grammar, transitions, SFX/music cues,
and pacing norms — using Claude's own built-in knowledge for the ticket's
`biz_niche` (F&B, FMCG, pharma/agri-vet, beauty, tech, etc.), the same way a human creative
director draws on genre familiarity rather than a mood board. **State this explicitly in the
  output's Production Notes** so a future pass can swap this method for real retrieval once
`2a. Video_Prompt_Template/` grows a tagged library (mirroring `creative-direction` Method 2).

## Method 3 — Pre-generation TTS Timing Lock & Minimal Sequence Packing

Do not estimate speaking duration by LLM character count alone — that introduces timeline drift. Run real TTS voice synthesis (Applio or voxcpm) first to measure exact audio duration per dialogue line before locking sequence boundaries.

1. **Generate TTS Audio Lock:**
   Synthesize narration audio for every dialogue line using `applio-brand-voice` (or voxcpm engine),
   using the ticket's requested voice/persona. Measure exact audio clip durations with
   `ffprobe -show_entries format=duration -of default=noprint_wrappers=1:nokey=1`. Write one
   `node/timing/timing-lock.json` containing each line, source text, WAV path, exact duration, and
   cumulative in/out timestamps. If the ticket has no dialogue, write `no-dialogue` in the lock and
   use the explicit video duration requirement instead.
2. **Minimal Sequence Constraint:**
   Let `required_duration = max(measured_dialogue_duration, explicit_video_duration)` when both are
   present. Choose the smallest number of sequence durations from `{4, 6, 8, 10}` whose sum covers
   `required_duration`; among equal-count plans, choose the smallest overage and preserve narrative
   boundaries. Never shorten the measured audio to fit.
3. **Sub-scene and Jumpcut Mapping:**
   A single sequence (which becomes one Omni prompt block) can contain multiple visual scenes/jumpcuts and transitions. Map sub-clips using explicit timestamp ranges inside the sequence description (e.g. `0-3s: action A. 3-6s: action B. 6-8s: transition C`).
4. Every sequence gets an explicit cumulative `timestamp` (start–end) matching its duration step (4/6/8/10s).

## Output — `node/shooting-script.md`

Standard shooting-script structure (Sequence → timed sub-scene → shot detail). A **sequence is one
Omni render call/prompt**; a sequence can contain multiple sub-scenes and internal jumpcuts/transitions.
The fields below lock duration for the renderer, references for the designer, and continuity for Part A
of the sequence script:

```markdown
# Shooting Script — {{topic}}

## Production Notes
- Biz niche / industry:
- Voice timing lock: `node/timing/timing-lock.json` | no-dialogue (state which)
- Measured dialogue duration: {{measured_dialogue_duration_sec}}s
- Sequence duration plan: {{sequence_duration_list}} (only 4s / 6s / 8s / 10s; minimum sequence count)
- Target/render duration: {{target_duration_sec}}s (running total: Xs; must be >= measured dialogue duration)
- Voice/persona: {{voice_brief}}
- Video requirement (hard constraints): {{video_requirement}}
- Continuity decision: single wardrobe throughout | per-scene wardrobe change (state which, and why)
- Creative-translation method: format-aware built-in craft knowledge (no curated library yet — see SKILL.md Method 2)

## Sequence 1 — {{beat name}} ({{start}}–{{end}}, {{duration_sec}}s)
- Omni duration: {{duration_sec}}s
- Dialogue window(s): {{voice_timing_ranges}}

### Sub-scene 1.1 — {{start}}–{{end}}
- Visual:
- Action/Activity:
- Dialogue/VO:
- SFX:
- Music/mood cue:
- Motion/VFX:
- On-screen text:
- Ending/transition:
- Reference needs: character (yes/no) · environment (yes/no) · product (yes/no) · source footage (yes/no)

### Sub-scene 1.2 — {{start}}–{{end}} (optional jumpcut/transition inside this same Omni prompt)
- Visual:
- Action/Activity:
- Dialogue/VO:
- Transition from previous sub-scene:

## Sequence 2 — {{beat name}} (...)
...

## Continuity & Wardrobe
(single source of truth for Part A of the sequence-script — one outfit/makeup lock, or per-scene, and why)

## TTS Timing Lock
| Voice line | Audio file | Exact duration | Cumulative in–out | Assigned sequence / sub-scene |
|---|---|---:|---|---|

## Reference Requirements Summary
| Sequence | character | environment | product | source_footage |
|---|---|---|---|---|

## Revision Log
- round 1: draft, by content-executive

## Gaps Open
```

## Revision pass

If `node/gap-request.md` (from designer — e.g. "this beat can't be shot with the Brand Kit's only
product angle" or "continuity decision unworkable") appears, read it, apply `revision_notes`,
append `## Round N answers` to this same file (never overwrite prior rounds), and append to
`Revision Log`.

## Do / Don't
- DO generate and measure Applio TTS before timing any dialogue-bearing script; retain `node/timing/timing-lock.json` as evidence.
- DO use the fewest render sequences that cover the measured dialogue duration and satisfy the narrative.
- DO use only 4s, 6s, 8s, or 10s sequences; a sequence may contain multiple timed visual sub-scenes.
- DO state the running sequence total and flag if it is shorter than measured dialogue audio or violates an explicit duration requirement.
- DO treat no-dialogue briefs separately: state `no-dialogue`, use an explicit video duration if supplied, otherwise return a duration gap instead of inventing VO timing.
- DON'T estimate speech timing from LLM token/character count when TTS is available.
- DON'T resolve reference image paths here — only flag which scenes need which reference *types*.
  Resolving/generating them is `write-ai-commercial-video-sequence-script` Step A's job.
- DON'T write camera/lighting/VFX detail as a final locked Omni prompt — that translation into the
  strict JSON schema happens in `write-ai-commercial-video-sequence-script` Step B.

## Graph
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Timing engine:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/applio-brand-voice/SKILL|applio-brand-voice]]
**Consumer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-ai-ugc-video-sequence-script/SKILL|write-ai-ugc-video-sequence-script]]
**Owner:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/content-executive|content-executive]]
**Workflow:** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/[social]_[ai-commercial-short-video]|ai-commercial-short-video workflow]]
**Sibling method:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/creative-direction/SKILL|creative-direction]] (retrieval-backed; this skill is the interim knowledge-only equivalent for TVC)
