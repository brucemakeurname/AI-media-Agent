#!/usr/bin/env node
// build-transcripts.js
// Phase 0 — Build whisperx_word_transcript.json + sentence_transcript.json
// from WhisperX direct transcription output on main_clean.mp4
//
// Usage: node scripts/build-transcripts.js <project_path>
// Reads:  logs/whisperx_clean/<any>.json  (first json found)
// Writes: logs/whisperx_word_transcript.json
//         logs/sentence_transcript.json

const fs   = require('fs');
const path = require('path');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!PROJECT_DIR) { console.error('Usage: node build-transcripts.js <project_path>'); process.exit(1); }

const CLEAN_DIR = path.join(PROJECT_DIR, 'logs', 'whisperx_clean');

// Find the first .json in whisperx_clean/
const jsonFiles = fs.readdirSync(CLEAN_DIR).filter(f => f.endsWith('.json'));
if (!jsonFiles.length) { console.error(`No JSON found in ${CLEAN_DIR}`); process.exit(1); }
const wxPath = path.join(CLEAN_DIR, jsonFiles[0]);
console.log(`Reading: ${wxPath}`);
const WX = JSON.parse(fs.readFileSync(wxPath, 'utf8'));

// Probe source duration from footage/main_clean.mp4
const { execSync } = require('child_process');
const cleanVideo = path.join(PROJECT_DIR, 'footage', 'main_clean.mp4');
const sourceDur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${cleanVideo}"`).toString().trim()
);

// ── word_transcript ───────────────────────────────────────────────────────────
const words = WX.word_segments || (WX.segments || []).flatMap(s => s.words || []);

const wordTranscript = {
  source:          path.basename(cleanVideo),
  source_duration: parseFloat(sourceDur.toFixed(4)),
  total_words:     words.length,
  words: words.map(w => ({
    word:  w.word,
    start: parseFloat((+w.start).toFixed(4)),
    end:   parseFloat((+w.end).toFixed(4)),
    score: w.score ?? null,
  })),
};

const wordOut = path.join(PROJECT_DIR, 'logs', 'whisperx_word_transcript.json');
fs.writeFileSync(wordOut, JSON.stringify(wordTranscript, null, 2));
console.log(`whisperx_word_transcript.json: ${words.length} words`);

// ── sentence_transcript ───────────────────────────────────────────────────────
const sentences = (WX.segments || []).map((seg, i) => {
  const segWords = (seg.words || []).filter(w => w.start != null && w.end != null);
  return {
    id:         i,
    text:       seg.text.trim(),
    start:      parseFloat((+seg.start).toFixed(4)),
    end:        parseFloat((+seg.end).toFixed(4)),
    duration:   parseFloat((seg.end - seg.start).toFixed(4)),
    word_count: segWords.length,
    words:      segWords.map(w => w.word),
  };
});

const sentenceTranscript = {
  source:           path.basename(cleanVideo),
  source_duration:  parseFloat(sourceDur.toFixed(4)),
  total_sentences:  sentences.length,
  sentences,
};

const sentOut = path.join(PROJECT_DIR, 'logs', 'sentence_transcript.json');
fs.writeFileSync(sentOut, JSON.stringify(sentenceTranscript, null, 2));
console.log(`sentence_transcript.json: ${sentences.length} sentences`);

console.log('\nSentence breakdown:');
sentences.forEach(s => {
  console.log(`  [${s.start.toFixed(2)}–${s.end.toFixed(2)}] (${s.duration.toFixed(2)}s) ${s.text.substring(0, 70)}`);
});
console.log('\nDone.');
