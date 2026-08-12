// Step 9 (mechanism updated 2026-08-08 for thumbnail parallelism — see redesign spec §"Thumbnail
// parallelism"): the designer role now generates thumbnail.png DURING the render wait (Build steps
// 2-4), not after. This step just confirms it landed; only if the designer didn't finish in time
// does it fall back to the old post-render signal file for an async Design Hub pickup.
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { markDone } from "../../[html-video]-script-lock/scripts/lib/progress.js";

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) throw new Error("Usage: tsx 05-thumbnail-signal.ts <script.json path>");
  const outputDir = dirname(scriptPath);
  const videoPath = join(outputDir, "renders", "video.mp4");
  const thumbnailPath = join(outputDir, "thumbnail.png");

  if (existsSync(thumbnailPath)) {
    console.log(`OK: pre-made thumbnail found at ${thumbnailPath}`);
  } else {
    const signalPath = join(outputDir, "thumbnail-needed.json");
    await writeFile(
      signalPath,
      JSON.stringify(
        {
          videoPath,
          thumbnailOutputPath: thumbnailPath,
          aspectRatio: "9:16",
          resolution: "1080x1920",
          assignedTo: "Design Hub",
          note: "Designer did not finish the parallel thumbnail during render — generate via gpt-img-2-gen now.",
        },
        null,
        2,
      ),
    );
    console.warn(`No pre-made thumbnail — signal written to ${signalPath}`);
  }

  await markDone(join(outputDir, "progress.json"), "thumbnail_burned");
}

main().catch((e) => {
  console.error(`thumbnail-signal failed: ${(e as Error).message}`);
  process.exit(1);
});
