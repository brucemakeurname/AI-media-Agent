#!/usr/bin/env node
// composite-subtitle.js
// Phase 5 — Overlay subtitle_overlay.mov (ProRes 4444) onto assembled_broll.mp4
//
// Usage: node scripts/composite-subtitle.js <project_path>
// Reads:  output/assembled_broll.mp4
//         subtitles/subtitle_overlay.mov
// Writes: output/assembled_sub.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node composite-subtitle.js <project_path>'); process.exit(1); }

const ASSEMBLED_BROLL = path.join(PROJECT_DIR, 'output', 'assembled_broll.mp4');
const SUBTITLE_MOV    = path.join(PROJECT_DIR, 'subtitles', 'subtitle_overlay.mov');
const ASSEMBLED_SUB   = path.join(PROJECT_DIR, 'output', 'assembled_sub.mp4');

if (!fs.existsSync(ASSEMBLED_BROLL)) { console.error(`Not found: ${ASSEMBLED_BROLL}`); process.exit(1); }
if (!fs.existsSync(SUBTITLE_MOV))    { console.error(`Not found: ${SUBTITLE_MOV}. Render the subtitle comp first.`); process.exit(1); }

console.log('Compositing subtitle overlay onto assembled_broll.mp4...');

const cmd = [
  'ffmpeg -y',
  `-i "${ASSEMBLED_BROLL}"`,
  `-i "${SUBTITLE_MOV}"`,
  `-filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass[out]"`,
  `-map [out] -map 0:a`,
  `-c:v libx264 -crf 18 -preset fast`,
  `-c:a copy`,
  `"${ASSEMBLED_SUB}"`,
].join(' ');

execSync(cmd, { stdio: 'inherit' });

const stat = fs.statSync(ASSEMBLED_SUB);
const dur  = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${ASSEMBLED_SUB}"`).toString().trim()
);
console.log(`\n✓ assembled_sub.mp4  ${dur.toFixed(3)}s  ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
