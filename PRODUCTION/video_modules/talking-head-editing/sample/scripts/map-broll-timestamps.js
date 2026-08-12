/**
 * Remaps B-roll timestamps from the original main_clean_2.mp4 timeline
 * to the concatenated zoomed-segments timeline (demo_aroll.mp4).
 *
 * Gaps between cut segments are removed in the concat, so every B-roll
 * start/end must be offset-corrected.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const cutPlan = JSON.parse(fs.readFileSync(path.join(ROOT, 'segments', 'cut_plan.json'), 'utf8'));
const brollData = JSON.parse(fs.readFileSync(path.join(ROOT, 'broll_renders', 'broll_timestamp.json'), 'utf8'));

// Build per-segment concat position table
let concatPos = 0;
const segs = cutPlan.segments.map(seg => {
  const entry = { id: seg.id, orig_start: seg.start, orig_end: seg.end, dur: seg.duration, concat_start: concatPos };
  concatPos += seg.duration;
  return entry;
});
console.log(`Total concat duration: ${concatPos.toFixed(3)}s (expected ~71.3s)\n`);

/**
 * Convert an original-timeline timestamp to a concat-timeline timestamp.
 * If the time falls in a gap, snap to the start of the next segment.
 */
function origToConcat(origTime) {
  // Find the segment that contains this time
  for (const seg of segs) {
    if (origTime >= seg.orig_start && origTime <= seg.orig_end) {
      return seg.concat_start + (origTime - seg.orig_start);
    }
  }
  // Falls in a gap — snap to start of next segment in concat
  const next = segs.find(s => s.orig_start > origTime);
  if (next) return next.concat_start;
  return concatPos; // past end
}

const results = [];
console.log('B-roll → concat timeline mapping:');
console.log('─'.repeat(72));
brollData.brolls.forEach(br => {
  const concatStart = origToConcat(br.start);
  const concatEnd   = concatStart + br.render_duration;
  results.push({
    id: br.id,
    orig_start: br.start,
    orig_end:   br.end,
    render_dur: br.render_duration,
    concat_start: parseFloat(concatStart.toFixed(3)),
    concat_end:   parseFloat(concatEnd.toFixed(3)),
  });
  console.log(
    `${br.id}  orig [${br.start.toFixed(3)}–${(br.start + br.render_duration).toFixed(3)}]` +
    `  →  concat [${concatStart.toFixed(3)}–${concatEnd.toFixed(3)}]  (${br.render_duration}s)`
  );
});

// Write mapping JSON for use in FFmpeg command
const outPath = path.join(ROOT, 'broll_renders', 'broll_concat_timestamps.json');
fs.writeFileSync(outPath, JSON.stringify({ brolls: results }, null, 2));
console.log(`\nWrote: ${outPath}`);

// Print FFmpeg filter_complex snippet
console.log('\n── FFmpeg filter_complex snippet ──');
const scaleParts  = results.map((r, i) => `[${i+1}:v]scale=1080:1920,setpts=PTS-STARTPTS[br${i}]`);
const overlayParts = results.map((r, i) => {
  const src = i === 0 ? '[0:v]' : `[v${i-1}]`;
  return `${src}[br${i}]overlay=0:0:enable='between(t,${r.concat_start},${r.concat_end})'[v${i}]`;
});
console.log(scaleParts.join(';\n') + ';\n' + overlayParts.join(';\n'));
console.log(`\n-map "[v${results.length - 1}]" -map 0:a`);
