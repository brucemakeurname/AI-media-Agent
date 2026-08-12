# /edit-video — Skill Definition

## Command

```
/edit-video {project_path}
```

## Purpose

Full 5-phase video production: raw footage edit (FFmpeg) → b-roll resolution (HyperFrames 50% / internet crawl 50%) → assembly → HyperFrames banner overlay composite (banner-top + banner-bottom, chromakey transparent) → SFX + music layering.

## Argument

`{project_path}` — Absolute path to the project folder. Must contain:
- `edit_instructions.json` — edit sequence + overlay + audio spec (version 2.0)
- `brief.json` — project brief for context
- `manifest.json` — edit_status must be `pending` or `failed`
- `footage/` — all source video files referenced in the sequence

## What This Skill Does

**Phase 1 — Raw Edit**
1. Validates all source footage exists
2. Normalizes sources to h264/aac 1080x1920
3. Cuts segments per in_point/out_point
4. Creates silent black placeholders for b-roll slots

**Phase 2 — B-Roll Resolution**
5. Resolves each b-roll slot:
   - `source_strategy: "hyperframe"` → renders HyperFrames fullscreen template (no TTS)
   - `source_strategy: "crawl"` → WebSearch + WebFetch, normalize, ken-burns if image
   - Auto-fallback to hyperframe on crawl failure

**Phase 3 — Full Assembly**
6. Builds concat list with resolved b-roll, concatenates to `assembled.mp4`
7. Applies 20ms audio crossfades at all cut points

**Phase 4 — Banner Overlays**
8. Renders each banner overlay with chromakey green background:
   - `banner-top`: content occupies top 30% (576px), green fills bottom 70%
   - `banner-bottom`: green fills top 70%, content occupies bottom 30%
9. Composites overlays onto assembled video via FFmpeg chromakey filter
10. Simultaneous banner-top + banner-bottom: composited in single filter_complex

**Phase 5 — SFX + Music**
11. Mixes SFX at overlay timestamps (template-matched, volume 0.4)
12. Mixes background music with fade curves
13. Writes final output + thumbnail signal

## edit_instructions.json Format (v2.0)

```json
{
  "version": "2.0",
  "project_id": "proj_abc",
  "output_resolution": "1080x1920",
  "output_fps": 30,
  "sequence": [
    { "id": "seg1", "type": "main", "source": "footage/clip.mp4", "in_point": 0, "out_point": 12 },
    { "id": "br1", "type": "broll", "duration": 5, "source_strategy": "hyperframe",
      "template": { "template": "stat-hero", "value": "3M", "label": "users" } },
    { "id": "br2", "type": "broll", "duration": 6, "source_strategy": "crawl",
      "crawl_query": "Vietnam AI 2025", "crawl_type": "video" }
  ],
  "overlays": [
    { "id": "ov1", "mode": "banner-top", "start_sec": 5, "end_sec": 12,
      "template": { "template": "callout", "statement": "..." } },
    { "id": "ov2", "mode": "banner-bottom", "start_sec": 5, "end_sec": 12,
      "template": { "template": "stat-hero", "value": "...", "label": "..." } }
  ],
  "audio": {
    "sfx_enabled": true,
    "music": { "source": "assets/music/bg.mp3", "volume": 0.15, "fade_in": 2, "fade_out": 3 }
  }
}
```

## Success Output

```
[edit-video] Project: {project_id}
Phase 1: {N} segments cut, {N} broll placeholders created
Phase 2: {N} broll resolved (hyperframe: {N}, crawled: {N}, fallback: {N})
Phase 3: assembled.mp4 — {duration}s
Phase 4: {N} overlays composited (top: {N}, bottom: {N})
Phase 5: SFX mixed at {N} points, music layered
Output: {project_path}/output/{project_id}_final.mp4
Duration: {final_duration}s
Manifest: edit_status = complete
```

## Failure Output

```
[edit-video] Project: {project_id} FAILED
Phase: {phase that failed}
Error: {error message}
Failed command: {ffmpeg command if applicable}
Manifest: edit_status = failed
```

## Error Codes

| Code | Phase | Severity | Action |
|------|-------|----------|--------|
| `E_MISSING_SOURCE` | 1 | Fatal | Halt |
| `E_NORMALIZE_FAIL` | 1 | Fatal | Retry once, then halt |
| `E_BROLL_CRAWL_FAIL` | 2 | Warning | Fallback to hyperframe |
| `E_BROLL_RENDER_FAIL` | 2 | Warning | Use black placeholder |
| `E_ASSEMBLY_FAIL` | 3 | Fatal | Retry with re-encode, then halt |
| `E_OVERLAY_RENDER_FAIL` | 4 | Warning | Skip overlay, continue |
| `E_COMPOSITE_FAIL` | 4 | Warning | Skip overlay, continue |
| `E_AUDIO_MIX_FAIL` | 5 | Warning | Skip music, deliver without |
| `E_VALIDATION_FAIL` | Output | Fatal | Delete output, retry Phase 3 once |

## Notes

- b-roll slots are distributed 50/50 between hyperframe and crawl by the `source_strategy` field in edit_instructions.json — the CMO/Content Hub decides the split when writing the instructions
- Banner overlays use HyperFrames templates with chromakey (#00FF00) green screen — NOT a separate overlay tool
- SFX library is shared with hyperframe-video-gen at `hyperframe-video-gen/assets/sfx/`
- The skill is idempotent — safe to run twice on the same project
- thumbnail-needed.json written on completion — Design Hub handles thumbnail generation
