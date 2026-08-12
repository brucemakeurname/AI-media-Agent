#!/usr/bin/env node
// zoom-merge-check.js
// Phase 1 — Apply per-segment zoom from Claude-generated zoom_plan.json
//
// Usage: node scripts/zoom-merge-check.js <project_path>
// Reads:  segments/zoom_plan.json
//         segments/seg_NNN.mp4
// Writes: segments/zoomed/seg_NNN_zoom.mp4   ← pipeline output
//         segments/concat_zoom.txt            ← pipeline output (Phase 3 reads this)

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node zoom-merge-check.js <project_path>'); process.exit(1); }

const PLAN       = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'zoom_plan.json'), 'utf8'));
const SEGS_DIR   = path.join(PROJECT_DIR, 'segments');
const ZOOMED_DIR = path.join(PROJECT_DIR, 'segments', 'zoomed');

if (!fs.existsSync(ZOOMED_DIR)) fs.mkdirSync(ZOOMED_DIR, { recursive: true });

const pad = n => String(n).padStart(3, '0');

function zoomFilter(zoomPct) {
  const factor = zoomPct / 100;
  const cw = (1080 / factor).toFixed(4);
  const ch = (1920 / factor).toFixed(4);
  const x  = ((1080 - 1080 / factor) / 2).toFixed(4);
  const y  = ((1920 - 1920 / factor) / 2).toFixed(4);
  // Normalise every vertical source to the delivery canvas before applying the
  // crop. Some projects supply 720x1280 segments; cropping them against the
  // fixed 1080x1920 design canvas produces invalid crop expressions.
  return `scale=1080:1920:flags=lanczos,crop=${cw}:${ch}:${x}:${y},scale=1080:1920:flags=lanczos`;
}

// ── Step 1: Apply zoom ────────────────────────────────────────────────────────
console.log(`\n── Step 1: Apply zoom ──────────────────────────────────`);
let zoomPassed = 0, zoomFailed = 0;
const zoomErrors = [];

for (const seg of PLAN.segments) {
  const src  = path.join(SEGS_DIR, `seg_${pad(seg.id)}.mp4`);
  const dest = path.join(ZOOMED_DIR, `seg_${pad(seg.id)}_zoom.mp4`);
  process.stdout.write(`[${pad(seg.id)}] zoom=${seg.zoom}%  "${seg.text}" ... `);

  const cmd = [
    'ffmpeg',
    `-i "${src}"`,
    `-vf "${zoomFilter(seg.zoom)}"`,
    `-c:v libx264 -crf 18 -preset fast`,
    `-c:a aac -ar 44100 -y`,
    `"${dest}"`,
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log('OK');
    zoomPassed++;
  } catch (e) {
    console.log('FAILED');
    zoomErrors.push({ id: seg.id, error: e.stderr?.toString().split('\n').pop() || e.message });
    zoomFailed++;
  }
}
console.log(`\nZoom: ${zoomPassed} passed, ${zoomFailed} failed`);
if (zoomFailed > 0) {
  zoomErrors.forEach(e => console.error(`  [${pad(e.id)}] ${e.error}`));
  process.exit(1);
}

// ── Step 2: Build concat list (read by composite-aroll.js in Phase 3) ─────────
console.log(`\n── Step 2: Build concat list ───────────────────────────`);
const concatPath = path.join(SEGS_DIR, 'concat_zoom.txt');
fs.writeFileSync(concatPath,
  PLAN.segments.map(s =>
    `file '${path.join(ZOOMED_DIR, `seg_${pad(s.id)}_zoom.mp4`).replace(/\\/g, '/')}'`
  ).join('\n') + '\n'
);
console.log(`Written: ${concatPath}`);
console.log(`\n✓ Done. ${zoomPassed} zoomed segments → segments/zoomed/`);
