#!/usr/bin/env node
// fix-zoom-srt.js
// Regenerates zoom_check.srt using ffprobe actual durations, re-burns onto zoom_check_raw.mp4
// Run this when SRT has drift from planned vs actual segment durations.

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const PLAN        = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'zoom_plan.json'), 'utf8'));
const ZOOMED_DIR  = path.join(PROJECT_DIR, 'segments', 'zoomed');
const OUT_RAW     = path.join(PROJECT_DIR, 'footage', 'zoom_check_raw.mp4');
const OUT_SRT     = path.join(PROJECT_DIR, 'logs', 'zoom_check.srt');
const OUT_FINAL   = path.join(PROJECT_DIR, 'footage', 'zoom_check.mp4');

const pad = n => String(n).padStart(3, '0');

function toSRTTime(sec) {
    const h  = Math.floor(sec / 3600);
    const m  = Math.floor((sec % 3600) / 60);
    const s  = Math.floor(sec % 60);
    const ms = Math.round((sec - Math.floor(sec)) * 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
}

// ── Probe actual durations + build SRT ───────────────────────────────────

console.log('Probing actual segment durations...');
let cursor = 0;
let totalPlan = 0, totalActual = 0;

const srtBlocks = PLAN.segments.map((seg, i) => {
    const f = path.join(ZOOMED_DIR, `seg_${pad(seg.id)}_zoom.mp4`);
    const actual = parseFloat(
        execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${f}"`, { stdio: 'pipe' }).toString().trim()
    );
    totalPlan   += seg.duration;
    totalActual += actual;

    const t0 = cursor;
    const t1 = cursor + actual;
    cursor = t1;
    return `${i + 1}\n${toSRTTime(t0)} --> ${toSRTTime(t1)}\n${seg.text}  [${seg.zoom}%]\n`;
});

fs.writeFileSync(OUT_SRT, srtBlocks.join('\n'));
console.log(`SRT written: ${OUT_SRT}`);
console.log(`  Plan total: ${totalPlan.toFixed(3)}s`);
console.log(`  Actual total: ${totalActual.toFixed(3)}s`);
console.log(`  Drift corrected: +${(totalActual - totalPlan).toFixed(3)}s`);

// ── Re-burn subtitles ─────────────────────────────────────────────────────

console.log('\nBurning corrected SRT...');
const srtFFmpeg = OUT_SRT.replace(/\\/g, '/').replace(/:/g, '\\:');
const cmd = [
    'ffmpeg',
    `-i "${OUT_RAW}"`,
    `-vf "subtitles='${srtFFmpeg}':force_style='FontName=Arial,FontSize=28,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Alignment=2,MarginV=60'"`,
    `-c:v libx264 -crf 18 -preset fast`,
    `-c:a copy`,
    `-y`,
    `"${OUT_FINAL}"`
].join(' ');

try {
    execSync(cmd, { stdio: 'pipe' });
    const stat = fs.statSync(OUT_FINAL);
    console.log(`Done → ${OUT_FINAL}  (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
} catch (e) {
    console.error('Burn failed:', e.stderr?.toString().split('\n').slice(-5).join('\n'));
    process.exit(1);
}
