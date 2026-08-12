// Build subtitle HyperFrames composition
// Maps word timestamps from main_clean_2.mp4 → assembled zoomed video timeline

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '..');

// --- Load data ---
const cutPlan = JSON.parse(readFileSync(path.join(BASE, 'segments/cut_plan.json'), 'utf8'));
const wordData = JSON.parse(readFileSync(path.join(BASE, 'logs/whisperx_word_transcript.json'), 'utf8'));
const segments = cutPlan.segments; // 65 segments, start/end in main_clean_2 timeline
const words = wordData.words;

console.log(`Segments: ${segments.length}, Words: ${words.length}`);

// --- Step 1: ffprobe actual duration of each zoomed segment ---
console.log('Probing zoomed segments...');
const actualDurs = [];
for (let i = 0; i < segments.length; i++) {
  const fname = path.join(BASE, `segments/zoomed/seg_${String(i).padStart(3,'0')}_zoom.mp4`);
  const raw = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${fname}"`
  ).toString().trim();
  actualDurs.push(parseFloat(raw));
}

// --- Step 2: Build accumulated positions in assembled video ---
const segAccum = []; // segAccum[i] = start position of seg i in assembled video
let accum = 0;
for (let i = 0; i < segments.length; i++) {
  segAccum.push(accum);
  accum += actualDurs[i];
}
const ffprobeSum = accum;
// Scale correction: concat output is larger than ffprobe sum due to encoder padding at joins
// Measure actual base_zoomed.mp4 duration for exact scale
const actualConcatDurRaw = execSync(
  `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${path.join(BASE, 'aroll_renders/base_zoomed.mp4')}"`
).toString().trim();
const actualConcatDur = parseFloat(actualConcatDurRaw);
const scale = actualConcatDur / ffprobeSum;
const totalAssembledDur = actualConcatDur;
console.log(`ffprobe sum: ${ffprobeSum.toFixed(3)}s  |  actual concat: ${actualConcatDur.toFixed(3)}s  |  scale: ${scale.toFixed(5)}`);

// --- Step 3: Map each word to assembled timeline ---
// For each word, find which segment contains it, then map via ratio
function mapTime(t) {
  // find segment whose range in main_clean_2 contains t
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (t >= seg.start - 0.01 && t <= seg.end + 0.01) {
      const offset = t - seg.start;
      const nominalDur = seg.end - seg.start;
      const ratio = nominalDur > 0 ? actualDurs[i] / nominalDur : 1;
      // Apply scale correction for concat-join overhead
      return (segAccum[i] + offset * ratio) * scale;
    }
  }
  // fallback
  const lastSeg = segments[segments.length - 1];
  return totalAssembledDur;
}

const mappedWords = words.map((w, idx) => {
  const asmStart = mapTime(w.start);
  const asmEnd   = mapTime(w.end);
  const dur = Math.max(asmEnd - asmStart, 0.05);

  // Gap pad: if gap to next word >= 0.25s but < 0.45s, extend by 0.08s
  let displayDur = dur;
  if (idx < words.length - 1) {
    const nextStart = mapTime(words[idx + 1].start);
    const gap = nextStart - asmEnd;
    if (gap >= 0.25 && gap < 0.45) {
      displayDur += 0.08;
    }
  }

  return {
    word: w.word,
    asmStart: Math.max(0, asmStart),
    displayDur: Math.min(displayDur, totalAssembledDur - asmStart),
  };
});

console.log(`First word mapped: "${mappedWords[0].word}" start=${mappedWords[0].asmStart.toFixed(3)}`);
console.log(`Last word mapped:  "${mappedWords[mappedWords.length-1].word}" start=${mappedWords[mappedWords.length-1].asmStart.toFixed(3)}`);

// --- Step 4: Generate spans + GSAP tweens ---
const FADE_IN  = 0.06;
const FADE_OUT = 0.05;
const VIDEO_DUR = totalAssembledDur;

const spanLines = mappedWords.map((w, i) => {
  const id = `w${String(i).padStart(3,'0')}`;
  // Escape quotes in word text
  const safe = w.word.replace(/"/g, '&quot;');
  return `    <span class="clip" id="${id}" data-start="${w.asmStart.toFixed(3)}" data-duration="${w.displayDur.toFixed(3)}" data-track-index="${i}" style="opacity:0;display:block;position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;">${safe}</span>`;
}).join('\n');

const gsapLines = mappedWords.map((w, i) => {
  const id = `w${String(i).padStart(3,'0')}`;
  const fadeOutAt = (w.asmStart + w.displayDur - FADE_OUT).toFixed(3);
  const hardKillAt = (w.asmStart + w.displayDur).toFixed(3);
  return `      tl.fromTo('#${id}',{opacity:0},{opacity:1,duration:${FADE_IN},ease:'power1.out'},${w.asmStart.toFixed(3)});\n      tl.to('#${id}',{opacity:0,duration:${FADE_OUT}},${fadeOutAt});\n      tl.set('#${id}',{opacity:0},${hardKillAt});`;
}).join('\n');

// --- Step 5: Write index.html ---
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
      position: absolute;
      top: 1160px;
      left: 0; width: 1080px;
      text-align: center;
      pointer-events: none;
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 72px;
      color: rgba(255,255,255,0.92);
      -webkit-text-stroke: 0.5px rgba(0,0,0,0.6);
      text-shadow: 0 1px 8px rgba(0,0,0,0.70);
      line-height: 1;
    }
  </style>
</head>
<body>
  <div id="root" data-composition-id="subtitle-01" data-start="0" data-duration="${VIDEO_DUR.toFixed(3)}" data-width="1080" data-height="1920">
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
</html>
`;

const outPath = path.join(BASE, 'subtitles/subtitle_comp/index.html');
writeFileSync(outPath, html, 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Words in HTML: ${mappedWords.length}`);
console.log(`Video duration used: ${VIDEO_DUR.toFixed(3)}s`);
