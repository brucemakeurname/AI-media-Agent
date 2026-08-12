#!/usr/bin/env node
// zoom-merge-check.js
// 1. Reads segments/zoom_plan.json
// 2. Applies zoom crop to each seg_NNN.mp4 → segments/zoomed/seg_NNN_zoom.mp4
// 3. Concatenates all zoomed segments → footage/zoom_check_raw.mp4
// 4. Generates logs/zoom_check.srt with accumulated timestamps + zoom% label
// 5. Burns SRT → footage/zoom_check.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const PLAN        = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'segments', 'zoom_plan.json'), 'utf8'));
const SEGS_DIR    = path.join(PROJECT_DIR, 'segments');
const ZOOMED_DIR  = path.join(PROJECT_DIR, 'segments', 'zoomed');
const FOOTAGE_DIR = path.join(PROJECT_DIR, 'footage');
const LOGS_DIR    = path.join(PROJECT_DIR, 'logs');

const OUT_RAW     = path.join(FOOTAGE_DIR, 'zoom_check_raw.mp4');
const OUT_SRT     = path.join(LOGS_DIR, 'zoom_check.srt');
const OUT_FINAL   = path.join(FOOTAGE_DIR, 'zoom_check.mp4');

const pad = n => String(n).padStart(3, '0');

// ── helpers ──────────────────────────────────────────────────────────────────

function toSRTTime(sec) {
    const h   = Math.floor(sec / 3600);
    const m   = Math.floor((sec % 3600) / 60);
    const s   = Math.floor(sec % 60);
    const ms  = Math.round((sec - Math.floor(sec)) * 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
}

function zoomFilter(zoomPct) {
    // Crop center to 1/factor of the frame, then scale back to 1080x1920
    const factor = zoomPct / 100;
    const cw = (1080 / factor).toFixed(4);
    const ch = (1920 / factor).toFixed(4);
    const x  = ((1080 - 1080 / factor) / 2).toFixed(4);
    const y  = ((1920 - 1920 / factor) / 2).toFixed(4);
    return `crop=${cw}:${ch}:${x}:${y},scale=1080:1920:flags=lanczos`;
}

// ── Step 1: Apply zoom to each segment ───────────────────────────────────────

if (!fs.existsSync(ZOOMED_DIR)) fs.mkdirSync(ZOOMED_DIR, { recursive: true });

console.log(`\n── Step 1: Apply zoom ──────────────────────────────────`);
let zoomPassed = 0, zoomFailed = 0;
const zoomErrors = [];

for (const seg of PLAN.segments) {
    const src  = path.join(SEGS_DIR, `seg_${pad(seg.id)}.mp4`);
    const dest = path.join(ZOOMED_DIR, `seg_${pad(seg.id)}_zoom.mp4`);

    process.stdout.write(`[${pad(seg.id)}] zoom=${seg.zoom}%  "${seg.text}" ... `);

    const vf  = zoomFilter(seg.zoom);
    const cmd = [
        'ffmpeg',
        `-i "${src}"`,
        `-vf "${vf}"`,
        `-c:v libx264 -crf 18 -preset fast`,
        `-c:a aac -ar 44100`,
        `-y`,
        `"${dest}"`
    ].join(' ');

    try {
        execSync(cmd, { stdio: 'pipe' });
        console.log(`OK`);
        zoomPassed++;
    } catch (e) {
        console.log(`FAILED`);
        zoomErrors.push({ id: seg.id, error: e.stderr?.toString().split('\n').pop() || e.message });
        zoomFailed++;
    }
}

console.log(`\nZoom: ${zoomPassed} passed, ${zoomFailed} failed`);
if (zoomErrors.length) {
    zoomErrors.forEach(e => console.error(`  [${pad(e.id)}] ${e.error}`));
    if (zoomFailed > 0) { console.error('Aborting — zoom step had failures'); process.exit(1); }
}

// ── Step 2: Build concat list ─────────────────────────────────────────────

console.log(`\n── Step 2: Build concat list ───────────────────────────`);
const concatPath = path.join(SEGS_DIR, 'concat_zoom.txt');
const concatLines = PLAN.segments.map(seg =>
    `file '${path.join(ZOOMED_DIR, `seg_${pad(seg.id)}_zoom.mp4`).replace(/\\/g, '/')}'`
);
fs.writeFileSync(concatPath, concatLines.join('\n') + '\n');
console.log(`Written: ${concatPath}`);

// ── Step 3: Concatenate ───────────────────────────────────────────────────

console.log(`\n── Step 3: Concatenate ──────────────────────────────────`);
const concatCmd = [
    'ffmpeg',
    `-f concat -safe 0`,
    `-i "${concatPath}"`,
    `-c:v libx264 -crf 18 -preset fast`,
    `-c:a aac -ar 44100`,
    `-y`,
    `"${OUT_RAW}"`
].join(' ');

try {
    execSync(concatCmd, { stdio: 'pipe' });
    const stat = fs.statSync(OUT_RAW);
    console.log(`OK — ${(stat.size / 1024 / 1024).toFixed(1)} MB → ${OUT_RAW}`);
} catch (e) {
    console.error('Concat failed:', e.stderr?.toString().split('\n').slice(-5).join('\n'));
    process.exit(1);
}

// ── Step 4: Generate SRT using ACTUAL segment durations (ffprobe) ────────
// Using planned durations from JSON causes drift (+3s over 65 segments) because
// re-encoded frames are padded to keyframe boundaries. Probe actual file lengths.

console.log(`\n── Step 4: Generate SRT (ffprobe actual durations) ──────`);

function probeActualDuration(filePath) {
    const out = execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
        { stdio: 'pipe' }
    ).toString().trim();
    return parseFloat(out);
}

let cursor = 0;
let totalPlan = 0, totalActual = 0;
const srtBlocks = PLAN.segments.map((seg, i) => {
    const zoomFile = path.join(ZOOMED_DIR, `seg_${pad(seg.id)}_zoom.mp4`);
    const actualDur = probeActualDuration(zoomFile);
    totalPlan   += seg.duration;
    totalActual += actualDur;

    const t0 = cursor;
    const t1 = cursor + actualDur;
    cursor = t1;
    return [
        String(i + 1),
        `${toSRTTime(t0)} --> ${toSRTTime(t1)}`,
        `${seg.text}  [${seg.zoom}%]`,
        ''
    ].join('\n');
});
fs.writeFileSync(OUT_SRT, srtBlocks.join('\n'));
console.log(`Written: ${OUT_SRT}`);
console.log(`  Planned total: ${totalPlan.toFixed(3)}s  |  Actual total: ${totalActual.toFixed(3)}s  |  Drift corrected: +${(totalActual - totalPlan).toFixed(3)}s`);

// ── Step 5: Burn subtitles ────────────────────────────────────────────────

console.log(`\n── Step 5: Burn subtitles ───────────────────────────────`);

// FFmpeg subtitles filter needs forward slashes and escaped colons on Windows
const srtFFmpeg = OUT_SRT.replace(/\\/g, '/').replace(/:/g, '\\:');

const burnCmd = [
    'ffmpeg',
    `-i "${OUT_RAW}"`,
    `-vf "subtitles='${srtFFmpeg}':force_style='FontName=Arial,FontSize=28,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Alignment=2,MarginV=60'"`,
    `-c:v libx264 -crf 18 -preset fast`,
    `-c:a copy`,
    `-y`,
    `"${OUT_FINAL}"`
].join(' ');

try {
    execSync(burnCmd, { stdio: 'pipe' });
    const stat = fs.statSync(OUT_FINAL);
    console.log(`OK — ${(stat.size / 1024 / 1024).toFixed(1)} MB → ${OUT_FINAL}`);
} catch (e) {
    console.error('Subtitle burn failed:', e.stderr?.toString().split('\n').slice(-5).join('\n'));
    process.exit(1);
}

console.log(`\n✓ Done. Check video: footage/zoom_check.mp4`);
