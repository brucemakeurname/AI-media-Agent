# Skill — cleanup-completed-project

## When to invoke

Only after the human operator has **confirmed the final video is approved**. This skill is irreversible — it deletes ~7GB of intermediate files, leaving only the re-edit checkpoint and deliverables.

Do NOT invoke speculatively. Do NOT invoke just because `manifest.edit_status = "complete"` — that only means the pipeline finished, not that the human approved the output.

## Usage

```
/cleanup-completed-project {project_path}
```

## What this skill does

Runs `node talking-head-editing/scripts/cleanup-completed.js {project_path}`.

The script:
1. Reads `manifest.json` — halts if `edit_status ≠ "complete"`
2. Prints a dry-run size report of what will be deleted
3. Prompts for confirmation (or accepts `--confirm` flag)
4. Deletes all intermediate artifacts
5. Prints final folder size

## What is DELETED (~7.3GB freed)

| Path | Why |
|---|---|
| `footage/` | Source + Phase 0 intermediates. Original recording lives with operator, not here. |
| `segments/seg_NNN.mp4` | Unzoomed cuts — re-generable from `main_clean + cut_plan.json` |
| `segments/zoomed/` | Zoomed cuts — re-generable from segments + `zoom_plan.json` |
| `segments/concat_zoom.txt` | Re-generable by `apply-zoom.js` |
| `aroll_renders/ar_NN_comp/` | HyperFrames source dirs — outputs baked into `ar_NN.mov` |
| `aroll_renders/ar_NN.mov` | ProRes 4444 overlays — baked into `aroll_footage.mp4` |
| `aroll_renders/base_zoomed.mp4` | Phase 3 intermediate — baked into `aroll_footage.mp4` |
| `broll_renders/br_NN_comp/` | HyperFrames source dirs — rendered `br_NN.mp4` are the outputs |
| `broll_renders/br_NN_trim.mp4` | Pre-trimmed intermediates — re-generable by `pretrim-brolls.js` |
| `subtitles/subtitle_comp/` | HyperFrames subtitle source — rendered into `subtitle_overlay.mov` |
| `subtitles/subtitle_overlay.mov` | ProRes overlay — baked into `assembled_broll.mp4` |
| `output/assembled_broll.mp4` | Phase 5.3 intermediate |
| `output/assembled_sub.mp4` | Phase 5.4 intermediate |
| `output/test_*.mp4` | Manual test renders |
| `test-broll/` | B-roll test folder |

## What is KEPT (~215MB)

| Path | Purpose |
|---|---|
| `output/{project_id}_final.mp4` | ✅ Final deliverable |
| `output/manifest.json` | Project state |
| `output/thumbnail-needed.json` | Design Hub signal |
| `aroll_renders/aroll_footage.mp4` | **Re-edit checkpoint** — Phase 3 output with all overlays baked. Re-run Phase 5 from here to change B-rolls, subtitles, or BGM without re-rendering overlays. |
| `aroll_renders/aroll_timestamp.json` + `aroll_sfx_timestamp.json` | A-roll timing manifests |
| `broll_renders/br_NN.mp4` | Rendered B-roll clips (small, 1–5MB each) |
| `broll_renders/broll_timestamp.json` + `broll_sfx_timestamp.json` + `broll_concat_exact.json` | B-roll manifests |
| `logs/` | All JSON: transcripts, analysis.json, cut decisions |
| `audio/` | bgm_manifest.json + bgm.mp3 |
| `subtitles/{project_id}.srt` | Final subtitle file |
| `segments/cut_plan.json` + `zoom_plan.json` | Phase 1 decisions |

## Re-edit capability after cleanup

| Edit type | Possible? | Starting point |
|---|---|---|
| Change BGM / audio levels | ✅ Yes | Re-run `mix-audio.js` from `aroll_footage.mp4` |
| Change subtitle style | ✅ Yes | Re-run `build-subtitle-comp.js` → render → `composite-subtitle.js` |
| Change B-roll timing/clips | ✅ Yes | Re-run Phase 5.1–5.5 from `aroll_footage.mp4` |
| Re-cut segments / zoom | ⚠️ Partial | Need to re-run Phase 0 on original source (not stored here) |
| Add new overlays | ❌ Full re-run | Need original source → Phase 0 → Phase 3 |

## Graph

**Parent pipeline:** [[../../docs/WORKFLOW-template|WORKFLOW-template]]
**Script:** `talking-head-editing/scripts/cleanup-completed.js`
**Related skill:** [[../edit-talking-head-video/SKILL|edit-talking-head-video]]
