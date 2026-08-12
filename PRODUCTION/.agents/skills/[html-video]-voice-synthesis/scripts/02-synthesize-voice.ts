// Step 3 (ported from pipeline.ts, TTS call only — image-pool crawling/assignment is NOT ported,
// see references/scene-type-blueprint-map.md + media-use for the replacement).
// Synthesizes one mp3 per BEAT (not per scene — a scene may carry 2 beats) via voxcpm-voice-engine.
import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { ScriptSchema, type Script } from "../../[html-video]-script-lock/scripts/lib/script-schema.js";
import { loadConfig } from "./lib/voxcpm-config.js";
import { getDurationSec } from "../../[html-video]-audio-mix/scripts/lib/audio-tools.js";
import { markDone } from "../../[html-video]-script-lock/scripts/lib/progress.js";
// @ts-expect-error - cross-module import into the standalone voice engine (PLAN.md Task B.1)
import { VoxCpmClient } from "../../../../VIDEO_MODULES/voxcpm-voice-engine/client/voxcpm-client.js";

const SCENE_GAP_SEC = 0.3;
const BEAT_GAP_SEC = 0.15;

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) throw new Error("Usage: tsx 02-synthesize-voice.ts <script.json path>");
  const outputDir = dirname(scriptPath);
  const cfg = loadConfig();

  const raw = JSON.parse(await readFile(scriptPath, "utf8"));
  const script: Script = ScriptSchema.parse(raw);

  const referenceAudio = script.metadata.brand.voiceReferenceAudio;
  if (!referenceAudio) throw new Error("script.metadata.brand.voiceReferenceAudio is required");

  const client = new VoxCpmClient({
    venvPath: cfg.voxcpmVenvPath,
    referenceAudio,
    cloneMode: cfg.voxcpmCloneMode,
    referenceTranscript: cfg.voxcpmReferenceTranscript,
    cacheDir: cfg.voxcpmCacheDir,
  });

  const voiceDir = join(outputDir, "voice");
  await mkdir(voiceDir, { recursive: true });

  const items = script.scenes.flatMap((scene) =>
    scene.beats.map((beat, beatIdx) => ({
      scene,
      beat,
      beatId: `${scene.id}-${beatIdx}`,
      out: join(voiceDir, `beat-${scene.id}-${beatIdx}.mp3`),
    })),
  );

  const missing = items.filter((i) => !existsSync(i.out));
  if (missing.length > 0) {
    console.log(`TTS batch: ${missing.length} beat(s)...`);
    await client.generateMany(
      missing.map((i) => ({ text: i.beat.voiceText, audioOutPath: i.out })),
    );
  }

  let cursor = 0;
  const beatStarts: Record<string, number> = {};
  for (const item of items) {
    const dur = await getDurationSec(item.out);
    beatStarts[item.beatId] = cursor;
    const isLastBeatInScene = item.scene.beats[item.scene.beats.length - 1] === item.beat;
    cursor += dur + (isLastBeatInScene ? SCENE_GAP_SEC : BEAT_GAP_SEC);
    console.log(
      `  beat ${item.beatId}: ${dur.toFixed(2)}s @ ${beatStarts[item.beatId].toFixed(2)}s`,
    );
  }

  await markDone(join(outputDir, "progress.json"), "voice_synthesized");

  console.log(`OK: total voice duration ${cursor.toFixed(2)}s`);
}

main().catch((e) => {
  console.error(`synthesize-voice failed: ${(e as Error).message}`);
  process.exit(1);
});
