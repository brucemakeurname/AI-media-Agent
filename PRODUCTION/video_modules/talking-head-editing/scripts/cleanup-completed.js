#!/usr/bin/env node
// cleanup-completed.js
// Post-approval cleanup — deletes ~7GB of intermediate artifacts from a completed project.
// Leaves re-edit checkpoint (aroll_footage.mp4) + final deliverable + all JSON manifests.
//
// Usage: node scripts/cleanup-completed.js <project_path> [--confirm]
// Reads:  output/manifest.json  (must have edit_status: "complete")
// Safety: dry-run by default; pass --confirm to actually delete

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : null;
const DRY_RUN     = !process.argv.includes('--confirm');

if (!PROJECT_DIR) {
  console.error('Usage: node cleanup-completed.js <project_path> [--confirm]');
  process.exit(1);
}

// ── Guard: must be confirmed complete ────────────────────────────────────────
const manifestPath = path.join(PROJECT_DIR, 'output', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('✗ output/manifest.json not found — is this a completed project?');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.edit_status !== 'complete') {
  console.error(`✗ manifest.edit_status = "${manifest.edit_status}" — only run this on approved complete projects`);
  process.exit(1);
}

const brief = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'brief.json'), 'utf8'));
console.log(`\nProject: ${brief.project_id}`);
console.log(`Status:  ${manifest.edit_status}`);
console.log(DRY_RUN ? '\n[DRY RUN — pass --confirm to delete]\n' : '\n[LIVE — deleting now]\n');

// ── Helpers ───────────────────────────────────────────────────────────────────
function sizeOf(p) {
  try {
    const out = execSync(
      `du -sb "${p}" 2>/dev/null || (Get-Item "${p}" | Measure-Object -ErrorAction SilentlyContinue).Count`,
      { stdio: 'pipe', shell: true }
    ).toString().trim();
    const bytes = parseInt(out.split(/\s+/)[0]);
    return isNaN(bytes) ? 0 : bytes;
  } catch { return 0; }
}

function humanSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + 'GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + 'MB';
  return (bytes / 1e3).toFixed(0) + 'KB';
}

let totalFreed = 0;

function deleteEntry(p, label) {
  if (!fs.existsSync(p)) return;
  const bytes = sizeOf(p);
  totalFreed += bytes;
  console.log(`  ${DRY_RUN ? '[WOULD DELETE]' : '[DELETING]'} ${label}  (${humanSize(bytes)})`);
  if (!DRY_RUN) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

function deleteGlob(dir, pattern, label) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir).filter(f => pattern.test(f));
  for (const f of entries) {
    deleteEntry(path.join(dir, f), label || f);
  }
}

// ── Footage folder (source + Phase 0 intermediates) ──────────────────────────
console.log('── footage/ ──────────────────────────────────────────');
deleteEntry(path.join(PROJECT_DIR, 'footage'), 'footage/ (entire folder)');

// ── Segments (individual cuts + zoomed) ──────────────────────────────────────
console.log('\n── segments/ ─────────────────────────────────────────');
deleteEntry(path.join(PROJECT_DIR, 'segments', 'zoomed'), 'segments/zoomed/');
deleteGlob(path.join(PROJECT_DIR, 'segments'), /^seg_\d+\.mp4$/, 'seg_NNN.mp4 (unzoomed cuts)');
deleteEntry(path.join(PROJECT_DIR, 'segments', 'concat_zoom.txt'), 'segments/concat_zoom.txt');

// ── A-roll renders (comp dirs + ProRes files + base intermediate) ─────────────
console.log('\n── aroll_renders/ ────────────────────────────────────');
deleteGlob(path.join(PROJECT_DIR, 'aroll_renders'), /^ar_\d+_comp$/, 'ar_NN_comp/ (HyperFrames source)');
deleteGlob(path.join(PROJECT_DIR, 'aroll_renders'), /^ar_\d+\.mov$/, 'ar_NN.mov (ProRes 4444 overlay)');
deleteEntry(path.join(PROJECT_DIR, 'aroll_renders', 'base_zoomed.mp4'), 'aroll_renders/base_zoomed.mp4');

// ── B-roll renders (comp dirs + pre-trimmed intermediates) ────────────────────
console.log('\n── broll_renders/ ────────────────────────────────────');
deleteGlob(path.join(PROJECT_DIR, 'broll_renders'), /^br_\d+_comp$/, 'br_NN_comp/ (HyperFrames source)');
deleteGlob(path.join(PROJECT_DIR, 'broll_renders'), /^br_\d+_trim\.mp4$/, 'br_NN_trim.mp4 (pre-trim intermediate)');

// ── Subtitles (comp + ProRes overlay) ────────────────────────────────────────
console.log('\n── subtitles/ ────────────────────────────────────────');
deleteEntry(path.join(PROJECT_DIR, 'subtitles', 'subtitle_comp'), 'subtitles/subtitle_comp/');
deleteEntry(path.join(PROJECT_DIR, 'subtitles', 'subtitle_overlay.mov'), 'subtitles/subtitle_overlay.mov');

// ── Output intermediates ──────────────────────────────────────────────────────
console.log('\n── output/ ───────────────────────────────────────────');
deleteEntry(path.join(PROJECT_DIR, 'output', 'assembled_broll.mp4'), 'output/assembled_broll.mp4');
deleteEntry(path.join(PROJECT_DIR, 'output', 'assembled_sub.mp4'), 'output/assembled_sub.mp4');
deleteGlob(path.join(PROJECT_DIR, 'output'), /^test_.*\.mp4$/, 'output/test_*.mp4');

// ── Test folder ───────────────────────────────────────────────────────────────
console.log('\n── test-broll/ ───────────────────────────────────────');
deleteEntry(path.join(PROJECT_DIR, 'test-broll'), 'test-broll/ (entire folder)');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(54)}`);
console.log(`Total ${DRY_RUN ? 'would free' : 'freed'}: ${humanSize(totalFreed)}`);

if (DRY_RUN) {
  console.log('\nRun with --confirm to execute:');
  console.log(`  node talking-head-editing/scripts/cleanup-completed.js "${PROJECT_DIR}" --confirm`);
} else {
  console.log('\n✓ Cleanup complete. Kept:');
  console.log('  output/{project_id}_final.mp4       ← deliverable');
  console.log('  aroll_renders/aroll_footage.mp4      ← re-edit checkpoint');
  console.log('  broll_renders/br_NN.mp4              ← rendered B-rolls');
  console.log('  logs/ + audio/ + segments/*.json     ← all manifests');
  console.log('  subtitles/{project_id}.srt');
}
