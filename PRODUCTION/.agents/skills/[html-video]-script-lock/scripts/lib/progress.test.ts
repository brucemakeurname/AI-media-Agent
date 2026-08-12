import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readProgress, markDone, PROGRESS_STEPS } from "./progress.js";

test("readProgress returns all-false state when file doesn't exist", async () => {
  const dir = await mkdtemp(join(tmpdir(), "progress-"));
  try {
    const state = await readProgress(join(dir, "progress.json"));
    for (const step of PROGRESS_STEPS) {
      assert.equal(state[step].done, false);
      assert.equal(state[step].at, null);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("markDone sets done=true and a timestamp, preserving other steps", async () => {
  const dir = await mkdtemp(join(tmpdir(), "progress-"));
  try {
    const path = join(dir, "progress.json");
    await markDone(path, "script_locked");
    await markDone(path, "voice_synthesized");

    const state = await readProgress(path);
    assert.equal(state.script_locked.done, true);
    assert.notEqual(state.script_locked.at, null);
    assert.equal(state.voice_synthesized.done, true);
    assert.equal(state.scenes_built.done, false);

    const onDisk = JSON.parse(await readFile(path, "utf8"));
    assert.equal(onDisk.script_locked.done, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("PROGRESS_STEPS has all 8 pipeline steps in order", () => {
  assert.deepEqual(PROGRESS_STEPS, [
    "script_locked",
    "voice_synthesized",
    "scenes_built",
    "verified",
    "rendered",
    "subtitles_burned",
    "sfx_bgm_mixed",
    "thumbnail_burned",
  ]);
});
