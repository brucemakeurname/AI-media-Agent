import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export type Mood = "news" | "uplifting" | "tense" | "cinematic" | "corporate";

export interface BgmPick {
  /** Absolute path to BGM audio file (mp3/wav/m4a) */
  path: string;
  /** Mood folder it came from */
  mood: Mood;
  /** Source — local library or tiktok-trending cache */
  source: "library" | "tiktok-trending";
}

const AUDIO_EXTS = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg"]);

/**
 * Pick from the brand BGM library (assets/bgm/brand/).
 * Files are sorted alphabetically (01.mp3, 02.mp3, ...) and rotated
 * deterministically by seed so consecutive videos feel varied.
 * Returns null if the brand/ folder is empty or missing.
 */
export function pickBrandBgm(bgmRoot: string, seed?: string): BgmPick | null {
  const brandDir = join(bgmRoot, "brand");
  if (!existsSync(brandDir)) return null;

  const candidates: string[] = [];
  for (const name of readdirSync(brandDir).sort()) {
    const full = join(brandDir, name);
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    if (!AUDIO_EXTS.has(ext)) continue;
    try {
      if (statSync(full).isFile()) candidates.push(full);
    } catch {
      /* skip unreadable */
    }
  }

  if (candidates.length === 0) return null;

  const idx = seed
    ? Math.abs(hashString(seed)) % candidates.length
    : Math.floor(Math.random() * candidates.length);

  return { path: candidates[idx], mood: "news", source: "library" };
}

/**
 * Pick a BGM file for the given mood (legacy mood-folder system).
 * Returns null if mood is "none" or the mood folder has no audio files.
 * Deterministic when `seed` is provided.
 */
export function pickBgm(bgmRoot: string, mood: Mood, seed?: string): BgmPick | null {
  const moodDir = join(bgmRoot, mood);
  if (!existsSync(moodDir)) return null;

  const candidates: string[] = [];
  for (const name of readdirSync(moodDir)) {
    const full = join(moodDir, name);
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    if (!AUDIO_EXTS.has(ext)) continue;
    try {
      if (statSync(full).isFile()) candidates.push(full);
    } catch {
      /* skip unreadable */
    }
  }

  if (candidates.length === 0) return null;

  const idx = seed
    ? Math.abs(hashString(seed)) % candidates.length
    : Math.floor(Math.random() * candidates.length);

  return { path: candidates[idx], mood, source: "library" };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}
