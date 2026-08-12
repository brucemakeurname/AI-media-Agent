#!/usr/bin/env node
// build-transcripts.js
// Builds word_transcript.json and sentence_transcript.json from WhisperX direct transcription
// Source: logs/whisperx_clean/main_clean_2.json (transcribed directly on main_clean_2.mp4)

const fs   = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const WX = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'logs/whisperx_clean/main_clean_2.json'), 'utf8'));

const SOURCE_DUR = 87.512;

// ─── word_transcript.json ─────────────────────────────────────────────────────

const words = WX.word_segments || WX.segments.flatMap(s => s.words || []);

const wordTranscript = {
    source:          'main_clean_2.mp4',
    source_duration:  SOURCE_DUR,
    total_words:      words.length,
    words: words.map(w => ({
        word:  w.word,
        start: parseFloat(w.start.toFixed(4)),
        end:   parseFloat(w.end.toFixed(4)),
        score: w.score
    }))
};

fs.writeFileSync(
    path.join(PROJECT_DIR, 'logs/word_transcript.json'),
    JSON.stringify(wordTranscript, null, 2)
);
console.log(`word_transcript.json: ${words.length} words`);

// ─── sentence_transcript.json ─────────────────────────────────────────────────

const sentences = WX.segments.map((seg, i) => {
    const segWords = (seg.words || []).filter(w => w.start != null && w.end != null);
    return {
        id:         i,
        text:       seg.text.trim(),
        start:      parseFloat(seg.start.toFixed(4)),
        end:        parseFloat(seg.end.toFixed(4)),
        duration:   parseFloat((seg.end - seg.start).toFixed(4)),
        word_count: segWords.length,
        words:      segWords.map(w => w.word)
    };
});

const sentenceTranscript = {
    source:          'main_clean_2.mp4',
    source_duration:  SOURCE_DUR,
    total_sentences:  sentences.length,
    sentences
};

fs.writeFileSync(
    path.join(PROJECT_DIR, 'logs/sentence_transcript.json'),
    JSON.stringify(sentenceTranscript, null, 2)
);
console.log(`sentence_transcript.json: ${sentences.length} sentences`);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\nSentence breakdown:');
sentences.forEach(s => {
    console.log(`  [${s.start.toFixed(2)}-${s.end.toFixed(2)}] (${s.duration.toFixed(2)}s) ${s.text.substring(0, 60)}`);
});
console.log('\nDone.');
