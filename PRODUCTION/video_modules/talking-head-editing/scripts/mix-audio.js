#!/usr/bin/env node
// mix-audio.js
// Phase 5 — Final audio mix: dialogue (0.85) + B-roll SFX + A-roll SFX + BGM (fade in/out)
//           Produces the final deliverable MP4.
//
// Usage: node scripts/mix-audio.js <project_path>
// Reads:  output/assembled_sub.mp4
//         broll_renders/broll_sfx_timestamp.json
//         aroll_renders/aroll_sfx_timestamp.json
//         audio/bgm_manifest.json
// Writes: output/{project_id}_final.mp4
//         output/thumbnail-needed.json

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node mix-audio.js <project_path>'); process.exit(1); }

const brief = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'brief.json'), 'utf8'));
const PROJECT_ID = brief.project_id;

const ASSEMBLED_SUB = path.join(PROJECT_DIR, 'output', 'assembled_sub.mp4');
const FINAL_OUT     = path.join(PROJECT_DIR, 'output', `${PROJECT_ID}_final.mp4`);

// SFX root (where sfx files are stored relative to — overridable via env)
const SFX_ROOT = process.env.SFX_ROOT ||
  'D:/1. SOLOFLOWS/5. INFRASTRUCTURE/INHOUSE TEAMS/2. Media Team/5. Video Hub/hyperframe-video-gen/assets/sfx';

// ── Load SFX manifests ────────────────────────────────────────────────────────
const brollSfxPath = path.join(PROJECT_DIR, 'broll_renders', 'broll_sfx_timestamp.json');
const arollSfxPath = path.join(PROJECT_DIR, 'aroll_renders', 'aroll_sfx_timestamp.json');
const bgmPath      = path.join(PROJECT_DIR, 'audio', 'bgm_manifest.json');

const brollSfx = fs.existsSync(brollSfxPath) ? JSON.parse(fs.readFileSync(brollSfxPath, 'utf8')) : { brolls: [] };
const arollSfx = fs.existsSync(arollSfxPath) ? JSON.parse(fs.readFileSync(arollSfxPath, 'utf8')) : { clusters: [] };
const bgm      = fs.existsSync(bgmPath)       ? JSON.parse(fs.readFileSync(bgmPath, 'utf8'))       : null;

// Probe assembled_sub.mp4 duration
const videoDur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${ASSEMBLED_SUB}"`).toString().trim()
);
console.log(`Video duration: ${videoDur.toFixed(3)}s`);

// ── Collect all SFX entries ───────────────────────────────────────────────────
const sfxEntries = [];

// B-roll SFX
for (const br of (brollSfx.brolls || [])) {
  for (const s of (br.sfx || [])) {
    sfxEntries.push({ file: path.join(SFX_ROOT, s.file), offsetSec: br.start + (s.offset_sec || 0), volume: s.volume });
  }
}

// A-roll SFX
for (const cl of (arollSfx.clusters || [])) {
  for (const s of (cl.sfx || [])) {
    sfxEntries.push({ file: path.join(SFX_ROOT, s.file), offsetSec: cl.asm_start + (s.offset_sec || 0), volume: s.volume });
  }
}

console.log(`SFX entries: ${sfxEntries.length}`);

// ── Build FFmpeg inputs + filtergraph ─────────────────────────────────────────
const inputs = [`-i "${ASSEMBLED_SUB}"`];
const filterParts = [];

// Main dialogue at 0.85
filterParts.push(`[0:a]volume=0.85[main]`);
const mixTags = ['[main]'];

sfxEntries.forEach((s, i) => {
  const idx       = i + 1;
  const delayMs   = Math.round(s.offsetSec * 1000);
  const sfxTag    = `sfx${i}`;
  inputs.push(`-i "${s.file}"`);
  filterParts.push(`[${idx}:a]adelay=${delayMs}|${delayMs},volume=${s.volume.toFixed(2)}[${sfxTag}]`);
  mixTags.push(`[${sfxTag}]`);
});

// BGM
if (bgm) {
  const bgmFile = path.join(PROJECT_DIR, 'audio', 'bgm.mp3');
  const bgmVol  = bgm.volume || 0.11;
  const fadeIn  = bgm.fade_in_start  != null ? bgm.fade_in_start  : 0;
  const fadeOut = bgm.fade_out_start != null ? bgm.fade_out_start : videoDur - 1.5;
  const bgmIdx  = inputs.length;
  inputs.push(`-stream_loop -1 -i "${bgmFile}"`);
  filterParts.push(
    `[${bgmIdx}:a]atrim=end=${videoDur.toFixed(3)},` +
    `afade=t=in:st=${fadeIn}:d=1.5,` +
    `afade=t=out:st=${fadeOut.toFixed(3)}:d=1.5,` +
    `volume=${bgmVol.toFixed(2)}[bgm]`
  );
  mixTags.push('[bgm]');
  console.log(`BGM: ${bgm.track_name || bgmFile}  vol=${bgmVol}`);
}

filterParts.push(`${mixTags.join('')}amix=inputs=${mixTags.length}:normalize=0:duration=first[aout]`);

const cmd = [
  'ffmpeg -y',
  inputs.join(' \\\n  '),
  `-filter_complex "${filterParts.join(';')}"`,
  `-map 0:v -map [aout]`,
  `-c:v copy`,
  `-c:a aac -ar 44100`,
  `"${FINAL_OUT}"`,
].join(' ');

console.log('\nRunning final audio mix...');
execSync(cmd, { stdio: 'inherit' });

// ── Verify ────────────────────────────────────────────────────────────────────
const stat    = fs.statSync(FINAL_OUT);
const finalDur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${FINAL_OUT}"`).toString().trim()
);
const sizeMB = (stat.size / 1024 / 1024).toFixed(1);

if (stat.size < 1024 * 1024) {
  console.error('✗ Output file too small — something went wrong');
  process.exit(1);
}
if (brief.target_duration_sec && Math.abs(finalDur - brief.target_duration_sec) > 2) {
  console.warn(`⚠ Duration ${finalDur.toFixed(1)}s deviates >2s from target ${brief.target_duration_sec}s`);
}

console.log(`\n✓ ${PROJECT_ID}_final.mp4  ${finalDur.toFixed(3)}s  ${sizeMB} MB`);

// Write thumbnail signal for Design Hub
const thumbnailSignal = { project_id: PROJECT_ID, final_video: `output/${PROJECT_ID}_final.mp4`, status: 'needs_thumbnail' };
fs.writeFileSync(path.join(PROJECT_DIR, 'output', 'thumbnail-needed.json'), JSON.stringify(thumbnailSignal, null, 2));
console.log('thumbnail-needed.json written → Design Hub signal');
