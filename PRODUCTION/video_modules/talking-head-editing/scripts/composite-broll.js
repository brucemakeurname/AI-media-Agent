#!/usr/bin/env node
// composite-broll.js
// Phase 5 — Overlay all B-rolls onto aroll_footage.mp4 using -itsoffset per input
//           Each B-roll is a full-frame overlay at its exact concat_start position.
//
// Usage: node scripts/composite-broll.js <project_path>
// Reads:  aroll_renders/aroll_footage.mp4
//         broll_renders/broll_concat_exact.json
//         broll_renders/br_NN_trim.mp4  (pre-trimmed, from pretrim-brolls.js)
// Writes: output/assembled_broll.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node composite-broll.js <project_path>'); process.exit(1); }

const exactData    = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'broll_renders', 'broll_concat_exact.json'), 'utf8'));
const AROLL_BASE   = path.join(PROJECT_DIR, 'aroll_renders', 'aroll_footage.mp4');
const OUTPUT_DIR   = path.join(PROJECT_DIR, 'output');
const ASSEMBLED    = path.join(OUTPUT_DIR, 'assembled_broll.mp4');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const brolls = exactData.brolls;
console.log(`Overlaying ${brolls.length} B-rolls onto aroll_footage.mp4...`);

// Build inputs: base first, then each B-roll with -itsoffset
const inputs = [`-i "${AROLL_BASE}"`];
brolls.forEach(br => {
  const trimmed = path.join(PROJECT_DIR, br.trimmed);
  inputs.push(`-itsoffset ${br.concat_start} -i "${trimmed}"`);
});

// Filter complex: scale each B-roll + overlay chain
const scales   = brolls.map((br, i) => `[${i + 1}:v]scale=1080:1920[br${i}]`);
const overlays = brolls.map((br, i) => {
  const src = i === 0 ? '[0:v]' : `[v${i - 1}]`;
  const dst = i < brolls.length - 1 ? `[v${i}]` : '[vout]';
  return `${src}[br${i}]overlay=0:0:enable='between(t,${br.concat_start},${br.concat_end})':eof_action=pass${dst}`;
});
const filterComplex = [...scales, ...overlays].join(';');

const cmd = [
  'ffmpeg -y',
  inputs.join(' \\\n  '),
  `-filter_complex "${filterComplex}"`,
  `-map [vout] -map 0:a`,
  `-c:v libx264 -crf 18 -preset fast`,
  `-c:a copy`,
  `"${ASSEMBLED}"`,
].join(' ');

console.log('\nRunning FFmpeg B-roll overlay...');
execSync(cmd, { stdio: 'inherit' });

const stat = fs.statSync(ASSEMBLED);
const dur  = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${ASSEMBLED}"`).toString().trim()
);
console.log(`\n✓ assembled_broll.mp4  ${dur.toFixed(3)}s  ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
