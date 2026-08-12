import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

export const PROGRESS_STEPS = [
  "script_locked",
  "voice_synthesized",
  "scenes_built",
  "verified",
  "rendered",
  "subtitles_burned",
  "sfx_bgm_mixed",
  "thumbnail_burned",
] as const;

export type ProgressStep = (typeof PROGRESS_STEPS)[number];

export type ProgressState = Record<ProgressStep, { done: boolean; at: string | null }>;

function emptyProgress(): ProgressState {
  const state = {} as ProgressState;
  for (const step of PROGRESS_STEPS) state[step] = { done: false, at: null };
  return state;
}

export async function readProgress(path: string): Promise<ProgressState> {
  if (!existsSync(path)) return emptyProgress();
  return JSON.parse(await readFile(path, "utf8"));
}

export async function markDone(path: string, step: ProgressStep): Promise<void> {
  const state = await readProgress(path);
  state[step] = { done: true, at: new Date().toISOString() };
  await writeFile(path, JSON.stringify(state, null, 2));
}
