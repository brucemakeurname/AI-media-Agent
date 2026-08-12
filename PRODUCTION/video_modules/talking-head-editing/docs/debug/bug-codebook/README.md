# bug-codebook — Debug Knowledge Base

> The `debug-video-pipeline` agent's source of truth. Every entry documents one bug encountered during pipeline development with a deterministic fix.

---

## Anti-Self-Fix Doctrine

Pipeline agents (`video-editor`, `motion-video-designer`, `sfx-artist`) NEVER attempt to fix errors themselves. Instead:

1. Halt on error.
2. Write `logs/error_report.json` with full context.
3. Invoke `debug-video-pipeline` agent.
4. Read returned `logs/fix_plan.json`.
5. Apply fix EXACTLY as specified.

This codebook is what `debug-video-pipeline` reads to produce `fix_plan.json`.

---

## How an Entry is Used

When invoked, the debug agent receives `error_report.json` and walks each BUG-NNN file:

1. Match against the **Detection Signature** section (regex on stderr, output diff, file presence, etc.).
2. If matched: return `fix_plan.json` citing the BUG ID + the Fix steps.
3. If no entry matches: return `{"unknown_error": true}` — pipeline halts for human review.

**Critical:** Codebook entries are append-only. New bugs are added by humans after review. The debug agent does NOT auto-add entries (prevents poisoning the knowledge base).

---

## Entry Format

```markdown
# BUG-NNN — {short slug}

**Phase:** {0 | 1 | 2 | 3 | 5}
**Severity:** {fatal | warning}
**First observed:** {project_id}

## Symptom
What the user/agent sees when this bug fires.

## Root Cause
The underlying technical reason.

## Detection Signature
How to programmatically detect this bug:
- Stderr regex patterns
- File-presence checks
- Output mismatch conditions

## Fix
The exact procedure. Numbered steps. Specific commands.

## Why this fix works
Mechanism explanation — so future agents can adapt to edge cases.

## References
WORKFLOW.md line numbers, related BUG entries, related rules files.
```

---

## Codebook Index

| ID | Title | Phase | Severity |
|---|---|---|---|
| BUG-001 | Gemini timestamp non-linear compression | 0 | fatal |
| BUG-002 | Identical-word false start preservation | 0 | fatal |
| BUG-003 | SRT drift from zoom re-encode keyframe padding | 1 | warning |
| BUG-004 | B-roll concat scale correction required | 5 | fatal |
| BUG-005 | `-itsoffset` + `setpts=PTS-STARTPTS` cancellation | 3, 5 | fatal |
| BUG-006 | ffprobe-actual vs cut_plan nominal duration | 1, 3, 5 | fatal |
| BUG-007 | FFmpeg consumes inputs from t=0 regardless of enable | 5 | fatal |
| BUG-008 | B-roll render_duration > slot_duration overflow | 5 | fatal |
| BUG-009 | Missing `eof_action=pass` causes last-frame ghosting | 3, 5 | fatal |
| BUG-010 | WhisperX mishears tool/brand names | 0, 1 | warning |
| BUG-011 | WhisperX forced-alignment collapses Vietnamese word timestamps | 0 | fatal |

---

## error_report.json Schema (input)

```json
{
  "project_id": "{slug}",
  "phase": "rough-cut | semantic-cut | broll-design | aroll-overlay | assembly",
  "stage": "{specific-stage-name}",
  "command": "{full ffmpeg/script command}",
  "stderr": "{captured stderr}",
  "exit_code": 1,
  "expected_output": "{path}",
  "actual_output_present": false,
  "attempted_at": "ISO 8601",
  "additional_context": {}
}
```

## fix_plan.json Schema (output)

```json
{
  "matched_bug": "BUG-005",
  "confidence": "high | medium | low",
  "fix_steps": [
    {
      "step": 1,
      "action": "modify-command",
      "description": "Replace `-itsoffset {N}` with filter `setpts=PTS+{N}/TB`",
      "command_template": "ffmpeg ..."
    }
  ],
  "verification": [
    "ffprobe output duration must be within ±0.5s of expected"
  ],
  "if_fix_fails": "halt-for-human",
  "references": ["BUG-005", "assembly-rules.md Rule 3"]
}
```

If `unknown_error`:
```json
{
  "unknown_error": true,
  "closest_matches": ["BUG-NNN", "BUG-MMM"],
  "recommended_action": "halt-for-human",
  "notes": "Why no entry matched"
}
```

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]]
**Agent owner:** `talking-head-editing/.claude/agents/debug-video-pipeline.md`
**Related rules:** [[../../rules/assembly-rules|assembly-rules]] · [[../../rules/aroll-overlay-rules|aroll-overlay-rules]] · [[../../rules/rough-cut-rules|rough-cut-rules]]
