/**
 * Final Assembly Script — proj_teleprompter_01
 *
 * Reads whisperx word data + broll_timestamp.json + broll_sfx_timestamp.json
 * Step 1: Map whisperx words to assembled timeline, generate SRT
 * Step 2: FFmpeg overlay B-rolls + SFX
 * Step 3: Burn subtitles
 * Output: output/proj_teleprompter_01_final.mp4
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(__dirname, '..');
const SEGMENTS_DIR = path.join(PROJECT, 'segments', 'zoomed');
const BROLL_DIR = path.join(PROJECT, 'broll_renders');
const SFX_ROOT = 'D:/1. SOLOFLOWS/5. INFRASTRUCTURE/INHOUSE TEAMS/2. Media Team/5. Video Hub/hyperframe-video-gen/assets/sfx';
const OUTPUT_DIR = path.join(PROJECT, 'output');
const SUBTITLES_DIR = path.join(PROJECT, 'subtitles');
const BASE_VIDEO = path.join(PROJECT, 'footage', 'zoom_check.mp4');

// ─── Load Data ─────────────────────────────────────────────────────────────
const cutPlan = JSON.parse(fs.readFileSync(path.join(PROJECT, 'segments', 'cut_plan.json'), 'utf8'));
const wordData = JSON.parse(fs.readFileSync(path.join(PROJECT, 'logs', 'whisperx_word_transcript.json'), 'utf8'));
const brollData = JSON.parse(fs.readFileSync(path.join(BROLL_DIR, 'broll_timestamp.json'), 'utf8'));
const sfxData = JSON.parse(fs.readFileSync(path.join(BROLL_DIR, 'broll_sfx_timestamp.json'), 'utf8'));

// ─── Step 1: Calculate Assembled Timeline Cumulative Positions ─────────────
console.log('Probing zoomed segment durations...');
const segDurations = [];
for (let i = 0; i < 65; i++) {
  const f = path.join(SEGMENTS_DIR, `seg_${String(i).padStart(3,'0')}_zoom.mp4`);
  const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${f}"`).toString().trim();
  segDurations.push(parseFloat(out));
}
const cumulative = [0];
for (const d of segDurations) cumulative.push(cumulative[cumulative.length-1] + d);
const totalDuration = cumulative[65];
console.log(`Assembled duration: ${totalDuration.toFixed(3)}s`);

// ─── Step 2: Map Original Timestamps → Assembled Timeline ──────────────────
const segments = cutPlan.segments;

function origToAssembled(origTime) {
  // Find which segment this time falls in
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (origTime >= seg.start && origTime <= seg.end) {
      const offset = origTime - seg.start;
      return cumulative[i] + offset;
    }
  }
  // If beyond all segments, return totalDuration
  return totalDuration;
}

// ─── Step 3: Generate SRT Subtitles ────────────────────────────────────────
console.log('Generating SRT from whisperx word data...');
const words = wordData.words;

// Group words into subtitle lines (max ~8 words or 4s per line)
const lines = [];
let currentLine = [];
let lineStart = null;
let lineEnd = null;

for (const word of words) {
  const asmStart = origToAssembled(word.start);
  const asmEnd = origToAssembled(word.end);

  if (currentLine.length === 0) {
    lineStart = asmStart;
  }

  currentLine.push(word.word);
  lineEnd = asmEnd;

  // Break at punctuation or max length
  const lineText = currentLine.join(' ');
  const punct = /[.!?,]$/.test(word.word);
  const tooLong = currentLine.length >= 7;
  const tooLongTime = (lineEnd - lineStart) > 3.5;

  if (punct || tooLong || tooLongTime) {
    lines.push({ start: lineStart, end: lineEnd, text: lineText });
    currentLine = [];
    lineStart = null;
  }
}
if (currentLine.length > 0) {
  lines.push({ start: lineStart, end: lineEnd, text: currentLine.join(' ') });
}

// Format SRT
function toSRTTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec % 1) * 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
}

let srt = '';
lines.forEach((line, idx) => {
  srt += `${idx + 1}\n${toSRTTime(line.start)} --> ${toSRTTime(line.end)}\n${line.text}\n\n`;
});

const srtPath = path.join(SUBTITLES_DIR, 'proj_teleprompter_01.srt');
fs.writeFileSync(srtPath, srt);
console.log(`SRT written: ${lines.length} lines → ${srtPath}`);

// ─── Step 4: Build FFmpeg Assembly Command ─────────────────────────────────
console.log('Building FFmpeg command...');

// B-roll assembled positions
const brollPositions = {
  br_00: { start: cumulative[4],  dur: 5.167 },
  br_01: { start: cumulative[11], dur: 8.300 },
  br_02: { start: cumulative[21], dur: 6.200 },
  br_03: { start: cumulative[25], dur: 4.633 },
  br_04: { start: cumulative[30], dur: 3.667 },
  br_05: { start: cumulative[33], dur: 4.333 },
  br_06: { start: cumulative[39], dur: 6.267 },
  br_07: { start: cumulative[46], dur: 5.367 },
  br_08: { start: cumulative[51], dur: 5.733 },
  br_09: { start: cumulative[54], dur: 4.133 },
  br_10: { start: cumulative[57], dur: 4.733 },
  br_11: { start: cumulative[61], dur: 4.267 },
};

// SFX assignments indexed by broll_id
const sfxMap = {};
for (const entry of sfxData.broll_sfx) {
  sfxMap[entry.broll_id] = entry;
}

// Build input list
const brollIds = Object.keys(brollPositions);
const inputs = [];
inputs.push(`-i "${BASE_VIDEO}"`);  // input 0: main video

// B-roll video inputs (inputs 1-12)
for (const id of brollIds) {
  inputs.push(`-i "${path.join(BROLL_DIR, id + '.mp4')}"`);
}

// SFX audio inputs (inputs 13-24)
const sfxInputs = [];
for (const id of brollIds) {
  const sfx = sfxMap[id];
  const sfxPath = SFX_ROOT + '/' + sfx.sfx_file;
  inputs.push(`-i "${sfxPath}"`);
  sfxInputs.push({ id, sfxIdx: inputs.length - 1, volume: sfx.sfx_volume, start: brollPositions[id].start });
}

// Build filter_complex
const filterLines = [];

// Video chain: start with [0:v], overlay each b-roll in sequence
let prevVTag = '0:v';
brollIds.forEach((id, i) => {
  const pos = brollPositions[id];
  const endT = (pos.start + pos.dur).toFixed(3);
  const startT = pos.start.toFixed(3);
  const inputIdx = i + 1;
  const outTag = `v${i+1}`;
  filterLines.push(`[${prevVTag}][${inputIdx}:v]overlay=0:0:enable='between(t,${startT},${endT})'[${outTag}]`);
  prevVTag = outTag;
});

// Audio chain: main audio at 0.85 vol + SFX delays
filterLines.push(`[0:a]volume=0.85[main_a]`);
const sfxTags = ['main_a'];
brollIds.forEach((id, i) => {
  const sfxEntry = sfxInputs[i];
  const delayMs = Math.round(sfxEntry.start * 1000);
  const sfxInputIdx = 13 + i;
  const sfxTag = `sfx${i}`;
  filterLines.push(`[${sfxInputIdx}:a]adelay=${delayMs}|${delayMs},volume=${sfxEntry.volume.toFixed(2)}[${sfxTag}]`);
  sfxTags.push(sfxTag);
});
filterLines.push(`${sfxTags.map(t=>`[${t}]`).join('')}amix=inputs=${sfxTags.length}:normalize=0:duration=first[aout]`);

const filterComplex = filterLines.join(';\n');
const intermediatePath = path.join(OUTPUT_DIR, 'assembled_broll.mp4');
const finalPath = path.join(OUTPUT_DIR, 'proj_teleprompter_01_final.mp4');

// Use forward slashes for all paths in ffmpeg commands (Windows ffmpeg handles them fine)
function fwd(p) { return p.replace(/\\/g, '/'); }

// Write filter_complex to a file to avoid shell escaping issues
const filterScriptPath = path.join(__dirname, 'filter_complex.txt');
fs.writeFileSync(filterScriptPath, filterComplex);

const step4Cmd = [
  'ffmpeg -y',
  inputs.map(i => i.replace(/\\/g, '/')).join(' '),
  `-filter_complex_script "${fwd(filterScriptPath)}"`,
  `-map [${prevVTag}]`,
  `-map [aout]`,
  `-c:v libx264 -crf 18 -r 30`,
  `-c:a aac -ar 44100`,
  `"${fwd(intermediatePath)}"`
].join(' ');

console.log('Writing step4 command to scripts/step4_cmd.bat...');
fs.writeFileSync(path.join(__dirname, 'step4_cmd.bat'), '@echo off\n' + step4Cmd + '\n');
fs.writeFileSync(path.join(__dirname, 'step4_cmd.txt'), step4Cmd);

// Step 5: Subtitle burn command
const srtPathFwd = fwd(srtPath).replace(/:/g, '\\:');
const step5Cmd = [
  'ffmpeg -y',
  `-i "${fwd(intermediatePath)}"`,
  `-vf "subtitles='${srtPathFwd}':force_style='FontName=Inter,FontSize=42,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Shadow=1,Alignment=2,MarginV=220'"`,
  `-c:a copy`,
  `"${fwd(finalPath)}"`
].join(' ');

fs.writeFileSync(path.join(__dirname, 'step5_cmd.bat'), '@echo off\n' + step5Cmd + '\n');
fs.writeFileSync(path.join(__dirname, 'step5_cmd.txt'), step5Cmd);
console.log('Writing step5 command to scripts/step5_cmd.bat...');

// ─── Execute ────────────────────────────────────────────────────────────────
console.log('\n=== Step 4: Assembling B-roll overlay + SFX mix... ===');
console.log(`Output: ${intermediatePath}`);
try {
  execSync(`cmd /c "${path.join(__dirname, 'step4_cmd.bat')}"`, { stdio: 'inherit' });
  console.log('Step 4 complete.');
} catch (err) {
  console.error('Step 4 FAILED. Check scripts/step4_cmd.txt for the command.');
  process.exit(1);
}

console.log('\n=== Step 5: Burning subtitles... ===');
console.log(`Output: ${finalPath}`);
try {
  execSync(`cmd /c "${path.join(__dirname, 'step5_cmd.bat')}"`, { stdio: 'inherit' });
  console.log('Step 5 complete.');
} catch (err) {
  console.error('Step 5 FAILED. Check scripts/step5_cmd.txt for the command.');
  process.exit(1);
}

// ─── Verify ─────────────────────────────────────────────────────────────────
console.log('\n=== Verification ===');
const verifyCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,duration -of default=noprint_wrappers=1 "${finalPath}"`;
const result = execSync(verifyCmd).toString().trim();
console.log(result);
const size = fs.statSync(finalPath).size;
console.log(`File size: ${(size / 1024 / 1024).toFixed(1)} MB`);

if (size > 1024 * 1024) {
  console.log('\n✓ Final video ready:', finalPath);
} else {
  console.error('✗ Output file too small — something went wrong');
  process.exit(1);
}
