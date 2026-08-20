import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  getDurationSec,
  mixBgmUnderVoice,
  mixSfxOntoVoice,
  type SfxMixSpec,
} from "./lib/audio-tools.js";
import { BGM_DIR, SFX_DIR } from "./lib/config.js";
import { defaultPlayback, indexSfxLibrary, pickSfxForScene } from "./lib/sfx-selector.js";
import { pickBgm, pickBrandBgm, type Mood } from "./lib/bgm-selector.js";

type SfxOverride = {
  name: string;
  startOffsetSec?: number;
  volume?: number;
};

type SceneAudio = {
  id: string;
  type?: string;
  startSec: number;
  durationSec: number;
  voiceText?: string;
  sfx?: SfxOverride;
};

type AudioSpec = {
  title?: string;
  brand?: string;
  mood?: Mood;
  scenes: SceneAudio[];
  bgm?: {
    enabled?: boolean;
    track?: string;
    gainDb?: number;
    volume?: number;
    fadeSec?: number;
  };
};

const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const ULTIMATE_SUP_POLICY_PATH = join(WORKSPACE_ROOT, "BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/audio/bgm-policy.json");
const ULTIMATE_SUP_BGM_DIR = join(WORKSPACE_ROOT, "BASE/BRAND KITs/UltimateSup/BGM");

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolveRun, reject) => {
    const executable = command === "ffmpeg" ? process.env.FFMPEG_BIN ?? command : command;
    const child = spawn(executable, args);
    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${command} failed with exit ${code}: ${stderr.trim()}`));
    });
  });
}

function assertSpec(spec: AudioSpec): void {
  if (!Array.isArray(spec.scenes) || spec.scenes.length === 0) {
    throw new Error("audio spec must contain at least one scene");
  }
  let previousStart = -1;
  for (const scene of spec.scenes) {
    if (!scene.id || !Number.isFinite(scene.startSec) || !Number.isFinite(scene.durationSec) || scene.durationSec <= 0) {
      throw new Error(`invalid timing for scene ${scene.id || "<unknown>"}`);
    }
    if (scene.startSec < previousStart) throw new Error("audio scenes must be ordered by startSec");
    previousStart = scene.startSec;
  }
}

function resolveSfx(name: string): string | null {
  if (name === "none") return null;
  const relative = name.endsWith(".mp3") ? name : `${name}.mp3`;
  const candidate = resolve(SFX_DIR, relative);
  if (!candidate.startsWith(resolve(SFX_DIR)) || !existsSync(candidate)) return null;
  return candidate;
}

async function resolveUltimateSupBgm(spec: AudioSpec): Promise<{ path: string; gainDb: number } | null> {
  if (spec.brand?.toLowerCase() !== "ultimatesup" || spec.bgm?.enabled === false) return null;
  const policy = JSON.parse(await readFile(ULTIMATE_SUP_POLICY_PATH, "utf8")) as {
    default_track: string;
    default_gain_db: number;
  };
  const track = spec.bgm?.track ?? policy.default_track;
  const candidate = resolve(ULTIMATE_SUP_BGM_DIR, track);
  if (!candidate.startsWith(`${ULTIMATE_SUP_BGM_DIR}/`) || !existsSync(candidate)) {
    throw new Error(`Ultimate Sup BGM is not in the Brand Kit library: ${track}`);
  }
  const gainDb = spec.bgm?.gainDb ?? policy.default_gain_db;
  if (!Number.isFinite(gainDb)) throw new Error("Ultimate Sup BGM gainDb must be finite");
  return { path: candidate, gainDb };
}

async function main(): Promise<void> {
  const [videoPath, specPath, outputPath] = process.argv.slice(2);
  if (!videoPath || !specPath || !outputPath) {
    throw new Error("Usage: tsx 04-mix-ai-scene-audio.ts <concat.mp4> <audio-spec.json> <output.mp4>");
  }
  if (!existsSync(videoPath) || !existsSync(specPath)) throw new Error("video and audio spec must exist");
  if (resolve(videoPath) === resolve(outputPath)) throw new Error("output must differ from input video");

  const spec = JSON.parse(await readFile(specPath, "utf8")) as AudioSpec;
  assertSpec(spec);
  const tempDir = await mkdtemp(join(tmpdir(), "ai-scene-audio-"));
  const voiceRawPath = join(tempDir, "voice-raw.mp3");
  const voiceSfxPath = join(tempDir, "voice-sfx.mp3");
  const mixedAudioPath = join(tempDir, "voice-mixed.mp3");
  try {
    await run("ffmpeg", [
      "-y", "-i", videoPath, "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "44100",
      "-c:a", "libmp3lame", "-b:a", "192k", voiceRawPath,
    ]);
    const sfxIndex = indexSfxLibrary(SFX_DIR);
    const sfxList: SfxMixSpec[] = [];
    const selectedSfx: Array<Record<string, unknown>> = [];
    for (const scene of spec.scenes) {
      let file: string | null = null;
      let source = "none";
      let offsetSec = 0;
      let volume = 0;
      if (scene.sfx) {
        file = resolveSfx(scene.sfx.name);
        source = "explicit";
        offsetSec = scene.sfx.startOffsetSec ?? 0;
        volume = scene.sfx.volume ?? 0.35;
      } else {
        const picked = pickSfxForScene({
          voiceText: scene.voiceText ?? "",
          templateName: scene.type ?? "hook",
          sceneId: scene.id,
          index: sfxIndex,
        });
        if (picked) {
          file = resolveSfx(picked.relPath);
          source = picked.source;
          const playback = defaultPlayback(picked);
          offsetSec = playback.offsetSec;
          volume = playback.volume;
        }
      }
      if (file) {
        sfxList.push({ path: file, startSec: scene.startSec + offsetSec, volume });
      }
      selectedSfx.push({ scene: scene.id, file: file ? file.replace(`${SFX_DIR}/`, "") : null, source, offsetSec, volume });
    }
    await mixSfxOntoVoice(voiceRawPath, sfxList, voiceSfxPath);

    const bgmEnabled = spec.bgm?.enabled === true;
    let bgmPath: string | null = null;
    let bgmGainDb: number | null = null;
    const ultimateSupBgm = await resolveUltimateSupBgm(spec);
    if (ultimateSupBgm) {
      bgmPath = ultimateSupBgm.path;
      bgmGainDb = ultimateSupBgm.gainDb;
    }
    if (bgmEnabled) {
      if (!bgmPath) {
        const brandPick = pickBrandBgm(BGM_DIR, spec.title);
        const moodPick = spec.mood ? pickBgm(BGM_DIR, spec.mood, spec.title) : null;
        bgmPath = brandPick?.path ?? moodPick?.path ?? null;
      }
    }
    if (bgmPath) {
      const bgmVolume = bgmGainDb === null
        ? spec.bgm?.volume ?? 0.12
        : Math.pow(10, bgmGainDb / 20);
      await mixBgmUnderVoice(voiceSfxPath, bgmPath, mixedAudioPath, await getDurationSec(voiceSfxPath), {
        bgmVolume,
        fadeSec: spec.bgm?.fadeSec ?? 1.5,
        sidechainDuck: true,
      });
    } else {
      await run("ffmpeg", ["-y", "-i", voiceSfxPath, "-c:a", "libmp3lame", "-b:a", "192k", mixedAudioPath]);
    }

    await run("ffmpeg", [
      "-y", "-i", videoPath, "-i", mixedAudioPath, "-map", "0:v:0", "-map", "1:a:0",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outputPath,
    ]);
    await writeFile(join(dirname(outputPath), "audio-mix-report.json"), JSON.stringify({
      engine: "html-video-audio-mix-ai-scene",
      source_video: videoPath,
      source_spec: specPath,
      bgm: bgmPath ? relative(WORKSPACE_ROOT, bgmPath) : null,
      bgm_gain_db: bgmGainDb,
      sfx: selectedSfx,
    }, null, 2) + "\n", "utf8");
    console.log(`OK: mixed audio into ${outputPath}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`mix-ai-scene-audio failed: ${(error as Error).message}`);
  process.exit(1);
});
