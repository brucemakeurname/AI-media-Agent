# Segment Logic — talking-head-editing

Rules governing how `cut_plan.json` is produced in Phase 1 (Semantic Cut Planning).
These rules reflect the *semantic* approach: Claude reads the transcript and decides cut
points based on meaning and rhythm — not time thresholds.

---

## Core Rule: Max 5 Words Per Segment

No segment may contain more than **5 words**. Longer phrases must be split at the most
natural semantic boundary.

> **Why:** Each segment maps to a flash of text on screen. 5 words is the visual limit
> for the viewer to absorb a single idea in one glance. Longer = diluted impact.

---

## Rule: Enumeration Items — 1 Item Per Segment

When the script lists multiple items in sequence (e.g., "Midjourney, Kling, Luma"), each
item gets its own segment — regardless of word count.

```
✅  CORRECT
  seg: "Midjourney,"
  seg: "Kling,"
  seg: "Luma,"

❌  WRONG
  seg: "Midjourney, Kling, Luma,"
```

This applies to any list — named tools, characteristics, reasons, countries, etc.

---

## Rule: Section Headers — Always Separate

"Number one,", "Number two,", "Number three,", "And finally, number four," — these
structural markers are always isolated as their own segment. They function as visual
chapter cards.

```
✅  CORRECT
  seg: "Number one,"
  seg: "most AI influencers fail."     ← or split further if > 5 words

❌  WRONG
  seg: "Number one, most AI influencers fail."
```

---

## Rule: Adverbs and Connectors — Can Stand Alone

Short adverbs and discourse connectors ("So,", "Finally,", "Because,", "But") can be
isolated as a single-word segment when they carry a beat shift — a pause before the
main statement lands.

This is editorial judgment. Not every connector must be isolated, but any connector
at a major rhetorical transition should be.

---

## Rule: Emphasis Isolation

Short, punchy phrases that carry maximum rhetorical weight must be split so each
phrase is its own moment. The rule is: *if removing the surrounding context makes
the phrase hit harder, split it.*

Canonical example from the test project:
```
"You cannot automate a soul."

→  seg: "You cannot"
→  seg: "automate"
→  seg: "a soul."
```

Each fragment delivers a separate micro-shock. Combining them dilutes the impact.

Other patterns that trigger isolation:
- Rhetorical declarations ("The AI is the brush,")
- Antithesis pairs ("not a video game.", "like a business.")
- Contrast transitions ("she moves" / "doesn't mean" / "she matters.")

---

## Rule: Semantic Completeness

Even when splitting for the 5-word limit, each split must remain *semantically coherent*.
Never split mid-compound:

```
✅  "dead-eyed avatars"          ← compound adjective + noun, keep together
✅  "because people confuse"     ← clause starter
✅  "using a tool"               ← prep phrase — complete thought
❌  "dead-eyed ava-"             ← never mid-word
❌  "because people"             ← dangling — "confuse" belongs with the subject
```

---

## Rule: Connective Continuity — Don't Orphan Logic

Some phrases only make sense attached to what follows ("because people confuse / using a
tool with building a brand"). If the cause clause and effect clause are grammatically
inseparable, keep them adjacent or in the same visual beat, even if each is its own
segment.

The viewer sees: flash → flash → flash. Adjacent segments *read* as continuation.
Isolated segments that logically depend on each other are fine as *sequential* segments —
just never merge them into one if the total exceeds 5 words.

---

## Segment Fields in cut_plan.json

```json
{
  "id": 0,
  "start": 0.391,
  "end": 1.352,
  "duration": 0.961,
  "text": "Everyone is shouting",
  "reason": "Opening hook — first beat of the hook sentence"
}
```

| Field | Source |
|-------|--------|
| `start` / `end` | Word-level timestamps from WhisperX (`word_transcript.json`) |
| `text` | Verbatim from transcript |
| `reason` | Claude's editorial label — semantic role of this beat |

---

## Timestamp Source

All timestamps come from **WhisperX run directly on `main_clean_2.mp4`** — not from the
original raw footage, not from derived/transformed timestamps.

Using `logs/word_transcript.json`:
- `start` = first word's `start`
- `end` = last word's `end`

Gaps between segments (natural pauses, breath marks) are **not filled**. The `start` of
segment N+1 is simply whatever the next word's timestamp is.

---

## What Claude Does (The Analysis Process)

1. Read `logs/sentence_transcript.json` — 20 sentences, full structure
2. Read `logs/word_transcript.json` — 216 words, precise timestamps
3. For each sentence, decide where the natural visual beats fall
4. Apply the rules above in priority order:
   - Enumerate? → split each item
   - Section header? → isolate
   - Emphasis moment? → isolate
   - > 5 words? → split at semantic boundary
5. Write every segment to `cut_plan.json` with start/end from word timestamps

---

## Graph

**Context:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW|WORKFLOW]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/CLAUDE|CLAUDE]]
**Data:** `Test/proj_teleprompter_01/logs/word_transcript.json` · `Test/proj_teleprompter_01/logs/sentence_transcript.json`
**Output:** `Test/proj_teleprompter_01/segments/cut_plan.json`
**Phase 0:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Phase0-raw-cut-logic|Phase0-raw-cut-logic]]
