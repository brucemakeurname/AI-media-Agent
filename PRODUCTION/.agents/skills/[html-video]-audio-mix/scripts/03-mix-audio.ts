// Step 5 (ported from pipeline.ts, unchanged mechanism): concat voice beats + mix SFX + BGM.
import { readFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { ScriptSchema, type Script } from "../../[html-video]-script-lock/scripts/lib/script-schema.js";
import { SFX_DIR, BGM_DIR } from "./lib/config.js";
import {
  getDurationSec,
  concatWithSilence,
  mixSfxOntoVoice,
  mixBgmUnderVoice,
  type SfxMixSpec,
} from "./lib/audio-tools.js";
import { indexSfxLibrary, pickSfxForScene, defaultPlayback } from "./lib/sfx-selector.js";
import { pickBrandBgm, pickBgm } from "./lib/bgm-selector.js";
import { markDone } from "../../[html-video]-script-lock/scripts/lib/progress.js";

const SCENE_GAP_SEC = 0.3;
const DURATION_MIN_SEC = 45;
const DURATION_MAX_SEC = 180;

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) throw new Error("Usage: tsx 03-mix-audio.ts <script.json path>");
  const outputDir = dirname(scriptPath);

  const raw = JSON.parse(await readFile(scriptPath, "utf8"));
  const script: Script = ScriptSchema.parse(raw);

  const voiceDir = join(outputDir, "voice");
  const beatAudio: { id: string; path: string; durationSec: number }[] = [];
  let cursor = 0;
  const sceneStarts: Record<string, number> = {};
  for (const scene of script.scenes) {
    sceneStarts[scene.id] = cursor;
    for (let beatIdx = 0; beatIdx < scene.beats.length; beatIdx++) {
      const p = join(voiceDir, `beat-${scene.id}-${beatIdx}.mp3`);
      const durationSec = await getDurationSec(p);
      cursor += durationSec + SCENE_GAP_SEC;
      beatAudio.push({ id: `${scene.id}-${beatIdx}`, path: p, durationSec });
    }
  }

  const voiceRawMp3 = join(outputDir, "voice-raw.mp3");
  const voiceMp3 = join(outputDir, "voice.mp3");
  await concatWithSilence(
    beatAudio.map((a) => a.path),
    SCENE_GAP_SEC,
    voiceRawMp3,
  );

  const sfxIndex = indexSfxLibrary(SFX_DIR);
  const sfxList: SfxMixSpec[] = [];
  for (const scene of script.scenes) {
    const startSec = sceneStarts[scene.id];
    if (scene.sfx) {
      if (scene.sfx.name === "none") continue;
      const sfxPath = join(SFX_DIR, `${scene.sfx.name}.mp3`);
      if (existsSync(sfxPath)) {
        sfxList.push({
          path: sfxPath,
          startSec: startSec + scene.sfx.startOffsetSec,
          volume: scene.sfx.volume,
        });
      }
      continue;
    }
    const picked = pickSfxForScene({
      voiceText: scene.beats.map((b) => b.voiceText).join(" "),
      templateName: scene.type,
      sceneId: scene.id,
      index: sfxIndex,
    });
    if (!picked) continue;
    const playback = defaultPlayback(picked);
    sfxList.push({
      path: join(SFX_DIR, picked.relPath),
      startSec: startSec + playback.offsetSec,
      volume: playback.volume,
    });
  }
  console.log(`  mixing ${sfxList.length} SFX into voice.mp3`);
  const voiceSfxMp3 = join(outputDir, "voice-sfx.mp3");
  await mixSfxOntoVoice(voiceRawMp3, sfxList, voiceSfxMp3);

  const totalAudioSecPreBgm = await getDurationSec(voiceSfxMp3);

  let bgmTrack: string | null = null;
  const brandPick = pickBrandBgm(BGM_DIR, script.metadata.title);
  if (brandPick) {
    bgmTrack = brandPick.path;
  } else {
    const picked = pickBgm(BGM_DIR, script.metadata.mood, script.metadata.title);
    if (picked) bgmTrack = picked.path;
  }

  if (bgmTrack) {
    console.log(`  BGM: mixing under voice (vol 0.12, ducking on)`);
    await mixBgmUnderVoice(voiceSfxMp3, bgmTrack, voiceMp3, totalAudioSecPreBgm, {
      bgmVolume: 0.12,
      fadeSec: 1.5,
      sidechainDuck: true,
    });
  } else {
    console.warn(`  BGM: no track available — video will have no background music`);
    await copyFile(voiceSfxMp3, voiceMp3);
  }

  const totalAudioSec = await getDurationSec(voiceMp3);
  console.log(`OK: voice.mp3 total ${totalAudioSec.toFixed(2)}s`);
  if (totalAudioSec < DURATION_MIN_SEC || totalAudioSec > DURATION_MAX_SEC) {
    console.warn(
      `Duration ${totalAudioSec.toFixed(1)}s outside [${DURATION_MIN_SEC}, ${DURATION_MAX_SEC}]s - proceeding anyway`,
    );
  }

  await markDone(join(outputDir, "progress.json"), "sfx_bgm_mixed");
}

main().catch((e) => {
  console.error(`mix-audio failed: ${(e as Error).message}`);
  process.exit(1);
});
