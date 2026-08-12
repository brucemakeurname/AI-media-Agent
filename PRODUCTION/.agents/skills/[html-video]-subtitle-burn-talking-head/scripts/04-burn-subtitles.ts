// Standalone CLI: whisperx (faster-whisper) -> ASS -> ffmpeg burn, one word at a time.
// No cross-skill progress.json dependency — talking-head-editing tracks its own
// manifest.json per phase, unlike the industry-news script.json/progress.json contract.
import { copyFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { burnSubtitles, type CaptionStyleId } from "./lib/subtitle-burner.js";

async function main() {
  const [videoPath, audioPath, outputPath, style] = process.argv.slice(2);
  if (!videoPath || !audioPath || !outputPath) {
    throw new Error(
      "Usage: tsx 04-burn-subtitles.ts <video.mp4> <audio.mp3> <output.mp4> [style=hormozi|mrbeast|karaoke|minimal|bounce|classic]",
    );
  }

  const result = await burnSubtitles({
    videoPath,
    audioPath,
    outputPath,
    scriptsDir: dirname(fileURLToPath(import.meta.url)),
    style: style as CaptionStyleId | undefined,
  });

  if (result.success) {
    console.log("OK: subtitles burned");
  } else {
    console.warn(`Subtitle burn skipped: ${result.reason} — falling back to raw video`);
    await copyFile(videoPath, outputPath);
  }
}

main().catch((e) => {
  console.error(`burn-subtitles failed: ${(e as Error).message}`);
  process.exit(1);
});
