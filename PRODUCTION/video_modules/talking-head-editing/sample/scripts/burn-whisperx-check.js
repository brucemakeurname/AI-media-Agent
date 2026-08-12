#!/usr/bin/env node
// burn-whisperx-check.js
// Burns word-level subtitles from WhisperX direct transcription onto main_clean_2.mp4

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const WX = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'logs/whisperx_clean/main_clean_2.json'), 'utf8'));

// Extract word_segments (flat) or from segments
const words = WX.word_segments || (WX.segments || []).flatMap(s => s.words || []);

function toSrtTime(sec) {
    const h  = Math.floor(sec / 3600);
    const m  = Math.floor((sec % 3600) / 60);
    const s  = Math.floor(sec % 60);
    const ms = Math.round((sec % 1) * 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
}

let srt = '';
words.forEach((w, i) => {
    srt += `${i + 1}\n`;
    srt += `${toSrtTime(w.start)} --> ${toSrtTime(w.end)}\n`;
    srt += `${w.word}\n\n`;
});

const srtPath = path.join(PROJECT_DIR, 'logs/whisperx_word_check.srt');
fs.writeFileSync(srtPath, srt);
console.log(`SRT written: ${words.length} entries → logs/whisperx_word_check.srt`);

const inputVideo  = path.join(PROJECT_DIR, 'footage/main_clean_2.mp4');
const outputVideo = path.join(PROJECT_DIR, 'footage/whisperx_word_check.mp4');
const srtEscaped  = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

const cmd = [
    'ffmpeg -y',
    `-i "${inputVideo}"`,
    `-vf "subtitles='${srtEscaped}':force_style='FontName=Arial,FontSize=28,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Alignment=2,MarginV=80'"`,
    `-c:v libx264 -crf 22 -preset fast`,
    `-c:a copy`,
    `"${outputVideo}"`
].join(' ');

console.log('Burning subtitles...');
execSync(cmd, { stdio: 'inherit' });
console.log(`\nDone → footage/whisperx_word_check.mp4`);
