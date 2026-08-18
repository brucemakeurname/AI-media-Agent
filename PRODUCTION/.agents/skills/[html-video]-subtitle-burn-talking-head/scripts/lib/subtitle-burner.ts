import { writeFile } from "node:fs/promises";
import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

// ── Layout constants ──────────────────────────────────────────────────────────
const PLAY_RES_X = 1080;
const PLAY_RES_Y = 1920;

const SUB_X = Math.round(PLAY_RES_X / 2);
const SUB_Y = Math.round(PLAY_RES_Y * Number(process.env.SUB_Y_RATIO ?? "0.75"));

// ── Types ─────────────────────────────────────────────────────────────────────
interface WordEntry {
  word: string;
  start: number;
  end: number;
}

interface CaptionStyle {
  fontName: string;
  fontSize: number;
  primaryColor: string;
  highlightColor: string;
  outlineSize: number;
  shadowDepth: number;
  shadowAlpha: number;
  bold: boolean;
  italic: boolean;
  animationType: "highlight" | "karaoke" | "scale" | "bounce";
}

export type CaptionStyleId = "hormozi" | "mrbeast" | "karaoke" | "minimal" | "bounce" | "classic";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CAPTION_STYLES: Record<CaptionStyleId, CaptionStyle> = JSON.parse(
  readFileSync(join(__dirname, "caption-styles.json"), "utf8"),
);
const FONTS_DIR = join(__dirname, "..", "fonts");
const DEFAULT_STYLE: CaptionStyleId = "hormozi";

// ── ASS helpers ───────────────────────────────────────────────────────────────
function toAssTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.round((sec % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function hexToAssBgr(hex: string, alpha = 0): string {
  const h = hex.replace("#", "");
  const r = h.slice(0, 2);
  const g = h.slice(2, 4);
  const b = h.slice(4, 6);
  return `&H${alpha.toString(16).padStart(2, "0").toUpperCase()}${b}${g}${r}`.toUpperCase();
}

function groupWords(words: WordEntry[], gluePrev: boolean[], maxTokens = 5, maxChars = 22, gapBreakSec = 0.6): WordEntry[][] {
  const units: WordEntry[][] = [];
  let unit: WordEntry[] = [];
  for (let index = 0; index < words.length; index++) {
    if (unit.length && !gluePrev[index]) {
      units.push(unit);
      unit = [];
    }
    unit.push(words[index]);
  }
  if (unit.length) units.push(unit);

  const groups: WordEntry[][] = [];
  let cur: WordEntry[] = [];
  let tokenCount = 0;
  let charCount = 0;
  for (const nextUnit of units) {
    const gap = cur.length ? nextUnit[0].start - cur[cur.length - 1].end : 0;
    const nextTokens = 1;
    const nextUnitChars = nextUnit.reduce((sum, word) => sum + word.word.length, 0);
    const separatorChars = cur.length ? 1 : 0;
    const nextChars = nextUnitChars + separatorChars;
    if (cur.length && (gap > gapBreakSec || tokenCount + nextTokens > maxTokens || charCount + nextChars > maxChars)) {
      groups.push(cur);
      cur = [];
      tokenCount = 0;
      charCount = 0;
    }
    cur.push(...nextUnit);
    tokenCount += nextTokens;
    charCount += nextUnitChars + separatorChars;
  }
  if (cur.length) groups.push(cur);
  return groups;
}

function buildAssContent(words: WordEntry[], styleId: CaptionStyleId, gluePrev: boolean[]): string {
  const style = CAPTION_STYLES[styleId];
  const primary = hexToAssBgr(style.primaryColor);
  const highlight = hexToAssBgr(style.highlightColor);
  const outline = hexToAssBgr("#000000");
  const back = hexToAssBgr("#000000", style.shadowAlpha);

  const assStyle = [
    "Style: Main",
    style.fontName,
    String(style.fontSize),
    primary,
    primary,
    outline,
    back,
    style.bold ? "-1" : "0",
    style.italic ? "-1" : "0",
    "0",
    "0",
    "100",
    "100",
    "0",
    "0",
    "1",
    String(style.outlineSize),
    String(style.shadowDepth),
    "2",
    "10",
    "10",
    "10",
    "1",
  ].join(",");

  const header = [
    "[Script Info]",
    `PlayResX: ${PLAY_RES_X}`,
    `PlayResY: ${PLAY_RES_Y}`,
    "ScriptType: v4.00+",
    "WrapStyle: 2",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    assStyle,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ].join("\n");

  const configuredMaxTokens = Number(process.env.MAX_TOKENS ?? "5");
  const maxTokens = Number.isFinite(configuredMaxTokens)
    ? Math.min(5, Math.max(1, Math.floor(configuredMaxTokens)))
    : 5;
  const maxChars = Number(process.env.MAX_CHARS ?? "22");
  const groups = groupWords(words, gluePrev, maxTokens, maxChars);
  const lines: string[] = [];

  for (const group of groups) {
    const groupEnd = group[group.length - 1].end;
    for (let activeIdx = 0; activeIdx < group.length; activeIdx++) {
      const segStart = group[activeIdx].start;
      const segEnd = activeIdx + 1 < group.length ? group[activeIdx + 1].start : groupEnd;

      const parts = group.map((w, i) => {
        const text = w.word.replace(/[{}\\]/g, "").trim().toUpperCase();
        if (i !== activeIdx) return text;
        switch (style.animationType) {
          case "karaoke": {
            const durCs = Math.round((w.end - w.start) * 100);
            return `{\\kf${durCs}\\c${highlight}}${text}{\\r}`;
          }
          case "scale":
            return `{\\fscx110\\fscy110\\c${highlight}}${text}{\\r}`;
          case "bounce":
            return `{\\t(0,50,\\fscx120\\fscy120)\\t(50,100,\\fscx100\\fscy100)\\c${highlight}}${text}{\\r}`;
          default:
            return `{\\c${highlight}}${text}{\\r}`;
        }
      });

      const textLine = `{\\pos(${SUB_X},${SUB_Y})}` + parts.join(" ");
      lines.push(`Dialogue: 0,${toAssTime(segStart)},${toAssTime(segEnd)},Main,,0,0,0,,${textLine}`);
    }
  }

  return header + "\n" + lines.join("\n") + "\n";
}

function loadGlueMask(words: WordEntry[], scriptsDir: string, py: string): boolean[] {
  if ((process.env.SEGMENT_MODE ?? "smart") !== "smart") return words.map(() => false);
  const segmentScript = resolve(scriptsDir, "../../vietnamese-word-segment/scripts/vi_segment.py");
  if (!existsSync(segmentScript)) return words.map(() => false);
  const tempDir = mkdtempSync(join(tmpdir(), "vi-segment-"));
  const input = join(tempDir, "words.json");
  const output = join(tempDir, "glue.json");
  try {
    writeFileSync(input, JSON.stringify(words), "utf8");
    const result = spawnSync(py, [segmentScript, input, output], { encoding: "utf8", timeout: 60_000 });
    if (result.status !== 0 || !existsSync(output)) return words.map(() => false);
    const mask = JSON.parse(readFileSync(output, "utf8"));
    return Array.isArray(mask) && mask.length === words.length ? mask.map(Boolean) : words.map(() => false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Transcribe `audioPath` (pure voice mp3) with faster-whisper → word timestamps.
 * Burns tokenizer-aware multi-word styled subtitles into `videoPath` → `outputPath`, using
 * one of the 6 presets in `caption-styles.json` (shared with
 * [html-video]-subtitle-burn-industry-news — same style data, different
 * grouping/position for the talking-head format).
 *
 * Fails gracefully: if transcription or ffmpeg fail, returns `{ success: false }` so
 * the pipeline can keep the original video without crashing.
 */
export async function burnSubtitles(opts: {
  videoPath: string;
  audioPath: string;
  outputPath: string;
  scriptsDir: string;
  style?: CaptionStyleId;
}): Promise<{ success: boolean; reason?: string }> {
  const { videoPath, audioPath, outputPath, scriptsDir, style = DEFAULT_STYLE } = opts;
  const py = process.env.PYTHON_BIN ?? "python";

  const transcribeScript = `${scriptsDir}/whisperx_transcribe.py`;
  if (!existsSync(transcribeScript)) {
    return { success: false, reason: "whisperx_transcribe.py not found in scripts/" };
  }

  // ── Step A: transcribe ────────────────────────────────────────────────────
  const jsonPath = `${outputPath.replace(/\.mp4$/, "")}-words.json`;
  const res = spawnSync(py, [transcribeScript, audioPath, jsonPath], {
    encoding: "utf8",
    timeout: 5 * 60 * 1000,
  });

  if (res.status !== 0 || !existsSync(jsonPath)) {
    const msg = res.stderr?.split("\n").find((l) => l.trim()) ?? "unknown error";
    return { success: false, reason: `whisperx failed: ${msg}` };
  }

  let words: WordEntry[] = JSON.parse(readFileSync(jsonPath, "utf8"));
  if (words.length === 0) {
    return { success: false, reason: "whisperx returned 0 words" };
  }

  const approvedText = process.env.APPROVED_TEXT_PATH;
  if (approvedText) {
    const correctionScript = join(scriptsDir, "correct_whisper_text.py");
    const correctedPath = `${outputPath.replace(/\.mp4$/, "")}-words-corrected.json`;
    const correction = spawnSync(py, [correctionScript, approvedText, jsonPath, correctedPath], {
      encoding: "utf8",
      timeout: 60_000,
    });
    if (correction.status !== 0 || !existsSync(correctedPath)) {
      return { success: false, reason: `approved voice text correction failed: ${correction.stderr?.trim() || "token count mismatch"}` };
    }
    words = JSON.parse(readFileSync(correctedPath, "utf8"));
  }

  // ── Step B: build ASS ─────────────────────────────────────────────────────
  const assPath = `${outputPath.replace(/\.mp4$/, "")}.ass`;
  await writeFile(assPath, buildAssContent(words, style, loadGlueMask(words, scriptsDir, py)), "utf8");

  // ── Step C: burn with ffmpeg ──────────────────────────────────────────────
  // Windows path: backslashes → forward slashes, colon escaped for filtergraph
  const escapePath = (p: string) => p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_m, d) => `${d}\\:`);
  const assEscaped = escapePath(assPath);
  const fontsEscaped = escapePath(FONTS_DIR);

  try {
    execFileSync(
      process.env.FFMPEG_BIN ?? "ffmpeg",
      ["-i", videoPath, "-vf", `ass='${assEscaped}':fontsdir='${fontsEscaped}'`, "-c:a", "copy", "-y", outputPath],
      { timeout: 10 * 60 * 1000 },
    );
    return { success: true };
  } catch (e) {
    return {
      success: false,
      reason: `ffmpeg subtitle burn failed: ${(e as Error).message.split("\n")[0]}`,
    };
  }
}
