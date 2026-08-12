#!/usr/bin/env node
// cut-segments.js
// Reads segments/cut_plan.json and cuts each segment from footage/main_clean_2.mp4
// Output: segments/seg_000.mp4 ... seg_064.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const SOURCE      = path.join(PROJECT_DIR, 'footage', 'main_clean_2.mp4');
const PLAN        = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'cut_plan.json'), 'utf8'));
const OUT_DIR     = path.join(PROJECT_DIR, 'segments');

const pad = n => String(n).padStart(3, '0');

let passed = 0;
let failed = 0;
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
        `"${outFile}"`
    ].join(' ');

    process.stdout.write(`[${pad(seg.id)}] ${seg.start.toFixed(3)}→${seg.end.toFixed(3)}s  "${seg.text}" ... `);

    try {
        execSync(cmd, { stdio: 'pipe' });
        const stat = fs.statSync(outFile);
        console.log(`OK (${(stat.size / 1024).toFixed(1)} KB)`);
        passed++;
    } catch (e) {
        console.log(`FAILED`);
        errors.push({ id: seg.id, text: seg.text, error: e.stderr?.toString().split('\n').pop() || e.message });
        failed++;
    }
}

console.log('');
console.log(`Done. ${passed} passed, ${failed} failed.`);

if (errors.length) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  [${pad(e.id)}] ${e.text} — ${e.error}`));
}
