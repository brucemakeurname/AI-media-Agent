// Invoked directly by the video-editor agent after a Bash-driven pipeline step
// (scenes built, hyperframes check --strict --snapshots passed, hyperframes render succeeded)
// that has no dedicated .ts script of its own to call markDone() internally.
import { dirname } from "node:path";
import { markDone, PROGRESS_STEPS, type ProgressStep } from "./lib/progress.js";

async function main() {
  const scriptPath = process.argv[2];
  const step = process.argv[3] as ProgressStep;
  if (!scriptPath || !step) {
    throw new Error("Usage: tsx 06-mark-progress.ts <script.json path> <step>");
  }
  if (!PROGRESS_STEPS.includes(step)) {
    throw new Error(`Unknown step "${step}". Valid: ${PROGRESS_STEPS.join(", ")}`);
  }
  const progressPath = `${dirname(scriptPath)}/progress.json`;
  await markDone(progressPath, step);
  console.log(`OK: ${step} marked done in ${progressPath}`);
}

main().catch((e) => {
  console.error(`mark-progress failed: ${(e as Error).message}`);
  process.exit(1);
});
