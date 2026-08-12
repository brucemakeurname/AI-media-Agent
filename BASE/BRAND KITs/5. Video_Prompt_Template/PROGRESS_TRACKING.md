# Video Prompt Template - Progress Tracking

Authoritative work queue for the Video Prompt Template migration. Read this file together with the active goal before every work session.

## Scope and queue

- [x] `dancing` - 20 source templates completed and directly verified; no blocked or unreviewed templates remain.
- [ ] `indie` - 13 source templates: 10 completed and directly verified; 3 blocked.
- [x] `posing` - 42 source templates completed and directly verified; no blocked or unreviewed templates remain.
- [x] `ugc` - 28 source templates completed and directly verified; no blocked or unreviewed templates remain.

These four folders are the complete current work scope. `industry` does not exist and is not in the queue. Any other root folder is out of scope. The `video` folder is explicitly excluded whenever present.

## Completion protocol

1. Always work on the smallest unchecked leaf folder in the order above.
2. Do not revisit a folder marked `- [x]` unless the user requests a correction or audit.
3. Mark a leaf folder `- [x]` immediately after every source template in it has completed the required manual workflow and direct verification.
4. Do not mark a folder complete when a template remains blocked or lacks a matching image; record that case below first.

## Missing matching image / blocked

- `indie/elegant-woman-bathroom-sunlight.json` - source requires a user portrait reference in a private bathroom; Omni RAI guidance flags bathroom framing with real-face references. Blocked pending an approved non-bathroom adaptation or explicit manual decision.
- `indie/fisheye-lens-fashion-girl.json` - source requires facial reference 1, outfit references 2-6, and video reference 1, but only one image asset is present; pending reference mapping.
- `indie/mirror-reflection-eerie-delay.json` - source uses an adult face reference in a bathroom setting; Omni RAI guidance flags this combination, pending an approved non-bathroom adaptation or manual decision.

## Manual decision required

- `indie/elegant-woman-bathroom-sunlight.json` - visual inspection confirms an adult woman at a bathroom vanity; the supplied source still requires a user portrait in that bathroom. Do not convert to a different setting without an explicit decision.
- `indie/mirror-reflection-eerie-delay.json` - visual inspection confirms an adult woman brushing teeth in a bathroom mirror; do not retain a real-face bathroom reference without an approved safe-setting decision.

## Completed-pack report

`dancing`: 20 JSON files; 4 pass, 16 remediated; 0 blocked.

`indie`: 13 JSON files; 6 pass, 4 remediated, 3 blocked.

`posing`: 42 JSON files; 5 pass, 37 remediated; 0 blocked.

`ugc`: 28 JSON files; 6 pass, 22 remediated; 0 blocked.

All non-blocked files are valid pretty-printed JSON with matching `name` and filename basename, required core prompt fields, `reference_elements`, `omni_video_prompt`, and required policy metadata. The remaining three indie files are the only schema gaps and remain explicitly blocked.
