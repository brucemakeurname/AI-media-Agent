// Step 8 (ported from pipeline.ts, unchanged mechanism): whisperx -> ASS -> ffmpeg burn.
import { copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { burnSubtitles } from "./lib/subtitle-burner.js";
import { markDone } from "../../[html-video]-script-lock/scripts/lib/progress.js";

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) throw new Error("Usage: tsx 04-burn-subtitles.ts <script.json path>");
  const outputDir = dirname(scriptPath);

  const videoRawPath = join(outputDir, "renders", "video-raw.mp4");
  const voiceRawMp3 = join(outputDir, "voice-raw.mp3");
  const videoPath = join(outputDir, "renders", "video.mp4");

  const result = await burnSubtitles({
    videoPath: videoRawPath,
    audioPath: voiceRawMp3,
    outputPath: videoPath,
    scriptsDir: dirname(fileURLToPath(import.meta.url)),
  });

  if (result.success) {
    console.log("OK: subtitles burned");
  } else {
    console.warn(`Subtitle burn skipped: ${result.reason} — falling back to raw render`);
    await copyFile(videoRawPath, videoPath);
  }

  await markDone(join(outputDir, "progress.json"), "subtitles_burned");
}

main().catch((e) => {
  console.error(`burn-subtitles failed: ${(e as Error).message}`);
  process.exit(1);
});
