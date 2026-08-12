#!/usr/bin/env node
// build-subtitle-comp.js
// Phase 5 — Generate HyperFrames subtitle composition (index.html) from
//           whisperx_word_transcript.json + actual assembled video timeline.
//           One word per clip, word-pop Playfair Display serif.
//
// Usage: node scripts/build-subtitle-comp.js <project_path>
// Reads:  segments/cut_plan.json
//         logs/whisperx_word_transcript.json
//         aroll_renders/aroll_footage.mp4  (for actual duration + scale)
// Writes: subtitles/subtitle_comp/index.html

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node build-subtitle-comp.js <project_path>'); process.exit(1); }

const cutPlan  = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'cut_plan.json'), 'utf8'));
const wordData = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'logs', 'whisperx_word_transcript.json'), 'utf8'));
const segments = cutPlan.segments;
const words    = wordData.words;

console.log(`Segments: ${segments.length}, Words: ${words.length}`);

function ffprobeDur(p) {
  return parseFloat(
    execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${p}"`).toString().trim()
  );
}

const pad = n => String(n).padStart(3, '0');

// ── Step 1: ffprobe actual zoomed segment durations ───────────────────────────
console.log('Probing zoomed segments...');
const ZOOMED = path.join(PROJECT_DIR, 'segments', 'zoomed');
const actualDurs = segments.map(seg =>
  ffprobeDur(path.join(ZOOMED, `seg_${pad(seg.id)}_zoom.mp4`))
);

// ── Step 2: Accumulated positions in assembled video ─────────────────────────
const segAccum = [];
let accum = 0;
for (let i = 0; i < segments.length; i++) {
  segAccum.push(accum);
  accum += actualDurs[i];
}
const ffprobeSum = accum;

// Scale correction against actual concat output
const AROLL_FOOTAGE = path.join(PROJECT_DIR, 'aroll_renders', 'aroll_footage.mp4');
const actualConcatDur = ffprobeDur(AROLL_FOOTAGE);
const scale = actualConcatDur / ffprobeSum;
const VIDEO_DUR = actualConcatDur;
console.log(`ffprobe sum: ${ffprobeSum.toFixed(3)}s  |  actual: ${actualConcatDur.toFixed(3)}s  |  scale: ${scale.toFixed(5)}`);

// ── Step 3: Map each word to assembled timeline ───────────────────────────────
function mapTime(t) {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (t >= seg.start - 0.01 && t <= seg.end + 0.01) {
      const offset     = t - seg.start;
      const nominalDur = seg.end - seg.start;
      const ratio      = nominalDur > 0 ? actualDurs[i] / nominalDur : 1;
      return (segAccum[i] + offset * ratio) * scale;
    }
  }
  return VIDEO_DUR;
}

const FADE_IN  = 0.06;
const FADE_OUT = 0.05;

const mappedWords = words.map((w, idx) => {
  const asmStart = Math.max(0, mapTime(w.start));
  const asmEnd   = mapTime(w.end);
  let displayDur = Math.max(asmEnd - asmStart, 0.05);

  // Gap pad: extend slightly if next word gap is 0.25–0.45s (prevent flash of empty)
  if (idx < words.length - 1) {
    const nextStart = mapTime(words[idx + 1].start);
    const gap = nextStart - asmEnd;
    if (gap >= 0.25 && gap < 0.45) displayDur += 0.08;
  }
  displayDur = Math.min(displayDur, VIDEO_DUR - asmStart);

  return { word: w.word, asmStart, displayDur };
});

const captionGroups = [];
for (let i = 0; i < mappedWords.length; i += 4) {
  const group = mappedWords.slice(i, i + 4);
  const asmStart = group[0].asmStart;
  const asmEnd = Math.min(VIDEO_DUR, group[group.length - 1].asmStart + group[group.length - 1].displayDur + 0.20);
  captionGroups.push({ text: group.map(w => w.word).join(' '), asmStart, displayDur: Math.max(0.45, asmEnd - asmStart) });
}
console.log(`Caption groups: ${captionGroups.length} (3–5 word pace)`);

// ── Step 4: Build index.html ──────────────────────────────────────────────────
const spanLines = captionGroups.map((w, i) => {
  const id   = `g${String(i).padStart(3,'0')}`;
  const safe = w.text.replace(/"/g, '&quot;');
  return `    <span class="clip" id="${id}" data-start="${w.asmStart.toFixed(3)}" data-duration="${w.displayDur.toFixed(3)}" data-track-index="${i}" style="opacity:0;display:block;position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;">${safe}</span>`;
}).join('\n');

const gsapLines = captionGroups.map((w, i) => {
  const id = `g${String(i).padStart(3,'0')}`;
  const fadeOutAt  = (w.asmStart + w.displayDur - FADE_OUT).toFixed(3);
  const hardKillAt = (w.asmStart + w.displayDur).toFixed(3);
  return [
    `      tl.fromTo('#${id}',{opacity:0},{opacity:1,duration:${FADE_IN},ease:'power1.out'},${w.asmStart.toFixed(3)});`,
    `      tl.to('#${id}',{opacity:0,duration:${FADE_OUT}},${fadeOutAt});`,
    `      tl.set('#${id}',{opacity:0},${hardKillAt});`,
  ].join('\n');
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: transparent !important; }
    #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; }
    #sub-wrap {
      position: absolute; top: 1160px; left: 0; width: 1080px;
      text-align: center; pointer-events: none;
      font-family: 'Playfair Display', serif; font-style: italic;
      font-size: 72px; color: rgba(255,255,255,0.92);
      -webkit-text-stroke: 0.5px rgba(0,0,0,0.6);
      text-shadow: 0 1px 8px rgba(0,0,0,0.70); line-height: 1;
    }
  </style>
</head>
<body>
  <div id="root" data-composition-id="subtitle-01" data-start="0"
       data-duration="${VIDEO_DUR.toFixed(3)}" data-width="1080" data-height="1920">
    <div id="sub-wrap">
${spanLines}
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      var tl = gsap.timeline({ paused: true });
      window.__timelines = window.__timelines || {};
      window.__timelines['subtitle-01'] = tl;
${gsapLines}
    });
  </script>
</body>
</html>`;

const SUBTITLE_COMP = path.join(PROJECT_DIR, 'subtitles', 'subtitle_comp');
if (!fs.existsSync(SUBTITLE_COMP)) fs.mkdirSync(SUBTITLE_COMP, { recursive: true });
const outPath = path.join(SUBTITLE_COMP, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`\nWritten: ${outPath}`);
console.log(`Caption groups mapped: ${captionGroups.length}  |  Video duration: ${VIDEO_DUR.toFixed(3)}s`);
