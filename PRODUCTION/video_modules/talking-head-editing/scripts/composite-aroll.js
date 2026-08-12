#!/usr/bin/env node
// composite-aroll.js
// Phase 3 — Composite A-roll overlays onto base_zoomed.mp4
//           Reads aroll_timestamp.json, builds FFmpeg overlay command, executes it.
//
// Usage: node scripts/composite-aroll.js <project_path>
// Reads:  aroll_renders/aroll_timestamp.json
//         segments/concat_zoom.txt  (or builds base_zoomed if missing)
//         aroll_renders/ar_00.mov ... ar_NN.mov
// Writes: aroll_renders/base_zoomed.mp4
//         aroll_renders/aroll_footage.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node composite-aroll.js <project_path>'); process.exit(1); }

const arollData = JSON.parse(
  fs.readFileSync(path.join(PROJECT_DIR, 'aroll_renders', 'aroll_timestamp.json'), 'utf8')
);

const BASE_ZOOMED = path.join(PROJECT_DIR, 'aroll_renders', 'base_zoomed.mp4');
const AROLL_FOOTAGE = path.join(PROJECT_DIR, 'aroll_renders', 'aroll_footage.mp4');
const CONCAT_TXT = path.join(PROJECT_DIR, 'segments', 'concat_zoom.txt');

// ── Step 1: Build base_zoomed.mp4 if not present ─────────────────────────────
if (!fs.existsSync(BASE_ZOOMED)) {
  console.log('Building base_zoomed.mp4 from zoomed segments...');
  if (!fs.existsSync(CONCAT_TXT)) {
    console.error(`concat_zoom.txt not found at ${CONCAT_TXT}. Run zoom-merge-check.js first.`);
    process.exit(1);
  }
  execSync([
    'ffmpeg', `-f concat -safe 0`, `-i "${CONCAT_TXT}"`,
    `-c copy -y`, `"${BASE_ZOOMED}"`,
  ].join(' '), { stdio: 'inherit' });
  console.log('base_zoomed.mp4 built.');
} else {
  console.log('base_zoomed.mp4 already exists — skipping rebuild.');
}

// ── Step 2: Build FFmpeg overlay command ─────────────────────────────────────
const clusters = arollData.clusters.filter(c => c.render_verified);
if (!clusters.length) {
  console.error('No verified clusters in aroll_timestamp.json');
  process.exit(1);
}

console.log(`\nCompositing ${clusters.length} A-roll overlays...`);

// Inputs: base_zoomed + each ar_NN.mov
const inputs = [`-i "${BASE_ZOOMED}"`];
clusters.forEach(c => {
  inputs.push(`-i "${path.join(PROJECT_DIR, c.render)}"`);
});

// Filter complex: setpts=PTS+{offset}/TB per overlay, chained
const filterParts = [];
clusters.forEach((c, i) => {
  filterParts.push(`[${i + 1}:v]setpts=PTS+${c.asm_start.toFixed(4)}/TB[ov${i}]`);
});
let prev = '0:v';
clusters.forEach((c, i) => {
  const out = i < clusters.length - 1 ? `[v${i}]` : '[vout]';
  filterParts.push(`[${prev}][ov${i}]overlay=0:0:eof_action=pass${out}`);
  prev = `v${i}`;
});

const filterComplex = filterParts.join(';');

const cmd = [
  'ffmpeg -y',
  inputs.join(' '),
  `-filter_complex "${filterComplex}"`,
  `-map [vout] -map 0:a`,
  `-c:v libx264 -crf 18 -preset fast`,
  `-c:a copy`,
  `"${AROLL_FOOTAGE}"`,
].join(' ');

console.log('\nRunning FFmpeg overlay...');
execSync(cmd, { stdio: 'inherit' });

// ── Step 3: Verify ────────────────────────────────────────────────────────────
const stat = fs.statSync(AROLL_FOOTAGE);
const probeDur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${AROLL_FOOTAGE}"`).toString().trim()
);
console.log(`\n✓ aroll_footage.mp4  ${probeDur.toFixed(3)}s  ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
