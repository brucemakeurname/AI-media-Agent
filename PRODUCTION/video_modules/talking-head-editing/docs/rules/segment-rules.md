# segment-rules — Phase 1 Semantic Cut Logic

> Rules governing `cut_plan.json` production. Claude reads transcripts and decides cut points based on meaning and rhythm — NOT on time thresholds.

---

## Core Rule — Max 5 Words Per Segment

No segment may contain more than **5 words**. Longer phrases must be split at the most natural semantic boundary.

**Why:** Each segment maps to one flash of text on screen. 5 words is the visual limit for the viewer to absorb a single idea in one glance. Longer = diluted impact.

---

## Rule — Enumeration Items: One Per Segment

When the script lists items in sequence ("Midjourney, Kling, Luma"), each item is its own segment regardless of word count.

```
✅  seg: "Midjourney,"
    seg: "Kling,"
    seg: "Luma,"

❌  seg: "Midjourney, Kling, Luma,"
```

Applies to any list: named tools, characteristics, reasons, countries, etc.

---

## Rule — Section Headers Always Isolated

"Number one,", "Number two,", "And finally," etc. are structural markers — always isolated as their own segment. They function as visual chapter cards.

```
✅  seg: "Number one,"
    seg: "most AI influencers fail."

❌  seg: "Number one, most AI influencers fail."
```

---

## Rule — Adverbs and Connectors

Short adverbs and discourse connectors ("So,", "Finally,", "Because,", "But") CAN stand alone as single-word segments when they carry a beat shift — a pause before the main statement lands.

This is editorial judgment. Not every connector must be isolated, but any connector at a major rhetorical transition should be.

---

## Rule — Emphasis Isolation

Short, punchy phrases that carry maximum rhetorical weight must be split so each phrase is its own moment. **If removing the surrounding context makes the phrase hit harder, split it.**

Example:
```
"You cannot automate a soul."

→  seg: "You cannot"
→  seg: "automate"
→  seg: "a soul."
```

Each fragment delivers a separate micro-shock.

**Triggers for isolation:**
- Rhetorical declarations ("The AI is the brush,")
- Antithesis pairs ("not a video game.", "like a business.")
- Contrast transitions ("she moves" / "doesn't mean" / "she matters.")

---

## Rule — Semantic Completeness

Even when splitting for the 5-word limit, each split must remain semantically coherent. Never split mid-compound:

```
✅  "dead-eyed avatars"      ← compound adjective + noun, keep together
✅  "because people confuse" ← clause starter
✅  "using a tool"           ← prep phrase — complete thought

❌  "dead-eyed ava-"          ← never mid-word
❌  "because people"          ← dangling — "confuse" belongs with subject
```

---

## Rule — Connective Continuity

Some phrases only make sense attached to what follows ("because people confuse / using a tool with building a brand"). If cause and effect are grammatically inseparable, keep them adjacent or in the same visual beat as **sequential** segments — never merge them into one if the total exceeds 5 words.

The viewer sees: flash → flash → flash. Adjacent segments READ as continuation. Isolated segments that logically depend on each other are fine as sequential segments.

---

## Rule — Timestamp Source

All timestamps come from **WhisperX run directly on `main_clean.mp4`** — not from the original raw footage, not from derived/transformed timestamps.

Using `logs/whisperx_word_transcript.json`:
- `start` = first word's `start`
- `end` = last word's `end`

Gaps between segments (natural pauses, breath marks) are **not filled**. The `start` of segment N+1 is whatever the next word's timestamp is.

---

## cut_plan.json Schema

```json
{
  "source": "main_clean.mp4",
  "source_duration": 0.0,
  "total_segments": 0,
  "generated_by": "claude-semantic-analysis-v{N}",
  "rules_applied": [
    "max-5-words-per-segment",
    "enumeration-isolated",
    "section-header-isolated",
    "emphasis-isolation",
    "semantic-completeness",
    "no-mid-compound-split"
  ],
  "segments": [
    {
      "id": 0,
      "start": 0.391,
      "end": 1.352,
      "duration": 0.961,
      "text": "Everyone is shouting",
      "reason": "Opening hook — first beat of the hook sentence"
    }
  ]
}
```

**Field sources:**
| Field | Source |
|---|---|
| `start` / `end` | Word-level timestamps from WhisperX |
| `duration` | `end - start` |
| `text` | Verbatim from transcript (do not normalize punctuation) |
| `reason` | Claude's editorial label — semantic role of this beat |

---

## Analysis Process (the LLM step)

1. Read `logs/sentence_transcript.json` — full sentence structure
2. Read `logs/whisperx_word_transcript.json` — precise word timestamps
3. For each sentence, decide where natural visual beats fall
4. Apply rules in priority order:
   - Is it an enumeration? → split each item
   - Is it a section header? → isolate
   - Is it an emphasis moment? → isolate per word-group
   - Is it > 5 words? → split at semantic boundary
   - Are all splits semantically coherent? → verify
5. Write every segment to `cut_plan.json` with start/end from word timestamps

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW-template|WORKFLOW-template]]
**Sibling rules:** [[rough-cut-rules|rough-cut-rules]] · [[zoom-rules|zoom-rules]] · [[assembly-rules|assembly-rules]]
