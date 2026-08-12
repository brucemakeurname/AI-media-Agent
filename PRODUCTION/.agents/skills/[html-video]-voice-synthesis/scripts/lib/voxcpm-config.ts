import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts/lib/ -> scripts/ -> [html-video]-voice-synthesis/ -> skills/ -> .claude/ -> Social Media/
const SOCIAL_MEDIA_DIR = resolve(__dirname, "..", "..", "..", "..", "..");
const VOXCPM_ENGINE_DIR = join(SOCIAL_MEDIA_DIR, "VIDEO_MODULES", "voxcpm-voice-engine");

export interface Config {
  voxcpmVenvPath: string;
  voxcpmCacheDir: string;
  voxcpmCloneMode: "controllable" | "ultimate";
  voxcpmReferenceTranscript?: string;
  ttsConcurrency: number;
}

export function loadConfig(): Config {
  const cloneMode = (process.env.VOXCPM_CLONE_MODE ?? "controllable") as
    | "controllable"
    | "ultimate";
  if (cloneMode !== "controllable" && cloneMode !== "ultimate") {
    throw new Error(`VOXCPM_CLONE_MODE must be "controllable" or "ultimate", got "${cloneMode}"`);
  }
  return {
    voxcpmVenvPath: process.env.VOXCPM_VENV_PATH ?? join(VOXCPM_ENGINE_DIR, "venv"),
    voxcpmCacheDir: process.env.VOXCPM_CACHE_DIR ?? join(VOXCPM_ENGINE_DIR, "pretrained_models"),
    voxcpmCloneMode: cloneMode,
    voxcpmReferenceTranscript: process.env.VOXCPM_REFERENCE_TRANSCRIPT || undefined,
    ttsConcurrency: parseInt(process.env.TTS_CONCURRENCY ?? "1", 10),
  };
}
