#!/usr/bin/env node
// cut-segments.js
// Phase 1 — Cut segments from main_clean.mp4 using Claude-generated cut_plan.json
//
// Usage: node scripts/cut-segments.js <project_path>
// Reads:  segments/cut_plan.json
//         footage/main_clean.mp4  (name read from cut_plan.json "source" field)
// Writes: segments/seg_000.mp4 ... seg_NNN.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node cut-segments.js <project_path>'); process.exit(1); }

const PLAN    = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'cut_plan.json'), 'utf8'));
const SOURCE  = path.join(PROJECT_DIR, 'footage', PLAN.source || 'main_clean.mp4');
const OUT_DIR = path.join(PROJECT_DIR, 'segments');

const pad = n => String(n).padStart(3, '0');
let passed = 0, failed = 0;
const errors = [];

console.log(`Source: ${SOURCE}`);
console.log(`Segments: ${PLAN.total_segments}`);
console.log('');

for (const seg of PLAN.segments) {
  const outFile = path.join(OUT_DIR, `seg_${pad(seg.id)}.mp4`);
  const cmd = [
    'ffmpeg',
    `-ss ${seg.start}`,
    `-i "${SOURCE}"`,
    `-t ${seg.duration}`,
    `-c:v libx264 -crf 18 -preset fast`,
    `-c:a aac -ar 44100`,
    `-avoid_negative_ts make_zero`,
    `-y`,
    `"${outFile}"`,
  ].join(' ');

  process.stdout.write(`[${pad(seg.id)}] ${seg.start.toFixed(3)}→${seg.end.toFixed(3)}s  "${seg.text}" ... `);
  try {
    execSync(cmd, { stdio: 'pipe' });
    const stat = fs.statSync(outFile);
    console.log(`OK (${(stat.size / 1024).toFixed(1)} KB)`);
    passed++;
  } catch (e) {
    console.log('FAILED');
    errors.push({ id: seg.id, text: seg.text, error: e.stderr?.toString().split('\n').pop() || e.message });
    failed++;
  }
}

console.log(`\nDone. ${passed} passed, ${failed} failed.`);
if (errors.length) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  [${pad(e.id)}] ${e.text} — ${e.error}`));
  process.exit(1);
}
