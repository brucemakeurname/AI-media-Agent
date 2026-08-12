---
name: write-ai-timelapse-video-sequence-script
description: Turn a domain-brainstormed stage list (e.g. from construction-sequence-brainstorm) into a locked node/timelapse-sequence-script.md — Part A writes every keyframe's full generation-ready image prompt (state-delta, anti-drift lock, chain reference), Part B writes every segment's Veo 3.1 first+last-frame animation prompt, Part C locks the BGM spec. Keyframe/segment count is derived from logical completeness and the ticket's duration budget, never a fixed default. Designer only, single pass, modeled on write-ai-commercial-video-sequence-script's Part A/Part B shape.
---

# write-ai-timelapse-video-sequence-script

Produces `node/timelapse-sequence-script.md` — the locked keyframe + segment list `designer` then
`video-editor` execute one item at a time via `nano-banana-image-gen` and `gemini-veo-3.1-video-gen`
(see `ai-timelapse-video` for those mechanics; this skill only writes the locked plan, it does not
call either model itself except where Part A's keyframes are actually rendered — see Step B).

**No fixed keyframe/segment count.** Unlike a fixed "N=4" or "N=5" template, this skill derives how
many keyframes a ticket needs from two things only: (1) how many of the domain brainstorm's
candidate stage boundaries are actually visually distinguishable in a single static photo, and (2)
the ticket's duration budget (each Veo segment ≤8s, so keyframes = segments + 1, total duration ≤
8 × segments). Never pad the count to hit a round number, and never truncate it to match a
previous ticket's count — every ticket's real answer can differ.

## Inputs

| Param | Source |
|---|---|
| `domain_stage_list` | Output of a domain brainstorm skill — e.g. `construction-sequence-brainstorm`'s Steps 1-5 (building/foundation classification, full technique + finishing order, site-organization details). For a non-construction timelapse (growth, renovation, assembly), the equivalent domain skill's stage list. |
| `ticket_constraints` | `Ticket.md` / `{{video_requirement}}` — duration cap if any, aspect ratio, real-vs-generated anchor image, platform target |
| `output_path` | `node/timelapse-sequence-script.md` |

## Step A — Determine keyframe count from logical completeness, not a fixed number

1. List **every** candidate stage boundary the domain brainstorm identified (for construction:
   mặt bằng trống, móng giai đoạn 1 (đào/cọc xong), móng giai đoạn 2 (đổ/đài xong), khung topping
   out, tường xây xong (= phần thô), hoàn thiện — or however many the domain skill's own technique
   order actually distinguishes; do not assume this list has any particular length).
2. For each boundary, ask: **"Is this visually distinguishable from its immediate neighbor in one
   static photo?"** If a phase would look identical in a photo to the phase before or after it
   (e.g. "column rebar half-tied" vs "fully tied"), it is NOT a keyframe candidate — collapse it
   into the neighboring boundary that IS distinguishable. Keep every boundary that passes this
   test as a candidate keyframe, however many that turns out to be.
3. Apply the ticket's duration budget backward, only if one exists: `keyframes ≤
   floor(max_duration_seconds / 8) + 1`. If the candidate list from step 2 exceeds this ceiling,
   collapse the least-essential adjacent boundaries first — the two absolute endpoints (the
   ticket's true starting state and true final state) are never collapsed away; interior
   boundaries collapse in order of "smallest visual delta from its neighbor" first. If the ticket
   has no stated duration cap, use every distinguishable boundary from step 2 as-is — completeness
   wins over an assumed "short is better."
4. Write down the final keyframe list with, for each one, a **one-line rationale** ("kept — visibly
   distinct raft slab vs bare excavation" / "collapsed into móng giai đoạn 2 — cọc-ép and cọc-
   ly-tâm's on-site visual signature is identical once driven, no need for a separate keyframe per
   pile type"). This rationale is what Part A's Production Notes records — a reviewer must be able
   to see WHY this ticket ended up with however many keyframes it has.

## Step B — Part A: write every keyframe's generation-ready prompt

For each keyframe in the locked list, in order:

1. Resolve whether it anchors to a **real photo** (client site/product — via `element-resolver`)
   or is **fully generated** (`nano-banana-image-gen`) — the domain brainstorm should have flagged
   this per keyframe already; carry that decision forward, don't re-derive it here.
2. Write the full JSON brief (`project_info`/`main_subject`/`composition_elements`/
   `lighting_and_atmosphere`/`technical_specs`/`negative_prompt` — same schema
   `nano-banana-image-gen` Step 2 expects), with:
   - Identical camera/style/lighting block text as every other keyframe (`ai-timelapse-video` §2).
   - An explicit state-delta in `main_subject.detail` — what's newly present, what's now gone —
     pulled directly from the domain brainstorm's stage description, never invented here.
   - From keyframe 2 onward, the explicit anti-drift lock clause naming this ticket's specific
     fixed background elements.
   - Which prior keyframe it chain-references (keyframe N reads keyframe N-1's output file path —
     never keyframe 1 for every stage, `ai-timelapse-video` §2).
3. Render it (or leave a `[ ] not yet rendered` checkbox if this skill is being run as a planning
   pass before generation) and record the output file path.

## Step C — Part B: write every segment's Veo 3.1 animation prompt

For each adjacent keyframe pair, in order:

1. `first_frame` / `last_frame` = that pair's Part A output paths.
2. Write the animation prompt per `ai-timelapse-video` §4 — name the specific real-world actions
   bridging the pair (pulled from the domain brainstorm's technique description for that phase,
   never generic "work happens" language), state explicitly that progress advances uniformly/
   evenly across the whole subject where the domain brainstorm's ordering rules require it (e.g.
   construction's "entire footprint finishes before the next phase" and "entire frame tops out
   before walls start" rules), narrate multiple day→night→day cycles if this segment's real
   bridged duration is more than a single day (per `ai-timelapse-video` §2/§4 and the domain
   brainstorm's relative-timeframe estimate — a longer real phase gets more cycles named than a
   shorter one, and the site stays quiet/dim at night rather than actively worked), chain the
   narrative language from the previous segment, and close with the camera-lock reminder.
3. Lock `duration_seconds` (8 by default, lower only if the ticket's total duration budget from
   Step A requires it), `aspect_ratio`/`resolution` (identical across every segment),
   `generate_audio: false`, and a `negative_prompt` covering camera-stability terms plus any
   domain-specific realism failure mode the brainstorm skill flagged (e.g. construction's "uneven
   partial progress" / "walls before the frame above them is finished").

## Step D — Part C: lock the BGM spec

Per `ai-timelapse-video` §6 — mood, source track path (local library only), mix volume, fade
timing. Written once here so `video-editor` doesn't have to re-derive it after all segments render.

## Output — `node/timelapse-sequence-script.md`

```markdown
# Timelapse Sequence Script — {{topic}}

## Production Notes
- Domain brainstorm source:
- Keyframe count chosen: N = {{n}} — see rationale table below
- Duration budget: {{n-1}} segments × up to 8s = up to {{(n-1)*8}}s (or ticket's stated cap)
- Aspect ratio / resolution (locked across all keyframes and segments):
- Real-anchor keyframe(s), if any:

## Keyframe count rationale
| Candidate boundary (from domain brainstorm) | Kept as keyframe? | Rationale |
|---|---|---|
| ... | yes/no (collapsed into ...) | ... |

## PART A — Keyframes

### Keyframe 1 — {{stage name}}
- Anchors to: real photo (`element-resolver`) / fully generated (`nano-banana-image-gen`)
- Chain reference: none (first keyframe)
```json
{ "project_info": {...}, "main_subject": {...}, "composition_elements": {...},
  "lighting_and_atmosphere": {...}, "technical_specs": {...}, "negative_prompt": "..." }
```
- Output: `node/keyframes/frame_1.jpg` (or `[ ] not yet rendered`)

(one `### Keyframe N` block per item in the locked list, same shape — keyframe 2+ includes the
anti-drift lock clause and states which prior keyframe it chain-references)

## PART B — Segments

### Segment 1 — {{first stage}} → {{second stage}}
- `first_frame`: `node/keyframes/frame_1.jpg`
- `last_frame`: `node/keyframes/frame_2.jpg`
- `duration_seconds` / `aspect_ratio` / `resolution` / `generate_audio: false`
- Animation prompt:
> {{full prompt text}}
- `negative_prompt`: "..."
- Output: `node/segments/seg_1.mp4` (or `[ ] not yet rendered`)

(one `### Segment N` block per adjacent keyframe pair)

## PART C — BGM

- Mood:
- Track: `.claude/skills/[html-video]-audio-mix/scripts/assets/bgm/brand/0X.mp3` (or brand catalog)
- Mix: volume 0.10-0.15, afade in/out only at the true start/end of the final assembled video

## Revision Log
- round 1: initial, by designer

## Gaps Open
```

## Do / Don't

- DO derive keyframe/segment count from Step A's logical-completeness test — never copy a previous
  ticket's count or default to a round number.
- DO record the one-line rationale per candidate boundary (kept or collapsed) — a reviewer must be
  able to audit why this ticket has however many keyframes it has.
- DO pull every stage's state-delta and every segment's bridging-action language directly from the
  domain brainstorm skill's output — never invent construction/process detail inside this skill.
- DO lock aspect ratio, resolution, and camera/style/lighting prompt language identically across
  every keyframe and segment before any rendering starts.
- DON'T let a duration cap silently drop the ticket's true start or end state — those two never
  collapse; only interior boundaries do.
- DON'T render anything here beyond what Step B/C explicitly call for — this skill's job is to
  produce the locked plan; `designer`/`video-editor` execute it per the workflow's role split.
- DON'T reuse a fixed N from a different foundation type or building type — móng bè's excavation-
  vs-pour delta and móng cọc's pile-vs-đài delta are different visual questions each time; re-run
  Step A per ticket.

## Graph

**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Domain knowledge source (construction):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/construction-sequence-brainstorm/SKILL|construction-sequence-brainstorm]]
**Mechanics consumed:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/ai-timelapse-video/SKILL|ai-timelapse-video]]
**Keyframe renderer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen]]
**Video renderer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/gemini-veo-3.1-video-gen/SKILL|gemini-veo-3.1-video-gen]]
**Sibling pattern (same Part A/Part B shape, different domain):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-ai-commercial-video-sequence-script/SKILL|write-ai-commercial-video-sequence-script]]
**Consumers:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/designer|designer]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/video-editor|video-editor]]
**Workflow:** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/[social]_[ai-construction-timelapse-short-video]|ai-construction-timelapse-short-video workflow]]
