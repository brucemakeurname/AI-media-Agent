---
name: write-ai-commercial-video-sequence-script
description: Turn a locked node/shooting-script.md into node/sequence-script.md — Part A resolves/generates the fixed reference context (character, wardrobe/makeup, product, environment plates) so scenes don't drift, Part B writes each scene as an Omni-schema JSON prompt block with ≤3 assigned refs and mandatory TVC/commercial keywords, plus a standalone thumbnail spec. Designer only, single pass.
---

# write-ai-commercial-video-sequence-script

Produces `node/sequence-script.md` — the locked shot list `video-editor` renders one scene at a
time via `gemini-omni-video-gen` (`reference_to_video`). Two-step process inside one skill
invocation, modeled on the proven worked example at
`BASE/BRAND KITs/2a. Video_Prompt_Template/commercial/GENTADOX/sequence-script.md` (read that file
once for the target shape) and the JSON field spec at
`BASE/BRAND KITs/2a. Video_Prompt_Template/Omni JSON prompt.txt`.

Renamed from `commercial-video-sequence-script` (2026-07-21) — no longer writes JSON directly, no
longer reads `Ticket.md` for creative content (that's `write-shooting-script`'s job now), and is no
longer split into content-executive `draft`/designer `finalize` modes — the designer owns this
skill outright since both halves (ref collection, JSON prompt craft) are visual work.

## Inputs

| Param | Source |
|---|---|
| `shooting_script_path` | `node/shooting-script.md` (written by `write-shooting-script`) — the sole source of scene content; do not read `Ticket.md`'s video-concept fields directly |
| `ticket_path` | `Ticket.md` — brand/channel identity only (which Brand Kit, which influencer if any) |
| `brand_template_path` | matched sample from `BASE/BRAND KITs/[brand]_Brand_Kit/` or `1. Creative_Prompt_Template/`/`2. Photoshoot_Prompt_Template/` for style/font/tone grounding — same retrieval mechanism as `creative-direction` Method 2 |
| `output_path` | `node/sequence-script.md` |

## Step A — Ref Context

Read the shooting script's **Continuity & Wardrobe** section and **Reference Requirements
Summary** table before touching any scene.

1. Check the Brand Kit first for every flagged reference type (`element-resolver` — character
   face if a fixed influencer/presenter is named, product packaging, logo). Never invent
   packaging/logo — if the Brand Kit lacks a clean product shot, log it in `Gaps Open` and stop
   for that asset rather than fabricate one (label accuracy is a hard requirement).
2. For anything missing — a new on-screen character not already in a Brand Kit, or the
   problem-state/solution-state environment plates the shooting script's beats need — call
   `photography-direction` (mode `reference`) to pick the right prompt craft (styling, lighting,
   framing) for that asset and render it via `nano-banana-image-gen`. This is what locks identity/
   environment across every scene that reuses it — same purpose as `REF-A`/`REF-B`/`REF-C` in the
   GENTADOX worked example.
3. Apply the shooting script's continuity decision: one wardrobe/makeup ref reused everywhere, or
   a second character-state ref if the script calls for a costume/state change partway through.
4. Save every generated/resolved ref into `node/elements/` (or `node/refs/` if it's a fresh
   context plate, not an `element-resolver`-tracked asset) and record it in this skill's **Part A**
   output section: ref name, purpose, prompt used (if generated), file path.

## Step B — Scene Prompts

1. Walk every `### Scene N.M` entry in the shooting script in order. Translate its Visual/Action/
   Dialogue/SFX/Motion/On-screen-text/Ending fields into the Omni JSON schema
   (`scene_description`, `style`, `camera_direction`, `lighting`, `voice`, `SFX`, `environment`,
   `element`, `motion`, `ending`, `text`, `keyword`) — ground `style`/`camera_direction`/on-screen
   `text` typography against `brand_template_path`.
2. Assign **≤3** resolved refs per scene from Part A's set, tagged `ref_context` / `ref_product` /
   `ref_character` (never more — Omni's own reference cap, see
   `gemini-omni-video-gen/SKILL.md` Step 3).
3. **Inject mandatory keywords** into every scene's `keyword` array: always `"TVC"` and
   `"commercial"` (plus content-specific tags) — the guardrail against the render drifting into
   `ai-ugc-short-video`'s raw/handheld/selfie register. Sanity-check `style`/`camera_direction`/
   `voice` read as premium-commercial, not casual.
4. Write a standalone `thumbnail` block the same way (own scene-like JSON, not one of the numbered
   scenes) — the designer renders this separately as a static image per `designer.md`'s normal
   mechanism; it is not part of `video-editor`'s scene loop.
5. Build the **Bảng gán REF** (ref-assignment) table — one row per scene, same shape as the
   GENTADOX example — for at-a-glance traceability.
6. Append to `Revision Log`; set `Gaps Open: []` once every scene's required ref is resolved —
   leave any genuinely unresolvable required ref listed there and flag CMO rather than substitute
   a fabricated asset.

## Output — `node/sequence-script.md`

```markdown
# Sequence Script — {{topic}}

## Production Notes
- Brand template grounding:
- Duration target / actual scene-time sum:
- Continuity: (from shooting-script)

## PART A — Reference Context

### REF-A · {{name}} ({{type}})
> {{prompt used, if generated}}
- Purpose:
- File: `node/elements/...`

(one entry per resolved/generated ref)

## PART B — Scene Prompts

### Scene 1 — {{role}}
**Ref (n):** `REF-A-...` · `REF-B-...`
```json
{
  "scene": 1,
  "role": "hook",
  "scene_description": "",
  "style": "",
  "camera_direction": "",
  "lighting": "",
  "voice": "",
  "SFX": "",
  "environment": "",
  "element": [{"element_name_1": "", "prop_name_1": ""}],
  "motion": "",
  "ending": "",
  "text": "",
  "keyword": ["TVC", "commercial"]
}
```

(one `### Scene N` block per shooting-script scene, same fenced-JSON shape — `video-editor` parses
each fenced block in order)

### Thumbnail
**Ref (n):** ...
```json
{ "scene_description": "", "style": "", "text": "", "keyword": ["TVC", "commercial"] }
```

## Bảng gán REF (≤3/scene)
| Scene | Nội dung | Ref context | Ref sản phẩm | Ref nhân vật |
|---|---|---|---|---|

## Revision Log
- round 1: initial, by designer

## Gaps Open
```

## Do / Don't
- DO cap every scene at ≤3 refs and ≤10s narrative pacing — both are Omni model ceilings.
- DO always carry `"TVC"`/`"commercial"` in every scene's `keyword` list — the single biggest
  lever against drifting into `ai-ugc-short-video` territory.
- DO build scenes from `shooting_script_path` only — never re-derive narrative/timing from
  `Ticket.md` directly; that would bypass the timeline guardrails `write-shooting-script` already
  enforced.
- DON'T fabricate product packaging, logos, or claims not in the Brand Kit / shooting script.
- DON'T render video here — this skill writes the locked scene list; `video-editor` renders it.
  (Ref images from Step A ARE rendered here — those are static context plates, not the video.)

## Graph
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Source:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-shooting-script/SKILL|write-shooting-script]]
**Consumers:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/designer|designer]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/video-editor|video-editor]]
**Renderer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/gemini-omni-video-gen/SKILL|gemini-omni-video-gen]]
**Ref resolution:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/element-resolver/SKILL|element-resolver]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/photography-direction/SKILL|photography-direction]]
**Workflow:** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/[social]_[ai-commercial-short-video]|ai-commercial-short-video workflow]]
