# proj_teleprompter_01 — Workflow Log

**Project:** Teleprompter Test Edit — Solo Flows  
**Influencer:** Solo Flows Official  
**Platform:** TikTok (1080×1920, vertical)  
**Source:** `footage/Teleprompter-2026-17-01_23-07-28.mp4` — 125.67s raw talking-head  
**Target:** ~85-90s social-ready clip, 1.2x paced, jump cuts, ≤1.8s segments  
**Language:** English (video content), scripts in English  
**Last updated:** 2026-05-15  

---

## Pipeline Status

| Phase | Name | Status | Output |
|-------|------|--------|--------|
| 0 | Rough Cut + Transcription | ✅ Done | `footage/main_clean_2.mp4` (87.5s) · `logs/whisperx_word_transcript.json` · `logs/sentence_transcript.json` |
| 1 | Semantic Cut + Zoom | ✅ Done | `segments/cut_plan.json` · `segments/zoom_plan.json` · `segments/seg_000–064.mp4` · `segments/zoomed/seg_000–064_zoom.mp4` |
| 2 | B-roll Resolution | ✅ Done | `broll_renders/br_00–08.mp4` (9 clips) · `broll_renders/broll_timestamp.json` · `broll_renders/broll_sfx_timestamp.json` · `broll_renders/br_00–08_trim.mp4` · `broll_renders/broll_concat_exact.json` — **phase-3-threejs**: br_01, br_05, br_08 rebuilt with Three.js 3D |
| 3 | A-roll Overlay | ✅ Done | `aroll_renders/ar_00–06.mov` (6 ProRes 4444 alpha clips) · `aroll_renders/base_zoomed.mp4` · **`aroll_renders/aroll_footage.mp4`** (H.264, viewable) · `aroll_renders/aroll_timestamp.json` · `aroll_renders/aroll_sfx_timestamp.json` (pending SFX pass) |
| 4 | Subtitles | ↳ merged into Phase 5 | — |
| 5 | Assembly | ✅ Done | `output/assembled_broll.mp4` · `output/assembled_sub.mp4` · `subtitles/subtitle_overlay.mov` (ProRes 4444, 123MB) · **`output/proj_teleprompter_01_final.mp4`** (H.264, 64MB, 71.204s) |

---

## File Map

```
proj_teleprompter_01/
├── footage/
│   ├── Teleprompter-2026-17-01_23-07-28.mp4   ← ORIGINAL (never modify)
│   ├── main_clean_2_raw.mp4                    ← Phase 0 concat before speed-up (104.931s)
│   ├── main_clean_2.mp4                        ← Phase 0 FINAL — 1.2× speed (87.512s) ← Phase 1 input
│   ├── rough/                                  ← Phase 0 include-region parts (part3_000–021)
│   │   └── concat3.txt
│   ├── whisperx_word_check.mp4                 ← Phase 0 verification: word subtitles burned on clean video
│   └── zoom_check.mp4                          ← Phase 1 verification: all zoomed segments merged + subtitles
├── logs/
│   ├── analysis.json                           ← MASTER config: exclude_regions, broll_moments, pacing
│   ├── gemini_analysis.json                    ← Gemini 2.5 Flash raw: 10 issues detected
│   ├── transcript.json                         ← WhisperX on original 125.67s source
│   ├── rough_cut.log                           ← Phase 0 cut log
│   ├── silences.txt                            ← ffmpeg silencedetect output
│   ├── script.txt                              ← raw transcript text
│   ├── source_audio.mp3                        ← extracted audio for original WhisperX pass
│   ├── whisperx_clean/
│   │   └── main_clean_2.json                  ← WhisperX direct on main_clean_2.mp4 (ground truth)
│   ├── whisperx_word_check.srt                 ← Phase 0 word SRT (from whisperx_clean)
│   ├── whisperx_word_transcript.json           ← Phase 0 output · 216 words · start/end/score ← Phase 1 input
│   ├── sentence_transcript.json               ← Phase 0 output · 20 sentences ← Phase 1 input
│   └── zoom_check.srt                         ← Phase 1 verification SRT (accumulated actual durations)
├── scripts/
│   ├── combine_analysis.py                     ← Phase 0: Gemini+WhisperX → analysis.json
│   ├── build-transcripts.js                    ← Phase 0: whisperx_clean → word/sentence transcripts
│   ├── burn-whisperx-check.js                  ← Phase 0: burns whisperx_word_check.mp4 for verification
│   ├── cut-segments.js                         ← Phase 1: cut_plan.json → seg_NNN.mp4
│   ├── zoom-merge-check.js                     ← Phase 1: zoom_plan.json → zoomed segments + check video
│   ├── fix-zoom-srt.js                         ← utility: regenerate SRT from ffprobe actual durations
│   ├── map-broll-timestamps.js                 ← Phase 5 util (deprecated): nominal concat mapping (use compute-exact instead)
│   └── compute-exact-timestamps.js             ← Phase 5 util: ffprobes all 65 segments → exact concat positions + scale correction → broll_concat_exact.json
├── segments/
│   ├── cut_plan.json                           ← Phase 1 output: 65 segments · start/end/text/reason
│   ├── zoom_plan.json                          ← Phase 1 output: 65 zoom levels · type/reason
│   ├── seg_000.mp4 … seg_064.mp4              ← Phase 1 output: raw cut segments (65 files)
│   ├── zoomed/
│   │   └── seg_000_zoom.mp4 … seg_064_zoom.mp4 ← Phase 1 output: zoom-applied segments (65 files)
│   └── concat_zoom.txt                         ← ffmpeg concat list for zoomed segments
├── brief.json                                  ← project brief
└── edit_instructions.json                      ← edit spec (v3.0)
```

---

## Phase 0: Rough Cut — Full Detail

### Goal
Remove false starts, stumbles, and repeated phrases from the raw 125.67s recording. Apply pacing (50% gap reduction + 1.2x speed-up). Output: clean continuous video.

### Tools Used
- **WhisperX** (Python CLI): word-level timestamps for the full recording → `logs/transcript.json`
- **Gemini 2.5 Flash** (Vertex AI, via task runner): audio analysis for false starts, stumbles, repeats → `logs/gemini_analysis.json`
- **combine_analysis.py**: maps Gemini detections to precise word boundaries from WhisperX, builds `exclude_regions` in `analysis.json`
- **FFmpeg**: extract include regions, concatenate parts, apply speed

### Transcription (WhisperX)
```
Output: logs/transcript.json
  - 227 words with start/end timestamps and alignment scores
  - 21 sentence-level segments
  - Key: word-level precision for exact boundary detection
```

### Gemini Analysis (10 issues detected)
Gemini 2.5 Flash received the raw audio and returned issues in its own compressed timeline (timestamps ~4.0–4.4× smaller than actual audio time). Each issue has:
- `type`: `false_start` | `stumble` | `repeat`
- `from` / `to`: Gemini-time (NOT actual audio time)
- `keep_from`: Gemini-time of clean restart (for false_start and repeat)

**CRITICAL — Gemini timestamp compression:**  
Gemini timestamps are NOT real audio times. They use a non-linear compression calibrated from 3 anchors:
```
g=0.0  → actual=0.0s
g=3.55 → actual=13.24s   (WhisperX word "why" at 13.237)
g=11.95→ actual=47.07s   (WhisperX word "If"  at 47.071)
g=22.30→ actual=98.06s   (existing analysis anchor)
```
Conversion: linear interpolation between anchors via `scale_gemini()` in `combine_analysis.py`.

### combine_analysis.py Logic

**False start handling:**
1. Scale `keep_from` (Gemini time → actual time)
2. Find the inter-word gap nearest to that actual time using `nearest_gap_before()`
3. Exclude from: `gap_start + 0.05s`, to: `gap_end - 0.05s`
4. For large gaps (>1.0s): wider buffer: `gap_start + 0.2` to `gap_end - 0.32`
5. Key rule: **cut the false start WORDS themselves**, not just the silence gap after them

**Gap nearest search (`nearest_gap_before`):**
- Accepts gaps where `gap_start <= target + 0.5s` AND `gap_start >= target - 5.0s`
- Returns the gap with the LATEST `gap_start` (closest to target from below)
- This ensures we find the gap immediately preceding the clean restart word

**Repeat handling:**
- Check if repeat region already covered by existing `exclude_regions` (±1.0s tolerance)
- If covered → skip; if not → flag for manual review

**Stumble handling:**
- If `keep_from=null` → skip (no safe cut boundary, WhisperX captured the correct word)

### exclude_regions in analysis.json (22 total)

**Types:**
- `false_start`: full word removal — speaker started a phrase then restarted from the beginning
- `gap_50pct`: cut the first 50% of an inter-sentence silence gap >= 0.6s (pacing)
- `repeat`: cut the repeated take, keep only the final (clean) take

**All 22 regions (original source timestamps):**
```
[0.000-2.900]   false_start  — "Everyone is" (false) before "Everyone is shouting..." (clean)
[8.453-8.763]   gap_50pct
[12.476-13.237] false_start  — "about" before "why 99%"
[15.940-18.442] gap_50pct
[22.065-22.615] gap_50pct
[23.286-23.796] gap_50pct
[26.489-26.839] gap_50pct
[37.137-37.527] gap_50pct
[40.560-40.990] gap_50pct
[41.621-42.171] gap_50pct
[45.264-46.751] false_start  — "If you" before "if your character"
[47.071-47.962] false_start  — "If" word from WhisperX
[51.515-52.956] false_start  — "but" before "but zero personality"
[62.824-63.554] gap_50pct
[64.465-64.825] gap_50pct
[68.686-69.176] gap_50pct
[86.391-86.741] gap_50pct
[91.353-91.863] gap_50pct
[93.180-98.060] repeat       — "it ain't cheap" x3 → keep only last
[98.864-99.194] gap_50pct
[111.634-111.974] gap_50pct
[115.558-115.918] gap_50pct
```

### The "Everyone" False Start — Special Case

**Problem:** The recording opens with the speaker saying "Everyone is" (false start), pausing, then saying "Everyone is shouting at you..." (clean restart). WhisperX sees only ONE "Everyone" word (at 2.187s) because it mapped the timestamp to the false start instance. The clean "Everyone" lives in the gap between 2.788s–3.849s ("is" starts at 3.849s).

**Rule applied:** Cut from 0.0 → 2.9s (NOT 0.0 → 3.849s).
- Cutting to 2.9 leaves ~0.95s before "is" where the clean "Everyone" audio resides
- Cutting to 3.849 would remove the subject noun ("Everyone") leaving "is shouting at you" — grammatically broken

**Lesson:** When the false start word ALSO appears in the clean restart, do NOT cut past the gap midpoint. Cut to just before the end of the gap so the clean instance survives.

### Gap Reduction Logic

For each inter-sentence silence gap >= 0.6s (from `analysis.json silence_gaps`):
- Cut the **first 50%** of the gap
- Expressed as an `exclude_region` with reason `gap_50pct`
- Leave the second 50% as natural breathing room between sentences

### Phase 0 FFmpeg Pipeline

**Step 1 — Extract include regions from exclude_regions:**
```python
# Invert exclude_regions to get include_regions
# For each include region: ffmpeg -ss {start} -to {end} -i source.mp4 -c:v libx264 -crf 18 -c:a aac footage/rough/part3_{n:03d}.mp4
```

**Step 2 — Concatenate parts:**
```
ffmpeg -f concat -safe 0 -i footage/rough/concat3.txt -c copy footage/main_clean_2_raw.mp4
# Result: 104.931s (pre-speed)
```

**Step 3 — Apply 1.2× speed:**
```
ffmpeg -i main_clean_2_raw.mp4 \
  -filter_complex "[0:v]setpts=PTS/1.2[v];[0:a]atempo=1.2[a]" \
  -map [v] -map [a] \
  -c:v libx264 -crf 18 -preset fast \
  -c:a aac -ar 44100 \
  footage/main_clean_2.mp4
# Result: 87.512s
```

### Phase 0 Output Verification
- Duration: 87.512s (125.67s source → 104.931s after cuts → 87.512s after 1.2×)
- Resolution: 1080×1920 (source was already vertical)
- No false starts audible
- "Everyone is shouting..." intact at the start
- No "why nine", "If you", "but zero" visible
- Faster pacing confirmed

### Phase 0 — Step 4: WhisperX Re-transcription on Clean Video

**Why:** The original `transcript.json` maps timestamps against the 125.67s source. After Phase 0 cuts + 1.2× speed-up, timestamps drift — especially in the final third of the video. A derived mapping (`orig_to_final()`) accumulates error. WhisperX run directly on `main_clean_2.mp4` gives word-level timestamps that are accurate and verified.

**Tool:** WhisperX 3.8.5 · model `large-v2` · language `en` · compute_type `int8`

```
whisperx footage/main_clean_2.mp4 --model large-v2 --language en \
  --output_format json --output_dir logs/whisperx_clean/ --compute_type int8
```

**Output:** `logs/whisperx_clean/main_clean_2.json` — 216 words · 20 segments

**Build transcripts** via `scripts/build-transcripts.js`:

```
node scripts/build-transcripts.js
```

Writes:
- `logs/whisperx_word_transcript.json` — 216 words with `word`, `start`, `end`, `score` aligned to `main_clean_2.mp4`
- `logs/sentence_transcript.json` — 20 sentences with `id`, `text`, `start`, `end`, `duration`, `word_count`, `words`

**Verification:** Burn word subtitles onto video and confirm sync:
```
node scripts/burn-whisperx-check.js   → footage/whisperx_word_check.mp4
```

**Sentence breakdown (Phase 1 input):**
```
[0.39-4.63]   4.24s  "Everyone is shouting that you need to launch an AI influencer..."
[4.94-13.12]  8.19s  "But no one is telling you the ugly truth about why 99%..."
[13.36-15.97] 2.60s  "Number one, most AI influencers fail."
[16.29-21.87] 5.58s  "The market is getting flooded with low effort, dead-eyed avatars..."
[22.63-24.55] 1.92s  "using a tool with building a brand."
[24.91-27.14] 2.22s  "Just because she moves doesn't mean she matters."
[27.30-30.64] 3.34s  "Number two, content comes fast, AI comes late."
[30.66-36.84] 6.18s  "Your character has photorealistic skin, zero personality..."
[37.22-39.69] 2.46s  "She's just a digital screensaver, not creator."
[40.43-41.85] 1.42s  "You cannot automate a soul."
[42.23-45.89] 3.66s  "Number three, your personal taste is the only competitive advantage."
[46.33-50.65] 4.32s  "Everyone has access to the same tools, Midjourney, Kling, Luma..."
[51.45-52.29] 0.84s  "Nano Banana Bro."
[52.59-60.26] 7.66s  "So the only thing separating a viral sensation from a cringe bot..."
[60.58-63.16] 2.58s  "The AI is the brush, but you are still the artist."
[63.58-65.92] 2.34s  "And finally, number four is the identity."
[66.24-76.34] 10.10s "Between high-end GPU costs, multiple subscriptions..."
[76.64-79.36] 2.72s  "You are building a media startup, not playing a video game."
[79.68-79.88] 0.20s  "So,"
[80.48-86.02] 5.53s  "If you're going to do it, stop treating it like a cheat code..."
```

### Phase 0 Outputs — Required Before Phase 1

| File | Role in Phase 1 |
|------|----------------|
| `footage/main_clean_2.mp4` | Source video that gets sliced into segments |
| `logs/whisperx_word_transcript.json` | Word-level timestamps — drives all segment start/end boundaries |
| `logs/sentence_transcript.json` | Sentence structure — informs semantic split decisions |

All three must exist and be verified (use `whisperx_word_check.mp4` to visually confirm
timestamp alignment) before Phase 1 begins.

---

## Phase 1: Semantic Cut + Zoom — Full Detail

### Goal

Read the Phase 0 transcripts, decide cut points semantically, assign per-segment zoom levels,
then apply both to produce ready-to-assemble segments. Each segment = one visual flash on screen
with its own crop zoom baked in.

### Step 1 — Claude Semantic Analysis → cut_plan.json

Claude reads both transcript files and produces `segments/cut_plan.json` with full editorial reasoning per segment.

**Segment cutting rules (see `Segment logic.md` for full spec):**
1. Max 5 words per segment — longer phrases must be split at semantic boundary
2. Enumeration items: each item in a list = its own segment (e.g. "Midjourney," / "Kling," / "Luma,")
3. Section headers ("Number one,", "Number two,") = isolated segment, rhythm parity
4. Adverbs and connectors ("And finally,", "So,") = isolated at major rhetorical transitions
5. Emphasis isolation: punchy short phrases get maximum weight when isolated ("You cannot" / "automate" / "a soul.")
6. Never split mid-compound ("dead-eyed avatars" stays together)
7. Timestamps from `whisperx_word_transcript.json` — start = first word's start, end = last word's end

**Result:** 65 segments · 0.3s–2.9s each · covers 0.391s → 86.015s of the 87.512s video

`cut_plan.json` structure:
```json
{
  "source": "main_clean_2.mp4",
  "source_duration": 87.512,
  "total_segments": 65,
  "generated_by": "claude-semantic-analysis-v2",
  "rules_applied": [...],
  "segments": [
    {
      "id": 0,
      "start": 0.391,
      "end": 1.352,
      "duration": 0.961,
      "text": "Everyone is shouting",
      "reason": "Subject + verb — hook opener, cut before subordinate clause"
    },
    ...
    {
      "id": 64,
      "start": 84.932,
      "end": 86.015,
      "duration": 1.083,
      "text": "like a business.",
      "reason": "Final landing — CTA close. Video ends here"
    }
  ]
}
```

### Step 2 — FFmpeg Cut → seg_000.mp4 … seg_064.mp4

`scripts/cut-segments.js` reads `cut_plan.json` and cuts each segment using input-side seek + re-encode for timestamp accuracy:

```
ffmpeg -ss {start} -i footage/main_clean_2.mp4 \
  -t {duration} \
  -c:v libx264 -crf 18 -preset fast \
  -c:a aac -ar 44100 \
  -avoid_negative_ts make_zero \
  -y segments/seg_{NNN}.mp4
```

**Why `-ss` before `-i`:** fast seek to keyframe near target, then re-encode from exact point. Accurate for short clips (some as brief as 0.3s) without decoding from start each time.

**Result:** 65 segments cut · 0 failures · total segment output ~130MB

```
node scripts/cut-segments.js
```

### Step 3 — Zoom Plan → zoom_plan.json

Claude reads `cut_plan.json` and assigns a zoom level to every segment based on its semantic role.

**Zoom levels and their meaning:**

| Level | Type | Usage |
|-------|------|-------|
| 100% | Default | Narrative sentences, lead-in clauses, context phrases |
| 105% | Elevated / First / Last | Mild emphasis, section openers; always first + last segment |
| 110% | Elevated | Key descriptors, contrast terms, CTA build verbs |
| 115% | Emphasis | Punchy verdicts, thesis statements, punchlines, landing words |
| 120% | Peak | Most important enumeration item, single-verb max isolation |

**Constraints:**
- No two consecutive segments at the same zoom level
- First segment (id=0): always 105%
- Last segment (id=64): always 105%

**Enumeration pattern** — ascending within each list:
- 3-item list: 105 → 110 → 120 (most important last)
- 4-item list: 110 → 105 → 100 → 120 (descend then spike on punchline)

**FFmpeg zoom implementation** — center crop + scale:
```
zoom 115% → crop=939.1:1669.6:70.4:125.2,scale=1080:1920:flags=lanczos
zoom 120% → crop=900:1600:90:160,scale=1080:1920:flags=lanczos
```
Formula: `crop = (W/factor):(H/factor):((W-W/factor)/2):((H-H/factor)/2)` then `scale=1080:1920`

### Step 4 — Apply Zoom → zoomed segments

`scripts/zoom-merge-check.js` applies the zoom filter to each `seg_NNN.mp4`:

```
ffmpeg -i seg_NNN.mp4 \
  -vf "crop={cw}:{ch}:{cx}:{cy},scale=1080:1920:flags=lanczos" \
  -c:v libx264 -crf 18 -preset fast -c:a aac -ar 44100 \
  segments/zoomed/seg_NNN_zoom.mp4
```

**Result:** 65 zoom-applied segments in `segments/zoomed/` · 0 failures

> **SRT drift note:** Re-encoded segments are consistently 33–61ms longer than the
> planned duration (FFmpeg keyframe boundary padding). Over 65 segments this adds
> ~3.16s. Always use `ffprobe` actual durations when building any SRT from these
> segments — never use `seg.duration` from the plan JSON. See `fix-zoom-srt.js`.

### Phase 1 Outputs

| File | Description |
|------|-------------|
| `segments/cut_plan.json` | 65-segment semantic manifest: id · start · end · duration · text · reason |
| `segments/zoom_plan.json` | 65-segment zoom decisions: zoom% · type · reason |
| `segments/seg_000–064.mp4` | Raw cut segments (source: main_clean_2.mp4, no zoom) |
| `segments/zoomed/seg_000–064_zoom.mp4` | Zoom-applied segments — these are the assembly-ready files |

**Verification artifact** (not a Phase 1 output, for human review only):
`footage/zoom_check.mp4` — all zoomed segments merged, subtitles show text + zoom% per cut.
Run `node scripts/zoom-merge-check.js` to regenerate.

---

## Key Rules and Lessons Learned

### Rule 1: Cut the Words, Not Just the Gap

**Wrong approach:** When removing a false start like "why nine / why 99%", cut only the silence gap BETWEEN them.  
**Correct approach:** Cut from the start of the false start WORDS to the start of the clean word.

```
WRONG: [false_start "why nine"] [GAP_CUT] [clean "why 99%"]
                                    ^^ only this deleted

RIGHT: [false_start "why nine" GAP_REGION] [clean "why 99%"]
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ all of this deleted
```

**Why:** Cutting only the gap leaves the bad words audible. The viewer hears "why nine why 99% of you..." which sounds like a stutter and breaks the performance.

### Rule 2: "Everyone" Preservation

When a false start word is IDENTICAL to the first word of the clean restart (e.g. "Everyone"), do NOT cut past the gap midpoint. Cut to a point that leaves enough audio for the clean instance to survive.

```
Original: [Everyone is (false)] [..gap 1.06s..] [Everyone is shouting (clean)]
Cut to 2.9s (not 3.849s): leaves ~0.95s for clean "Everyone" before "is"
```

### Rule 3: Gemini Timestamps Require Calibration

Gemini 2.5 Flash compresses audio time non-linearly. NEVER use Gemini timestamps directly. Always apply the `scale_gemini()` function with the 3-anchor linear interpolation.

If you add new Gemini analysis to this project, add new calibration anchors by finding the corresponding WhisperX word for a known Gemini timestamp.

### Rule 4: Gap-50pct Only Covers Sentence Gaps >= 0.6s

The 50% gap reduction cuts the first half of pauses >= 0.6s between sentences (WhisperX segments). Shorter intra-sentence pauses are preserved as natural speech rhythm.

### Rule 5: Source File is the Original, Never a Clean Version

Always read exclude_regions timestamps against `footage/Teleprompter-2026-17-01_23-07-28.mp4` (125.67s).  
Phase 1 maps those timestamps through the exclude_regions to get `main_clean_2.mp4` time.

### Rule 6: Speed Factor Applied Last, Once

The 1.2× speed factor is applied in one step (Phase 0, Step 3). It is NOT applied again in Phase 1 or later. All segment timestamps in `cuts.json` are already in the 1.2×-sped final timeline.

### Rule 7: Silence Trim Uses Buffers

When trimming leading silence: keep `PRE_WORD_BUF = 0.10s` before the first word.  
When trimming trailing silence: keep `POST_WORD_BUF = 0.15s` after the last word.  
This preserves the natural breath and word-decay, preventing audio that sounds "clipped."

---

## analysis.json Reference

This is the master configuration file. All phases read from it.

```json
{
  "language": "english",
  "source_duration": 125.67,
  
  "major_sections": [
    { "title": "Hook",             "start_time": 1.74,  "end_time": 24.6  },
    { "title": "Number 1 — Dead-eyed avatars",  "start_time": 24.6,  "end_time": 41.64 },
    { "title": "Number 2 — Content first, AI later", "start_time": 42.74, "end_time": 64.48 },
    { "title": "Number 3 — Personal taste",    "start_time": 65.34, "end_time": 91.42 },
    { "title": "Number 4 — It ain't cheap",    "start_time": 92.44, "end_time": 123.68 }
  ],
  
  "transition_times": [24.6, 42.74, 65.34, 92.44],   // original source times
  
  "broll_moments": [
    { "start_time": 24.6,  "end_time": 31.12,  "keyword": "AI avatar flooded social media low effort" },
    { "start_time": 46.62, "end_time": 60.18,  "keyword": "digital screensaver phone no soul" },
    { "start_time": 69.46, "end_time": 75.84,  "keyword": "AI tools MidJourney Kling Luma equal access" },
    { "start_time": 99.56, "end_time": 109.0,  "keyword": "GPU cost subscriptions capital investment" },
    { "start_time": 110.5, "end_time": 118.0,  "keyword": "media startup not video game serious business" }
  ],
  
  "emphasis_moments": [
    { "start_time": 38.06, "end_time": 41.64, "phrase": "Just because she moves doesn't mean she matters." },
    { "start_time": 61.02, "end_time": 64.48, "phrase": "You cannot automate a soul." },
    { "start_time": 88.14, "end_time": 91.42, "phrase": "The AI is the brush, but you are still the artist." },
    { "start_time": 119.56,"end_time": 123.68,"phrase": "Stop treating it like a cheat code and start treating it like a business." }
  ],
  
  "pacing": {
    "gap_reduction": 0.5,   // cut first 50% of silences >= 0.6s
    "speed_factor": 1.2     // applied in Phase 0 Step 3, never again
  },
  
  "exclude_regions": [ ... ]  // 22 entries, see above
}
```

**IMPORTANT:** `broll_moments` and `emphasis_moments` timestamps are in ORIGINAL SOURCE time (125.67s). For Phase 2+ use, these need to be mapped through `orig_to_final()` just like words were mapped in Phase 1.

---

## semantic_notes in analysis.json

```json
{
  "time": 69.46,
  "note": "Whisper misheard tool names: 'Midori' = MidJourney, 'Nano Banana Bro' = Nano Banana. Transcription artifact, not a speaker error. Do not cut."
}
```

The segment text `seg_039` shows "Nano Banana Pro." — this is the WhisperX mishear of "Nano Banana." Do NOT treat this as a false start or error.

---

## Next Steps (Phase 2+)

### Phase 2: B-roll Resolution

**Agents:** Motion Video Designer → SFX Artist (sequential)
**Invoke:** `/motion-video-designer` then `/sfx-artist`, or spawn via Agent tool

#### Step 1 — Motion Video Designer

Reads `segments/cut_plan.json` and the template MOC at:
```
D:\1. SOLOFLOWS\INHOUSE TEAMS\2. Media Team\5. Video Hub\motion-researcher\output\Motion Video Template\MOC.md
```

**Segment selection — 5-pass algorithm:**

**Pass 1 — Group sentences:** boundary = `.`/`!`/`?` in `text` OR gap ≥ 0.45s between segments. Label `S0, S1, S2, ...`

**Pass 2 — Score + Visualizability gate (both must pass):**

*Visualizability gate (hard gate, evaluated first):*
A sentence passes if it has at least one of: concrete noun/brand that can be rendered (GPU, Midjourney logo, screensaver), a stat/number (99%, $2,840), a clear contrast with two renderable sides, or a strong emotion/metaphor pairing with abstract motion.
A sentence FAILS if it is pure section framing ("Number one,"), a conditional setup with no visual anchor ("So, if you're going to do it,"), or an orphaned clause whose meaning depends on adjacent speech.
Sentences that fail visualizability are excluded regardless of score.

*Algorithmic score (applied only to visualizability-passing sentences):*

| Feature | Score |
|---|---|
| Duration ≥ 3.5s | +3 |
| Duration 2.5–3.5s | +1 |
| Stat / specific number | +2 |
| Named entity (Midjourney, Kling, Luma, NVIDIA) | +2 |
| Descriptive noun (avatar, GPU, media, startup, screensaver) | +2 |
| Comparison / contrast ("like a", "not a", "but you") | +1 |
| Metaphor (brush/artist, cheat code, weapon) | +1 |
| Section header ("Number one,") | −3 |
| Short punchy emotional fragment (< 1.5s) | −2 |

Threshold: **score ≥ 4** to be eligible.

**Pass 3 — Select slots:** After 4–5s of A-roll without a B-roll, the next eligible sentence (passes both filters) opens a slot. If winning sentence > 6s: truncate template to scene-01 only and set `hyperframes.json` duration to the adapted target. If < 3s: merge with next sentence if combined ≤ 6s and coherent. Sentence integrity overrides duration — never end mid-sentence.

**Pass 4 — Template matching:** read MOC.md, assign one template per slot, maximize variety (no template used twice). When the content signal maps to a 3D-native category (isometric build, geometric transformation, orbiting/abstract), use the **Three.js custom template pattern** (see below) instead of a flat CSS approximation.

| Content signal | Template category | Render method |
|---|---|---|
| Stat / 99% | Hero Stat Reveal | CSS/GSAP |
| Market flooding / avatars | Isometric City Build | **Three.js** |
| Human vs AI content | Split Screen Comparison | CSS/GSAP |
| Soul / philosophical | Abstract Color Field | CSS/GSAP |
| Named AI tools + logos | Dynamic Product Visualization | CSS/GSAP |
| Personal taste / eye / aesthetics | Abstract Geometric Transformation | **Three.js** |
| GPU costs / subscriptions | Technical Blueprint Reveal | CSS/GSAP |
| Media startup / dashboard | Soft UI Dashboard | CSS/GSAP |
| Cinematic CTA / "STOP." | Cinematic Title Card | CSS/GSAP |
| Abstract orbit / business momentum | Orbiting Torus Rings | **Three.js** |

**Pass 4b — Three.js Integration Pattern** (use when template category is Three.js above):

Three.js renders deterministically via GSAP's `onUpdate` callback — no `requestAnimationFrame`, no animation loop.

```html
<!-- 1. Add Three.js CDN in <head> after GSAP -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- 2. Canvas container div — receives Three.js canvas as child -->
<div id="canvas-wrap" class="clip" data-start="0" data-duration="{duration}" data-track-index="0"
     style="position:absolute; top:0; left:0; width:1080px; height:1920px; z-index:0;"></div>

<!-- 3. HTML text elements sit above canvas via z-index:10 -->
```

```js
// 4. Renderer setup
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1080, 1920);
renderer.setPixelRatio(1);                              // deterministic pixel output
renderer.setClearColor(0x1C1C1E);
document.getElementById('canvas-wrap').appendChild(renderer.domElement);

// 5. GSAP timeline drives ALL rendering via onUpdate
var tl = gsap.timeline({
  paused: true,
  onUpdate: function () {
    // Any camera-position logic here (fires every tick before render)
    renderer.render(scene, camera);
  }
});
window.__timelines = window.__timelines || {};
window.__timelines['{composition-id}'] = tl;

// 6. Render initial frame (before timeline starts)
renderer.render(scene, camera);

// 7. Animate Three.js objects directly via GSAP — no manual RAF
tl.to(group.scale, { y: 1, duration: 0.45, ease: 'back.out(1.3)' }, 0.2);
tl.to(mesh.rotation, { y: Math.PI * 4, duration: 3.0, ease: 'none' }, 0.2);
```

**Key rules for Three.js compositions:**
- No `requestAnimationFrame` / `setInterval` — GSAP timeline IS the render loop
- `renderer.setPixelRatio(1)` — ensures frame-exact pixel output in headless renderer
- Deterministic positions only — no `Math.random()`. Use `Math.sin(i * constant)` seeding or explicit arrays
- `group.scale.y = 0` in Three.js setup (before timeline) → GSAP animates from that value to 1
- Long rotations: use large target angles (`Math.PI * 4`) instead of `repeat: -1` for deterministic seeks
- Camera orbit: animate a `{ angle: val }` object, recompute `camera.position.x/z` in `onUpdate` before render

**Camera presets used in this project:**

| Use case | Camera type | Position | LookAt |
|---|---|---|---|
| Isometric city | `OrthographicCamera` fH=560 fW=315 | (560, 560, 560) | (0, 80, 0) |
| 3D geometry / fragments | `PerspectiveCamera` fov=58 | (0, 0, 520) | (0, 0, 0) |
| Orbiting rings | `PerspectiveCamera` fov=55 | (0, 0, 620) | (0, 0, 0) |

**Five.js group-pivot building rise pattern:**
```js
var group = new THREE.Group();
group.position.set(x, 0, z);            // pivot at ground level
var geo = new THREE.BoxGeometry(w, h, d);
geo.translate(0, h / 2, 0);             // mesh center → top half, base stays at y=0
var mesh = new THREE.Mesh(geo, mat);
group.add(mesh);
group.scale.y = 0;                       // start flat
scene.add(group);
tl.to(group.scale, { y: 1, duration: 0.46, ease: 'back.out(1.3)' }, delay);
```

**Pass 5 — Visual Asset Protocol:** for every slot with a brand/product entity, WebSearch → WebFetch SVG → save to `br_{N}_comp/assets/logos/{brand-slug}.svg` → adjust fill/stroke for background color.

**Template duration adaptation:**
- Template shorter than slot → extend: hold final scene state, push fade-out to slot duration
- Template longer than slot → truncate: scene-01 only, move fade-out to slot duration

**Target:** 8–10 slots for a 60–90s video. Quality over quantity.

**For each selected slot (numbered `br_00`, `br_01`, ...):**
- Create `broll_renders/br_{N}_comp/` — full HyperFrames project
- Write `index.html` following the chosen template spec
- Run `npm run check` (0 errors required)
- Render: `cd broll_renders/br_{N}_comp && npm run render`
- Output clip: `broll_renders/br_{N}.mp4`

**Final output:** `broll_renders/broll_timestamp.json`
```json
{
  "project": "proj_teleprompter_01",
  "total_brolls": 9,
  "brolls": [
    {
      "id": "br_00",
      "start": 4.936,
      "end": 10.080,
      "slot_duration": 5.144,
      "render_duration": 5.267,
      "segments_covered": [4, 5, 6],
      "sentence_text": "But no one is telling you the ugly truth about why 99%",
      "template_channel": "SchoolofMotion",
      "template_name": "11-Hero-Stat-Reveal-Scene",
      "template_category": "stat-reveal",
      "adaptation": "extended — template 4s → slot 5.234s",
      "logos_used": null,
      "screen_capture_url": null,
      "composition_dir": "broll_renders/br_00_comp",
      "render": "broll_renders/br_00.mp4",
      "render_verified": true
    }
  ]
}
```
`slot_duration` = source coverage (`end − start`). `render_duration` = ffprobe-verified MP4 length. `render_verified: true` only after ffprobe confirms h264 + duration within ±0.5s of `slot_duration`.

#### Step 2 — SFX Artist

Reads `broll_renders/broll_timestamp.json` and each composition's `index.html` to understand the visual motion energy.

Assigns SFX per B-roll: entry sound (at `start`) + optional accent at peak motion. Maps motion type and energy level to SFX files.

**Output:** `broll_renders/broll_sfx_timestamp.json`
```json
{
  "project": "proj_teleprompter_01",
  "brolls": [
    {
      "id": "br_00",
      "start": 4.936,
      "sfx": [
        { "file": "transition/swoosh.mp3", "offset_sec": 0.0, "volume": 0.4, "reason": "particle emergence — kinetic entry" }
      ]
    }
  ]
}
```

#### Phase 2 Outputs

| File | Description |
|------|-------------|
| `broll_renders/br_{N}_comp/` | HyperFrames project folder per B-roll |
| `broll_renders/br_{N}.mp4` | Rendered B-roll clip (3–6s, 1080×1920, 30fps) |
| `broll_renders/broll_timestamp.json` | Start/end/segments/template per B-roll |
| `broll_renders/broll_sfx_timestamp.json` | SFX file + offset + volume per B-roll |

### Phase 3: A-roll Overlay

**Agent:** Motion Video Designer (invoke `/design-motion-overlay` skill) → SFX Artist (sequential)
**Invoke:** motion-video-designer with `/design-motion-overlay`, then `/sfx-artist`

#### Concept

All segments NOT covered by a B-roll are grouped into **A-roll clusters** — consecutive segment runs between B-rolls. Each cluster gets one transparent HyperFrames motion overlay (glass card design) positioned in the **bottom 1/3** of the frame (1280–1920px). The overlay displays the cluster's text as animated captions on top of the talking-head video.

The main video is always visible. The glass card floats on top, transparent background, for the full cluster duration.

#### Overlay Type Selection

Choose the overlay type based on what the cluster is *showing*, not what it's *saying*. Same card structure applies to all types; only the interior content component changes.

| Type | When to use | Key components |
|---|---|---|
| **Glass Card** | Narrative captions, conversational segments, flowing sentences | Multi-line text with bold/accent/muted spans, optional divider, optional badge |
| **Comparison Chart** | Two things being contrasted ("content vs AI", "human vs bot", "fast vs slow") | Two columns, dual progress bars with different fill speed, labels, vs-separator |
| **Stat Hero** | Single dominant number or percentage ("99% fail", "3x faster") | Giant stat (80–120px), supporting label below, optional thin bar showing proportion |
| **Ranked List** | Numbered points or items ("Number 1, 2, 3") | Numbered rows with index (accent color), text column, optional progress or weight bar |
| **Data Table** | Cost breakdowns, multi-field comparisons, 2–4 row factual data | 2-column table (label | value), subtle row dividers, values in accent or bold |
| **Logo Card** | Named tools or brands mentioned ("MidJourney, Kling, Luma") | SVG logo + brand name text, arranged in a horizontal or grid layout |
| **Process Flow** | Sequential steps, timelines ("ideate → write → post") | Left-to-right connected nodes with arrows or dotted lines |

**Rules for all types:**
- Always use the same card container (dark navy, cyan left border, grain + shimmer)
- Always animate the CONTENT to match spoken word timing (`rel=` offset from cut_plan.json)
- Always fade out 0.5s before cluster end
- Low-contrast elements (muted AI column, brand watermark) are intentional — not WCAG errors

---

#### Design Language — Glass Card (proj_teleprompter_01)

The design system used for this project is a **dark navy glass card** adapted from the news-summery-editing workflow:

| Property | Value |
|---|---|
| Card background | `rgba(10,14,26,0.88)` |
| Border | `1px solid rgba(34,211,238,0.18)` + `border-left: 3px solid #22d3ee` |
| Border radius | `20px` |
| Box shadow | `0 0 48px rgba(34,211,238,0.07), 0 12px 48px rgba(0,0,0,0.75)` |
| Edge glow | `#22d3ee` strip, `box-shadow: 0 0 18px 3px rgba(34,211,238,0.7)` |
| Grain overlay | SVG `feTurbulence` fractalNoise, `baseFrequency=0.65`, `opacity=0.10` |
| Shimmer | `linear-gradient(120deg, ... rgba(255,255,255,0.50) ...)`, `mix-blend-mode: overlay` |
| Font | Inter 500, 38–40px, `color: rgba(230,238,255,0.88)`, `line-height: 1.38–1.40` |
| Bold spans | `font-weight: 700`, `color: #ffffff` |
| Accent spans | `font-weight: 700`, `color: #22d3ee`, `text-shadow: 0 0 24px rgba(34,211,238,0.45)` |
| Muted spans | `color: rgba(230,238,255,0.60)` |
| Divider | `1px` line, `background: linear-gradient(90deg, rgba(34,211,238,0.55), transparent)` |
| Badge | `background: rgba(34,211,238,0.10)`, `border: 1px solid rgba(34,211,238,0.35)`, pill shape |
| Brand tag | `SOLOFLOWS` watermark, `color: rgba(34,211,238,0.22)`, `font-size: 13px`, bottom-right |

**Card sizing rules:**
- Standard (2–3 lines): `padding: 32px 48px 32px 44px`
- Dense (4+ lines): reduce padding to `28px` and font-size to `38px` to fit in the 640px band

**GSAP animation sequence per cluster:**
```
0.00s  grain opacity → 0.10 (grain animation starts)
0.08s  card: y 32→0, opacity 0→1 (power3.out, 0.38s)
0.18s  edge-glow: opacity 0→1 (0.30s)
0.28s  brand-tag: opacity 0→1 (0.28s)
0.28s  first caption line: y 14→0, opacity 0→1 (power2.out, 0.28s)
...    subsequent lines: staggered by spoken word timing (rel= from cut_plan.json)
       dividers animate width 0→100% at section breaks (power2.out, 0.36s)
       badges fade in at section entry points
(end-0.50s)  card: opacity→0, y→-8 (power2.in, 0.44s) ← fade-out
(end-0.50s)  brand-tag: opacity→0 (0.28s)
(end-0.40s)  grain: opacity→0 (0.30s, animation stops)
```

Shimmer fires once on the punchline line (boldest/most important caption). At t = (punchline_start + 0.15s): x '-130%'→'130%', opacity 0→1, 0.65s.

#### Step 1 — Cluster Detection

1. Load `broll_renders/broll_timestamp.json` → B-roll time ranges
2. Load `segments/cut_plan.json` → all 65 segments
3. A segment belongs to a B-roll if: `seg.start < broll.end AND seg.end > broll.start`
4. Group remaining segments into consecutive runs → each run = one A-roll cluster
5. **Skip clusters with only one segment shorter than 1.0s** — too short for an effective overlay

**proj_teleprompter_01 result (6 clusters, ar_04 skipped):**

| Cluster | Segments | Duration | Reason skipped? |
|---|---|---|---|
| ar_00 | [0,1,2,3] | 4.103s | — |
| ar_01 | [7,8,9,10] | 4.036s | — |
| ar_02 | [16,17,18,19,20] | 4.877s | — |
| ar_03 | [30,31,32] | 3.210s | — |
| ar_04 | [38] | 0.840s | skipped — single seg < 1.0s |
| ar_05 | [44,45,46,47,48,49,50] | 5.591s | — |
| ar_06 | [54,55,56] | 3.569s | — |

#### Step 2 — Line Splitting and Timing

For each cluster:
1. Merge all segment `text` values into one descriptive sentence
2. Split into 2–4 display lines (2–6 words per line) — preserve semantic units
3. Map each line's start time to the `rel=` offset from the cluster's first segment start
4. Lines with punchlines (key facts, verbs, metrics) → use `.accent` spans and trigger shimmer

**Relative timing source:** `cut_plan.json` segment `start` values.
```
line_rel_time = seg.start − cluster_first_seg.start
```

#### Step 3 — Build Composition

For each cluster:
1. Create `aroll_renders/ar_{N}_comp/` — copy `package.json` + `hyperframes.json` from `test-broll/`
2. Write `index.html`:
   - `data-composition-id="aroll-{N}"` on `#root`
   - `data-duration="{render_duration}"` = cluster source duration (derived from ffprobe actual zoomed segment durations)
   - Band container: `position: absolute; bottom: 0; left: 0; width: 1080px; height: 640px;`
   - Card: `position: absolute; top: 40px; left: 60px; width: 960px;` inside band
   - Add `data-layout-allow-overflow` on the card div and shimmer div (suppresses false-positive HyperFrames layout errors)
3. Run `npm run check` → 0 errors required (WCAG contrast warnings on brand watermark are intentional — ignore)
4. Render: `npm run render -- --format mov` → produces `renders/aroll-{N}.mov` (ProRes 4444, `yuva444p12le`)
5. Move to `aroll_renders/ar_{N}.mov`

**Why ProRes 4444 MOV (not WebM or chromakey):**
ProRes 4444 stores a full 12-bit alpha channel per pixel. Smooth GSAP fades and shimmer overlays composite pixel-perfectly. WebM VP9 may silently output `yuv420p` (no alpha) if transparent bg is not detected. Chromakey fails on semi-transparent pixels during fade-in/out causing green fringing. MOV is the correct approach for any composition with opacity animations.

#### Step 4 — Timestamps

**CRITICAL: A-roll timestamps must be computed from actual zoomed segment durations (ffprobe), NOT from `cut_plan.json` nominal durations.**

The zoomed segments (`segments/zoomed/`) are consistently 33–61ms longer than planned (FFmpeg keyframe padding). Over 65 segments this accumulates to ~3.16s drift. The `assembled_broll.mp4` scale factor is:

```
scale = actual_concat_duration / sum_of_ffprobed_segment_durations
      = 71.333 / 68.070 = 1.04794   (proj_teleprompter_01)
```

**proj_teleprompter_01 actual A-roll timestamps (asm_start values):**
```
ar_00: asm_start=0.000  asm_end=4.103   (segs 0–3,  render=3.924s)
ar_01: asm_start=9.273  asm_end=13.309  (segs 7–10, render=3.845s)
ar_02: asm_start=21.217 asm_end=26.093  (segs 16–20, render=4.644s)
ar_03: asm_start=34.874 asm_end=38.083  (segs 30–32, render=3.061s)
ar_05: asm_start=48.366 asm_end=53.956  (segs 44–50, render=5.261s)
ar_06: asm_start=59.305 asm_end=62.874  (segs 54–56, render=3.400s)
```

#### Design Language — Comparison Chart (proj_teleprompter_01 ar_02_v2)

Used when a cluster contrasts two things. Same card container as glass card; interior replaced with a two-column comparison.

```html
<div id="compare">
  <div class="cmp-col" id="col-content">
    <div class="cmp-label" id="lbl-content">Content</div>     <!-- accent color -->
    <div class="bar-wrap">
      <div class="bar-track"><div id="bar-content"></div></div>
      <span class="bar-pct" id="pct-content">FAST</span>
    </div>
    <div class="cmp-verdict" id="v-content">Comes first</div>
  </div>
  <div id="vs-sep">VS</div>
  <div class="cmp-col" id="col-ai">
    <div class="cmp-label" id="lbl-ai">AI</div>               <!-- muted color -->
    <div class="bar-wrap">
      <div class="bar-track"><div id="bar-ai"></div></div>
      <span class="bar-pct" id="pct-ai">LATE</span>
    </div>
    <div class="cmp-verdict" id="v-ai">Always behind</div>
  </div>
</div>
```

**Key GSAP rules for comparison charts:**
- Content bar fills quickly: `{ width:'86%', duration:0.60, ease:'power2.inOut' }` — confident, fast
- "Losing" bar fills slowly: `{ width:'28%', duration:1.15, ease:'power1.in' }` — the slow fill IS the visual metaphor
- The AI column items are intentionally low-contrast (muted colors) — this is a design choice, not a WCAG error
- VS separator fades in between the two column reveals (it's the pivot point of the comparison)

**Rendered test:** `aroll_renders/ar_02_v2.mov` — 4.667s, ProRes 4444 `yuva444p12le`

---

#### Step 5 — SFX Artist (Phase 3)

Reads `aroll_renders/aroll_timestamp.json` and each composition's `index.html`. Assigns per-cluster SFX. Same rules as Phase 2 except:
- Volume levels are **lower** (overlay is secondary layer): entry 0.20–0.30, accent 0.12–0.18
- Prefer `emphasis/pop.mp3` and `emphasis/tick.mp3` — subtle sounds that don't compete with the B-roll SFX
- No `transition/swoosh.mp3` for overlays — too dominant for a secondary layer

**Output:** `aroll_renders/aroll_sfx_timestamp.json`

#### Phase 3 Outputs

| File | Description |
|------|-------------|
| `aroll_renders/ar_{N}_comp/` | HyperFrames project per cluster overlay |
| `aroll_renders/ar_{N}.mov` | Rendered ProRes 4444 overlay (yuva444p12le, native alpha) |
| `aroll_renders/base_zoomed.mp4` | Concat of all 65 zoomed segments — assembly base for A-roll compositing |
| `aroll_renders/aroll_footage.mp4` | **Phase 3 viewable output** — base_zoomed + 6 overlays composited, H.264 |
| `aroll_renders/aroll_timestamp.json` | Cluster manifest with timestamps, render durations, design note |
| `aroll_renders/aroll_sfx_timestamp.json` | SFX per cluster (pending SFX pass) |

> **`aroll_footage.mp4` is the Phase 3 deliverable.** It is the base video with all A-roll overlays baked in, viewable by any player (H.264). The individual `.mov` files are kept as source layers for Phase 5 final assembly.
>
> **How it is built:**
> ```bash
> # Step 1 — concat zoomed segments
> ffmpeg -f concat -safe 0 -i segments/zoomed_concat.txt -c copy aroll_renders/base_zoomed.mp4
>
> # Step 2 — composite overlays
> ffmpeg -i base_zoomed.mp4 \
>   -i ar_00.mov -i ar_01.mov -i ar_02.mov -i ar_03.mov -i ar_05.mov -i ar_06.mov \
>   -filter_complex "
>     [1:v]setpts=PTS+{asm_start_0}/TB[ov0]; ... [6:v]setpts=PTS+{asm_start_5}/TB[ov5];
>     [0:v][ov0]overlay=0:0:eof_action=pass[v0];
>     ...
>     [v4][ov5]overlay=0:0:eof_action=pass[v5]
>   " \
>   -map "[v5]" -map 0:a -c:v libx264 -crf 18 -preset fast -c:a copy \
>   aroll_renders/aroll_footage.mp4
> ```
>
> **Rules:**
> - Always use `setpts=PTS+{asm_start}/TB` — never `-itsoffset` (see Assembly Rule 3)
> - Always use `eof_action=pass` — prevents last-frame ghosting after overlay ends
> - `base_zoomed.mp4` is rebuilt from `segments/zoomed_concat.txt` (65 segments) — NOT from `assembled_broll.mp4`

**`aroll_timestamp.json` schema:**
```json
{
  "project": "proj_teleprompter_01",
  "generated_by": "motion-video-designer",
  "generated_at": "ISO 8601",
  "total_clusters": 6,
  "design": "glass-card — dark navy rgba(10,14,26,0.88), cyan #22d3ee left border, grain overlay, shimmer sweep",
  "render_format": "mov (ProRes 4444 yuva444p12le)",
  "assembly_note": "setpts=PTS+{start}/TB + eof_action=pass on overlay filter",
  "clusters": [
    {
      "id": "ar_00",
      "segments_covered": [0, 1, 2, 3],
      "cluster_text": "Everyone is shouting that you need to launch an AI influencer right now to get rich.",
      "position": "bottom",
      "composition_dir": "aroll_renders/ar_00_comp",
      "render": "aroll_renders/ar_00.mov",
      "render_duration": 3.924,
      "asm_start": 0.000,
      "asm_end": 4.103,
      "asm_cluster_dur": 4.103,
      "render_verified": true
    }
  ]
}
```

### Phase 4: Subtitles

**Merged into Phase 5 — not a standalone phase.**

Subtitles are built and composited directly inside the Assembly step. See Phase 5 for the full subtitle spec.

### Phase 5: Assembly (Final)

**Agent:** Motion Video Designer + SFX Artist (subtitle and SFX baked in this pass)

#### Layer Stack

```
Base:    aroll_renders/aroll_footage.mp4   ← Phase 3 output (base_zoomed + A-roll overlays baked)
  ↑
Layer 1: B-rolls — full-frame overlay at timestamps from broll_concat_exact.json
  ↑
Layer 2: Subtitles — word-pop serif overlay (built in this phase, transparent webm)
  ↑
Audio:   original audio track + SFX mix + background music
```

**Tracking reference for timestamps:**
- Zoom positions: `segments/zoom_plan.json`
- Segment concat positions: `broll_renders/broll_concat_exact.json` (ffprobe-exact, scale-corrected)
- A-roll overlays are already baked into `aroll_footage.mp4` — no separate timestamp needed here

---

#### Step 1 — Apply B-rolls on top of aroll_footage.mp4

Base = `aroll_renders/aroll_footage.mp4` (71.27s, H.264).

Each B-roll uses `-itsoffset` to delay its stream read to the correct position, then `overlay` + `enable='between(t,...)'` + `eof_action=pass` to place it full-frame.

```bash
ffmpeg -y \
  -i aroll_renders/aroll_footage.mp4 \
  -itsoffset 4.128  -i broll_renders/br_00_trim.mp4 \
  -itsoffset 13.505 -i broll_renders/br_01_trim.mp4 \
  -itsoffset 26.274 -i broll_renders/br_02_trim.mp4 \
  -itsoffset 31.592 -i broll_renders/br_03_trim.mp4 \
  -itsoffset 38.309 -i broll_renders/br_04_trim.mp4 \
  -itsoffset 42.787 -i broll_renders/br_05_trim.mp4 \
  -itsoffset 53.913 -i broll_renders/br_06_trim.mp4 \
  -itsoffset 62.940 -i broll_renders/br_07_trim.mp4 \
  -itsoffset 67.139 -i broll_renders/br_08_trim.mp4 \
  -filter_complex "
    [1:v]scale=1080:1920[br0];
    [2:v]scale=1080:1920[br1];
    ...
    [9:v]scale=1080:1920[br8];
    [0:v][br0]overlay=0:0:enable='between(t,4.128,9.200)':eof_action=pass[v0];
    [v0][br1]overlay=0:0:enable='between(t,13.505,17.238)':eof_action=pass[v1];
    ...
    [v7][br8]overlay=0:0:enable='between(t,67.139,71.076)':eof_action=pass[v8]
  " \
  -map "[v8]" -map 0:a -c:v libx264 -crf 18 -preset fast -c:a copy \
  output/assembled_broll.mp4
```

**B-roll itsoffset table (broll_concat_exact.json, scale ×1.0485):**

| B-roll | itsoffset | enable start | enable end | clip_trim |
|--------|-----------|-------------|------------|-----------|
| br_00 | 4.128 | 4.128 | 9.200 | 5.072s |
| br_01 | 13.505 | 13.505 | 17.238 | 3.733s |
| br_02 | 26.274 | 26.274 | 30.841 | 4.567s |
| br_03 | 31.592 | 31.592 | 34.895 | 3.303s |
| br_04 | 38.309 | 38.309 | 41.746 | 3.437s |
| br_05 | 42.787 | 42.787 | 48.192 | 5.405s |
| br_06 | 53.913 | 53.913 | 58.913 | 5.000s |
| br_07 | 62.940 | 62.940 | 66.944 | 4.004s |
| br_08 | 67.139 | 67.139 | 71.076 | 3.937s |

---

#### Step 2 — Build Subtitle Overlay (HyperFrames, word-pop serif)

**Design spec:**

| Property | Value |
|---|---|
| Position (horizontal) | Centered (`left: 50%; transform: translateX(-50%)`) |
| Position (vertical) | Center + 200px down → `top: 1160px` (960 + 200) |
| Font | Playfair Display, italic, 72px (= 1080 ÷ 15) |
| Color | `rgba(255,255,255,0.92)` |
| Stroke | `-webkit-text-stroke: 0.5px rgba(0,0,0,0.6)` (very thin) |
| Text-shadow | `0 1px 8px rgba(0,0,0,0.70)` |
| Container | `text-align: center`, no background pill |
| Timing | Per-word from `whisperx_word_transcript.json` |
| Effect | Each word: fade in 0.06s (opacity 0→1), hold, fade out 0.05s — no line groups |

**Key difference from standard subtitles:** No line grouping. Each word is an independent clip — it appears exactly when spoken and disappears the moment the next word starts. No words are ever visible simultaneously. This creates a clean, one-word-at-a-time flow, like lyric cards.

**Word gap handling:** If the gap between `word.end` and `next_word.start` is ≥ 0.25s, add 0.08s pad to the end of the current word's `data-duration` so there is no flash of empty screen mid-sentence. Between sentences (gap ≥ 0.45s) leave the screen empty — natural breath.

**HyperFrames composition setup:**
```html
<div id="root" data-composition-id="subtitle-01" data-start="0"
     data-duration="71.267" data-width="1080" data-height="1920">
  <div id="sub-wrap" style="
    position: absolute; top: 1160px; left: 50%;
    transform: translateX(-50%); text-align: center; white-space: nowrap;">

    <!-- one per word from whisperx_word_transcript.json -->
    <span class="clip" id="w000"
          data-start="0.391" data-duration="0.540" data-track-index="0"
          style="font-family:'Playfair Display',serif; font-style:italic;
                 font-size:72px; color:rgba(255,255,255,0.92);
                 -webkit-text-stroke:0.5px rgba(0,0,0,0.6);
                 text-shadow:0 1px 8px rgba(0,0,0,0.70);
                 opacity:0; display:block;">
      Everyone
    </span>
    ...
  </div>
</div>
```

Each word's GSAP tween:
```js
tl.fromTo('#w000', { opacity:0 }, { opacity:1, duration:0.06, ease:'power1.out' }, 0.391);
tl.to('#w000', { opacity:0, duration:0.05 }, 0.391 + 0.540 - 0.05);
```

Render: `npm run render -- --format mov` → `subtitles/subtitle_overlay.mov` (ProRes 4444, `yuva444p12le`)

Then composite onto assembled_broll.mp4:
```bash
ffmpeg -y \
  -i output/assembled_broll.mp4 \
  -i subtitles/subtitle_overlay.mov \
  -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass[out]" \
  -map "[out]" -map 0:a -c:v libx264 -crf 18 -preset fast -c:a copy \
  output/assembled_sub.mp4
```

---

#### Step 3 — SFX + Music Mix

**Input manifests (SFX Artist output):**
- `broll_renders/broll_sfx_timestamp.json` — SFX at B-roll entry + accent points
- `aroll_renders/aroll_sfx_timestamp.json` — SFX at A-roll cluster entry (pending SFX pass)

**FFmpeg audio mix:**
```bash
ffmpeg -y \
  -i output/assembled_sub.mp4 \
  -i sfx/transition/swoosh.mp3 -i sfx/emphasis/tick.mp3 ... \
  -stream_loop -1 -i music/background.mp3 \
  -filter_complex "
    [0:a]volume=0.85[main];
    [1:a]adelay={ms}|{ms},volume={vol}[s0];
    ...
    [Broll_music:a]atrim=end=71.267,afade=t=in:st=0:d=1.5,
                   afade=t=out:st=69.767:d=1.5,volume=0.12[music];
    [main][s0]...[sN][music]amix=inputs={N+2}:normalize=0:duration=first[aout]
  " \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -ar 44100 \
  output/proj_teleprompter_01_final.mp4
```

**SFX volume rules (from sfx_timestamp files):**
- B-roll entry: `swoosh.mp3` at 0.35–0.40
- A-roll cluster entry: `pop.mp3` or `tick.mp3` at 0.20–0.28
- Background music: 0.10–0.12 (very low, atmospheric only)

---

#### Phase 5 Outputs

| File | Description |
|---|---|
| `output/assembled_broll.mp4` | Intermediate: aroll_footage + B-rolls composited |
| `output/assembled_sub.mp4` | Intermediate: + subtitle overlay |
| `subtitles/subtitle_comp/` | HyperFrames subtitle project |
| `subtitles/subtitle_overlay.mov` | ProRes 4444 subtitle overlay |
| `output/proj_teleprompter_01_final.mp4` | **Final deliverable** — all layers + SFX + music |

Output: `output/proj_teleprompter_01_final.mp4`

---

#### Assembly Rule 1: Always use `-itsoffset` per B-roll input — never rely on `enable=` alone

**Problem:** FFmpeg consumes ALL input streams in parallel from t=0, regardless of the
`enable='between(t,...)'` expression. By the time the enable fires for a B-roll that starts
at t=40s, the 5s clip has already been fully consumed — only its last (black) frame remains,
appearing as a static image.

**Wrong:**
```bash
ffmpeg -i assembled.mp4 \
  -i broll_renders/br_05.mp4 \
  -filter_complex "[1:v]scale=1080:1920[br5]; [0:v][br5]overlay=0:0:enable='between(t,40.807,46.213)'" \
  ...
```

**Correct — `-itsoffset` delays stream read to the B-roll's start time:**
```bash
ffmpeg -i assembled.mp4 \
  -itsoffset 40.807 -i broll_renders/br_05_trim.mp4 \
  -filter_complex "[1:v]scale=1080:1920[br5]; [0:v][br5]overlay=0:0:enable='between(t,40.807,46.213)':eof_action=pass" \
  ...
```

Also add `:eof_action=pass` to every overlay so when a B-roll finishes, the filter passes
through to the next layer rather than blocking.

---

#### Assembly Rule 2: Pre-trim B-roll clips to their exact slot duration

**Problem:** A B-roll `render_duration` may be longer than its `slot_duration` in the concat
timeline (e.g. br_00 renders 5.267s but its slot is only 5.072s). The overflow bleeds
into the next cut.

**Fix — pre-trim each B-roll before the overlay pass:**
```bash
ffmpeg -y -i broll_renders/br_NN.mp4 \
  -t {clip_trim}           \   # = min(render_duration, concat_slot_duration)
  -c:v libx264 -crf 18 -an \
  broll_renders/br_NN_trim.mp4
```

`clip_trim` = `min(render_duration, slot_dur_in_concat)` — always the smaller of the two.
Use `broll_renders/br_NN_trim.mp4` (not the original `br_NN.mp4`) in the overlay command.

**Which B-rolls needed trimming in proj_teleprompter_01:**

| B-roll | render_dur | slot_dur (concat) | clip_trim | Trimmed? |
|--------|------------|-------------------|-----------|----------|
| br_00 | 5.267s | 5.072s | 5.072s | ⚠ yes |
| br_01 | 3.733s | 7.574s | 3.733s | no |
| br_02 | 4.567s | 5.072s | 4.567s | no |
| br_03 | 3.467s | 3.303s | 3.303s | ⚠ yes |
| br_04 | 3.667s | 3.437s | 3.437s | ⚠ yes |
| br_05 | 5.633s | 5.405s | 5.405s | ⚠ yes |
| br_06 | 5.000s | 5.172s | 5.000s | no |
| br_07 | 4.233s | 4.004s | 4.004s | ⚠ yes |
| br_08 | 4.133s | 3.937s | 3.937s | ⚠ yes |

---

---

#### Assembly Rule 3 (A-roll): Overlay on zoomed segments, NOT assembled_broll.mp4

**CRITICAL CORRECTION:** A-roll overlays must be applied on top of the **concatenated zoomed segments** (`segments/zoomed/seg_*_zoom.mp4` concat), NOT on `assembled_broll.mp4`.

`assembled_broll.mp4` is the output after B-roll visuals have been overlaid. In Phase 5 final assembly, the layer order is:
1. Main video = concat of all zoomed segments
2. B-roll full-frame overlays applied at B-roll timestamps
3. A-roll glass card overlays applied at A-roll timestamps  
4. Subtitle overlay

A-roll overlays go on the SAME base as B-rolls — both overlay the zoomed segment concat. They do not chain on top of each other's output.

**A-roll FFmpeg overlay pattern:**
```bash
# Using setpts=PTS+{offset}/TB (NOT -itsoffset + setpts=PTS-STARTPTS — those cancel each other)
[N:v]setpts=PTS+{asm_start}/TB[ovN];
[prev][ovN]overlay=0:0:eof_action=pass[vN]
```

**Two critical rules for A-roll overlay:**
1. `setpts=PTS+{offset}/TB` — delays the overlay's PTS to the correct position in the timeline. Never combine with `-itsoffset` on the same input (they cancel each other and reset all frames to t=0).
2. `eof_action=pass` — when the MOV overlay ends, the filter passes through the base video. Without this, the last frame of the overlay is held indefinitely, causing the glass card content to ghost over subsequent footage.

---

#### Assembly Rule 4: Concat timestamps require ffprobe correction — never use cut_plan nominal durations

**Problem:** `cut_plan.json` stores nominal segment durations (e.g. 0.961s). The actual
encoded `_zoom.mp4` segments are consistently longer due to FFmpeg keyframe boundary padding
(~33–61ms per segment). Over 65 segments this accumulates to ~3.3s of drift, making all
late-video B-rolls land early.

Two layers of correction are required:

**Step A — ffprobe every zoomed segment for actual duration:**
```js
// scripts/compute-exact-timestamps.js
const actualDur = parseFloat(
  execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "seg_NNN_zoom.mp4"`).toString().trim()
);
```
Sum these actual durations to get the accurate concat timeline positions per B-roll.

**Step B — Scale-correct for re-encode overhead at concat joins:**
When 65 segments are re-encoded via `ffmpeg -f concat ... -c:v libx264 -r 30`, the encoder
adds ~1–2 extra frames per segment join (B-frame flushing). This inflates the output beyond
the sum of individual segment durations.

```
scale = actual_demo_aroll_duration / sum_of_ffprobed_segment_durations
      = 71.267 / 67.968 = 1.0485   (proj_teleprompter_01)
```

Apply this scale uniformly to all B-roll `concat_start` timestamps before the overlay pass:
```
itsoffset_N = concat_start_N × scale
```

**Script:** `scripts/compute-exact-timestamps.js` automates both steps — ffprobes all 65 segments,
computes exact positions, applies scale correction, and writes `broll_renders/broll_concat_exact.json`.

**Verified result (proj_teleprompter_01):**

| B-roll | Unscaled concat_start | Scale ×1.0485 | Final itsoffset |
|--------|-----------------------|---------------|-----------------|
| br_00 | 3.937s | 4.128s | 4.128 |
| br_01 | 12.880s | 13.505s | 13.505 |
| br_02 | 25.058s | 26.274s | 26.274 |
| br_03 | 30.130s | 31.592s | 31.592 |
| br_04 | 36.536s | 38.309s | 38.309 |
| br_05 | 40.807s | 42.787s | 42.787 |
| br_06 | 51.418s | 53.913s | 53.913 |
| br_07 | 60.027s | 62.940s | 62.940 |
| br_08 | 64.031s | 67.139s | 67.139 |

> **Note for future projects:** the scale factor will vary per project depending on segment
> count and codec settings. Always measure `actual_concat_duration / sum_ffprobed_durations`
> fresh. The `compute-exact-timestamps.js` script handles this automatically.

---

## Graph

**Workflow spec:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/CLAUDE|talking-head-editing CLAUDE]]
**Cut logic:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Segment logic|Segment logic]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Zoom segment logic|Zoom segment logic]]
**Phase 0 raw cut:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Phase0-raw-cut-logic|Phase0-raw-cut-logic]]
**Source:** `footage/Teleprompter-2026-17-01_23-07-28.mp4` → `footage/main_clean_2.mp4`
**Phase 1 outputs:** `segments/cut_plan.json` · `segments/zoom_plan.json` · `segments/zoomed/`
**Phase 2 agents:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/motion-video-designer|Motion Video Designer]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/sfx-artist|SFX Artist]]
**Phase 3 agent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/motion-video-designer|Motion Video Designer]] (skill: `/design-motion-overlay`) · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/sfx-artist|SFX Artist]]
**Phase 4 agent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/motion-video-designer|Motion Video Designer]] (skill: `/subtitle-designer`)
**Template library:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/motion-researcher/output/Motion Video Template|Motion Video Template Library]]
