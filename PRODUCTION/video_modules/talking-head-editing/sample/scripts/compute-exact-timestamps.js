/**
 * Phase: exact B-roll timestamp computation
 *
 * 1. ffprobe every zoomed segment → actual encoded duration (not cut_plan nominal)
 * 2. Compute exact concat start position for each segment
 * 3. For each B-roll: concat_start = first covered seg's concat_start
 *                     concat_end   = last covered seg's concat_start + actual_dur
 *                     clip_trim    = min(render_duration, concat_end - concat_start)
 * 4. Write broll_concat_exact.json
 * 5. Print pre-trim FFmpeg commands + final overlay FFmpeg command
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const cutPlan  = JSON.parse(fs.readFileSync(path.join(ROOT, 'segments', 'cut_plan.json'), 'utf8'));
const brollData= JSON.parse(fs.readFileSync(path.join(ROOT, 'broll_renders', 'broll_timestamp.json'), 'utf8'));

// ── Step 1: actual durations ─────────────────────────────────────────────────
process.stdout.write('ffprobing 65 zoomed segments');
const actualDurs = cutPlan.segments.map(seg => {
  const f = path.join(ROOT, 'segments', 'zoomed', `seg_${String(seg.id).padStart(3,'0')}_zoom.mp4`);
  const out = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${f}"`
  ).toString().trim();
  process.stdout.write('.');
  return parseFloat(out);
});
console.log(' done');

// ── Step 2: exact concat positions ──────────────────────────────────────────
let pos = 0;
const segs = cutPlan.segments.map((seg, i) => {
  const entry = {
    id:           seg.id,
    orig_start:   seg.start,
    orig_end:     seg.end,
    nominal_dur:  seg.duration,
    actual_dur:   actualDurs[i],
    concat_start: pos,
  };
  pos += actualDurs[i];
  return entry;
});
console.log(`\nTotal concat duration (actual): ${pos.toFixed(3)}s`);

// ── Step 3: B-roll slot positions ────────────────────────────────────────────
console.log('\nB-roll exact positions:');
console.log('─'.repeat(80));
const results = brollData.brolls.map(br => {
  const covered  = br.segments_covered.map(id => segs[id]);
  const cStart   = covered[0].concat_start;
  const last     = covered[covered.length - 1];
  const cEnd     = last.concat_start + last.actual_dur;
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
    concat_start: parseFloat(cStart.toFixed(3)),
    concat_end:   parseFloat(cEnd.toFixed(3)),
    slot_dur:     slotDur,
    render_dur:   br.render_duration,
    clip_trim:    clipTrim,
    overflow:     overflow,
    source:       `broll_renders/${br.id}.mp4`,
    trimmed:      `broll_renders/${br.id}_trim.mp4`,
  };
});

// ── Step 4: write JSON ────────────────────────────────────────────────────────
const outPath = path.join(ROOT, 'broll_renders', 'broll_concat_exact.json');
fs.writeFileSync(outPath, JSON.stringify({ brolls: results }, null, 2));
console.log(`\nWrote: ${outPath}`);

// ── Step 5: print commands ────────────────────────────────────────────────────
console.log('\n── Pre-trim commands (run from project root) ──');
results.forEach(r => {
  // Always re-trim every clip for clean PTS reset, even if no overflow
  console.log(
    `ffmpeg -y -i "${r.source}" -t ${r.clip_trim} -c:v libx264 -crf 18 -an "${r.trimmed}"`
  );
});

console.log('\n── Final overlay command ──');
const inputs = results.map((r, i) =>
  `-itsoffset ${r.concat_start} -i "${r.trimmed}"`
).join(' \\\n  ');

const scales = results.map((r, i) =>
  `[${i+1}:v]scale=1080:1920[br${i}]`
).join(';');

const overlays = results.map((r, i) => {
  const src = i === 0 ? '[0:v]' : `[v${i-1}]`;
  return `${src}[br${i}]overlay=0:0:enable='between(t,${r.concat_start},${r.concat_end})':eof_action=pass[v${i}]`;
}).join(';');

const lastV = `[v${results.length - 1}]`;

console.log(`ffmpeg -y \\
  -i "demo_aroll.mp4" \\
  ${inputs} \\
  -filter_complex "${scales};${overlays}" \\
  -map "${lastV}" -map 0:a \\
  -c:v libx264 -crf 18 -c:a copy \\
  "demo_preview.mp4"`);
