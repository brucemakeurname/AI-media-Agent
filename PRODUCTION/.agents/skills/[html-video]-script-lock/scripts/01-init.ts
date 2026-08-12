// Step 1-2 (ported from news-summery-editing/src/pipeline.ts, unchanged mechanism):
// load + validate script.json, write script.txt for CapCut/reference.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ScriptSchema, type Script } from "./lib/script-schema.js";
import { markDone } from "./lib/progress.js";

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) throw new Error("Usage: tsx 01-init.ts <script.json path>");
  const outputDir = dirname(scriptPath);

  const raw = JSON.parse(await readFile(scriptPath, "utf8"));
  const script: Script = ScriptSchema.parse(raw);

  const fullText = script.scenes.flatMap((s) => s.beats.map((b) => b.voiceText)).join("\n\n");
  await writeFile(join(outputDir, "script.txt"), fullText);

  await markDone(join(outputDir, "progress.json"), "script_locked");

  console.log(`OK: ${script.scenes.length} scenes validated, script.txt written to ${outputDir}`);
}

main().catch((e) => {
  console.error(`init failed: ${(e as Error).message}`);
  process.exit(1);
});
