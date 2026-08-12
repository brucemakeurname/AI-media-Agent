#!/usr/bin/env node
// compute-exact-timestamps.js
// Phase 5 prep — ffprobe every zoomed segment to get actual durations,
//                compute exact B-roll concat positions with scale correction,
//                write broll_concat_exact.json
//
// Usage: node scripts/compute-exact-timestamps.js <project_path>
// Reads:  segments/cut_plan.json
//         broll_renders/broll_timestamp.json
//         aroll_renders/aroll_footage.mp4  (for scale measurement)
// Writes: broll_renders/broll_concat_exact.json

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node compute-exact-timestamps.js <project_path>'); process.exit(1); }

const cutPlan   = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'cut_plan.json'), 'utf8'));
const brollData = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'broll_renders', 'broll_timestamp.json'), 'utf8'));
const ZOOMED    = path.join(PROJECT_DIR, 'segments', 'zoomed');
const AROLL_FOOTAGE = path.join(PROJECT_DIR, 'aroll_renders', 'aroll_footage.mp4');

function ffprobeDur(filePath) {
  return parseFloat(
    execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${filePath}"`).toString().trim()
  );
}

const pad = n => String(n).padStart(3, '0');

// ── Step 1: ffprobe every zoomed segment ─────────────────────────────────────
process.stdout.write(`ffprobing ${cutPlan.segments.length} zoomed segments`);
const actualDurs = cutPlan.segments.map(seg => {
  const f = path.join(ZOOMED, `seg_${pad(seg.id)}_zoom.mp4`);
  process.stdout.write('.');
  return ffprobeDur(f);
});
console.log(' done');

// ── Step 2: Exact concat positions ───────────────────────────────────────────
let pos = 0;
const segs = cutPlan.segments.map((seg, i) => {
  const entry = { id: seg.id, nominal_dur: seg.duration, actual_dur: actualDurs[i], concat_start: pos };
  pos += actualDurs[i];
  return entry;
});
const ffprobeSum = pos;
console.log(`\nffprobe sum: ${ffprobeSum.toFixed(3)}s`);

// ── Step 3: Scale correction from actual aroll_footage.mp4 ───────────────────
// The concat + re-encode adds B-frame padding at every segment join.
// Measure aroll_footage.mp4 (already built by composite-aroll.js) for exact scale.
let scale = 1.0;
if (fs.existsSync(AROLL_FOOTAGE)) {
  const actualConcatDur = ffprobeDur(AROLL_FOOTAGE);
  scale = actualConcatDur / ffprobeSum;
  console.log(`actual concat (aroll_footage): ${actualConcatDur.toFixed(3)}s  →  scale=${scale.toFixed(5)}`);
} else {
  console.warn('aroll_footage.mp4 not found — scale correction skipped (scale=1.0). Run composite-aroll.js first.');
}

// ── Step 4: B-roll positions ──────────────────────────────────────────────────
console.log('\nB-roll exact positions:');
console.log('─'.repeat(80));
const results = brollData.brolls.map(br => {
  const covered  = br.segments_covered.map(id => segs[id]);
  const cStart   = covered[0].concat_start * scale;
  const last     = covered[covered.length - 1];
  const cEnd     = (last.concat_start + last.actual_dur) * scale;
  const slotDur  = parseFloat((cEnd - cStart).toFixed(4));
  const clipTrim = parseFloat(Math.min(br.render_duration, slotDur).toFixed(4));
  const overflow = br.render_duration > slotDur;

  console.log(
    `${br.id}  slot=[${cStart.toFixed(3)},${cEnd.toFixed(3)}] ${slotDur.toFixed(3)}s` +
    `  render=${br.render_duration}s  trim→${clipTrim}s` +
    (overflow ? '  ⚠ TRIMMED' : '')
  );

  return {
    id:           br.id,
    concat_start: parseFloat(cStart.toFixed(4)),
    concat_end:   parseFloat(cEnd.toFixed(4)),
    slot_dur:     slotDur,
    render_dur:   br.render_duration,
    clip_trim:    clipTrim,
    overflow,
    source:       `broll_renders/${br.id}.mp4`,
    trimmed:      `broll_renders/${br.id}_trim.mp4`,
  };
});

// ── Step 5: Write JSON ────────────────────────────────────────────────────────
const outPath = path.join(PROJECT_DIR, 'broll_renders', 'broll_concat_exact.json');
fs.writeFileSync(outPath, JSON.stringify({ scale, brolls: results }, null, 2));
console.log(`\nWrote: ${outPath}`);
