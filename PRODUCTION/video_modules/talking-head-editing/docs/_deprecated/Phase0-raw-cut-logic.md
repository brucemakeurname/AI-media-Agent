# Phase 0 — Raw Cut Logic

Documents the rough cut pipeline that produces `main_clean_2.mp4` from the original raw
footage. All downstream phases (WhisperX transcription, semantic cut planning, FFmpeg
segment execution) operate on this cleaned file.

---

## Goal

Remove unusable footage from the raw take so that only clean, continuous speech remains.
The output is a single video file where every second contains meaningful content.

---

## Inputs

| File | Description |
|------|-------------|
| `footage/main.mp4` | Original raw recording (continuous take, unedited) |
| `logs/analysis.json` | Operator-reviewed analysis — contains `exclude_regions`, `broll_moments`, `emphasis_moments`, pacing config |

---

## Step 1: Operator Review + Gemini Analysis

The operator watches the raw footage and identifies bad regions. Gemini is used to assist
with spotting patterns at scale, but the operator makes final calls.

`logs/analysis.json` is the output of this review. Key sections:

```json
{
  "exclude_regions": [
    { "from": 4.2, "to": 7.8,  "reason": "stumble" },
    { "from": 22.0, "to": 29.5, "reason": "repeat" },
    ...
  ],
  "pacing": {
    "speed_factor": 1.2
  }
}
```

### Reason Tags

| Tag | Description |
|-----|-------------|
| `stumble` | Speaker starts then resets — the restart is the keeper |
| `repeat` | Same phrase said twice — keep only the last (cleaner) take |
| `wrong_pronunciation` | Mispronounced word, not self-corrected |
| `wrong_intonation` | Sentence ends with wrong rise/fall |
| `silence` | Dead air > 0.5s (thinking pause, hesitation) |
| `noise` | Background noise spike, cough, chair scrape |
| `off_script` | Speaker deviated significantly from teleprompter |

---

## Step 2: Gap Reduction (gap_50pct)

Natural pauses between sentences (breath marks, mental reset) are preserved but shortened.
The rule: any natural gap > threshold is trimmed to 50% of its original length.

This is applied **before** the exclude_regions cut so that the gap timestamps are
still in original-footage time space.

> **Why 50% not 100%?** Zero-gap concatenation sounds robotic — two sentences with no
> breath between them feels machine-produced. 50% preserves the *feel* of natural speech
> while tightening the pace.

---

## Step 3: Build Include Regions

Invert `exclude_regions` to get `include_regions`:

```
sort exclude_regions by .from
include[0].start = 0
include[0].end   = exclude[0].from
include[1].start = exclude[0].to
include[1].end   = exclude[1].from
...
include[N].start = exclude[N-1].to
include[N].end   = source_duration
```

Drop any include region shorter than **0.2s** (these are artefact slivers between
adjacent exclusions — not meaningful speech).

---

## Step 4: FFmpeg Cut — Extract Include Parts

For each include region:

```bash
ffmpeg -i footage/main.mp4\
  -ss {include.start} -to {include.end} \
  -c copy footage/rough/part_{n}.mp4
```

`-c copy` here is intentional — no re-encode at this stage, just demux slices. Re-encode
happens later in Phase 1 normalization.

---

## Step 5: Concat Parts

Write `footage/rough/concat.txt`:
```
file 'part_00.mp4'
file 'part_01.mp4'
...
file 'part_NN.mp4'
```

Concatenate:
```bash
ffmpeg -f concat -safe 0 -i footage/rough/concat.txt \
  -c copy footage/main_clean_2_raw.mp4
```

Output: `footage/main_clean_2_raw.mp4` — all bad regions removed, natural timing.

---

## Step 6: Speed Factor (1.2×)

Apply the pacing `speed_factor` from `analysis.json`:

```bash
ffmpeg -i footage/main_clean_2_raw.mp4 \
  -filter_complex "[0:v]setpts=PTS/1.2[v];[0:a]atempo=1.2[a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -crf 18 -c:a aac -ar 44100 \
  footage/main_clean_2.mp4
```

`setpts=PTS/1.2` speeds video by 1.2×. `atempo=1.2` speeds audio by 1.2× without
pitch shift.

> **Why 1.2× not more?** 1.2× is the maximum that preserves natural-sounding speech.
> 1.3× and above starts to sound mechanical and loses intonation quality.

Output: `footage/main_clean_2.mp4` — **Phase 0 final output.**

---

## Phase 0 Outputs

| File | Description |
|------|-------------|
| `footage/rough/part_NN.mp4` | Individual include parts (intermediates) |
| `footage/main_clean_2_raw.mp4` | Post-exclusion, pre-speed (intermediate) |
| `footage/main_clean_2.mp4` | **Final — used by all downstream phases** |
| `logs/analysis.json` | Master config with all decisions recorded |

---

## Quality Gate

If total excluded duration > 40% of source: halt and flag for operator review.
The take may need to be re-recorded entirely.

Log total removed duration to `logs/rough_cut.log`:
```
Total source duration:    142.3s
Total excluded duration:   54.8s (38.5%)
Total included duration:   87.5s
Speed factor applied:       1.2×
Final duration:            72.9s
```

---

## Relationship to WhisperX

WhisperX is run on `main_clean_2.mp4` — **not on the original raw footage.**

This is intentional: WhisperX timestamps must align to the cleaned, speed-adjusted file
because that's the file that will actually be edited in Phase 1. Any timestamp derived
from the original footage would require an `orig_to_final()` transform — that approach
was tested and abandoned due to accumulated drift in the final third of the video.

Direct transcription on the final file = zero drift, 1:1 timestamp alignment.

---

## Graph

**Context:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW|WORKFLOW]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/CLAUDE|CLAUDE]]
**Output consumed by:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Segment logic|Segment logic]] (Phase 1)
**Test project:** `Test/proj_teleprompter_01/logs/analysis.json` · `Test/proj_teleprompter_01/footage/main_clean_2.mp4`
