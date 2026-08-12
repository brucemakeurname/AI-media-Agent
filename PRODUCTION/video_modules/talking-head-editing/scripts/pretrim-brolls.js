#!/usr/bin/env node
// pretrim-brolls.js
// Phase 5 prep — Pre-trim every B-roll to its exact slot duration (clip_trim)
//               Always re-trims even if no overflow, to reset PTS cleanly.
//
// Usage: node scripts/pretrim-brolls.js <project_path>
// Reads:  broll_renders/broll_concat_exact.json
// Writes: broll_renders/br_NN_trim.mp4  (one per B-roll)

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node pretrim-brolls.js <project_path>'); process.exit(1); }

const exactData = JSON.parse(
  fs.readFileSync(path.join(PROJECT_DIR, 'broll_renders', 'broll_concat_exact.json'), 'utf8')
);

let passed = 0, failed = 0;

for (const br of exactData.brolls) {
  const src  = path.join(PROJECT_DIR, br.source);
  const dest = path.join(PROJECT_DIR, br.trimmed);
  const label = br.overflow ? `${br.render_dur}s → ${br.clip_trim}s ⚠` : `${br.clip_trim}s (clean PTS reset)`;
  process.stdout.write(`[${br.id}]  ${label} ... `);

  const cmd = [
    'ffmpeg -y',
    `-i "${src}"`,
    `-t ${br.clip_trim}`,
    `-c:v libx264 -crf 18 -an`,
    `"${dest}"`,
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log('OK');
    passed++;
  } catch (e) {
    console.log('FAILED');
    console.error(`  ${e.stderr?.toString().split('\n').pop() || e.message}`);
    failed++;
  }
}

console.log(`\nDone. ${passed} trimmed, ${failed} failed.`);
if (failed > 0) process.exit(1);
