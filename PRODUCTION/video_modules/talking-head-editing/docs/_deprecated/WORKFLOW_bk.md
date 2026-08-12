# proj_teleprompter_01 — Workflow Log

**Project:** Teleprompter Test Edit — Solo Flows  
**Influencer:** Solo Flows Official  
**Platform:** TikTok (1080×1920, vertical)  
**Source:** `footage/Teleprompter-2026-17-01_23-07-28.mp4` — 125.67s raw talking-head  
**Target:** ~85-90s social-ready clip, 1.2x paced, jump cuts, ≤1.8s segments  
**Language:** English (video content), scripts in English  
**Last updated:** 2026-05-13  

---

## Pipeline Status

| Phase | Name | Status | Output |
|-------|------|--------|--------|
| 0 | Rough Cut + Transcription | ✅ Done | `footage/main_clean_2.mp4` (87.5s) · `logs/whisperx_word_transcript.json` · `logs/sentence_transcript.json` |
| 1 | Semantic Cut + Zoom | ✅ Done | `segments/cut_plan.json` · `segments/zoom_plan.json` · `segments/seg_000–064.mp4` · `segments/zoomed/seg_000–064_zoom.mp4` |
| 2 | B-roll Resolution | ⬜ Pending | `broll_renders/br_*.mp4` |
| 3 | Assembly | ⬜ Pending | `assembled.mp4` |
| 4 | HyperFrames Overlay | ⬜ Pending | `composited.mp4` |
| 5 | Subtitles | ⬜ Pending | `subtitles/proj_teleprompter_01.srt` |
| 6 | SFX + Audio Mix | ⬜ Pending | `output/proj_teleprompter_01_final.mp4` |

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
│   └── fix-zoom-srt.js                         ← utility: regenerate SRT from ffprobe actual durations
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

5 broll moments defined in `analysis.json`. Map their timestamps to the final timeline:

```python
broll_in_final = [
    { "start": orig_to_final(b["start_time"]), "end": orig_to_final(b["end_time"]), "keyword": b["keyword"] }
    for b in analysis["broll_moments"]
]
```

Then find which `cuts.json` segments overlap each broll window and mark them `hasBroll: true`.

For each broll slot: fetch from Unsplash (keyword search) or generate via DALL-E 3. Output: `broll_renders/br_N.jpg` or `br_N.mp4`.

### Phase 3: Assembly

Build `segments/concat_list.txt` from all 65 `seg_NNN.mp4` files in order, then concatenate:

```
ffmpeg -f concat -safe 0 -i segments/concat_list.txt \
  -c:v libx264 -c:a aac -crf 18 -r 30 \
  assembled.mp4
```

Natural inter-segment gaps (breath marks between sentences) are already encoded into the cut plan — `seg_N.end` to `seg_N+1.start` gaps are the natural pauses from the original speech. The assembled video will play all 65 segments as consecutive hard cuts.

### Phase 4–6: HyperFrames + Subtitles + SFX

Per the `talking-head-editing/CLAUDE.md` workflow — read that file for current spec.

---

## Graph

**Workflow spec:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/CLAUDE|talking-head-editing CLAUDE]]
**Cut logic:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Segment logic|Segment logic]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Zoom segment logic|Zoom segment logic]]
**Phase 0 raw cut:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Phase0-raw-cut-logic|Phase0-raw-cut-logic]]
**Source:** `footage/Teleprompter-2026-17-01_23-07-28.mp4` → `footage/main_clean_2.mp4`
**Phase 1 outputs:** `segments/cut_plan.json` · `segments/zoom_plan.json` · `segments/zoomed/`
