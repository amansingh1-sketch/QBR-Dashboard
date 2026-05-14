// Orchestrator: runs each section's data-processing step.
// Each section owns the logic and the output files for its tab data.
//
// Usage: `node scripts/process-local.mjs`
//
// Adding a new section: drop a `process.mjs` (or `process.py`) in sections/<slug>/,
// then add a SECTIONS entry here.

import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SECTIONS = [
  { id: "sales",   kind: "node",   path: path.join(ROOT, "sections", "sales", "process.mjs") },
  { id: "success", kind: "python", path: path.join(ROOT, "sections", "success", "process.py") },
];

for (const s of SECTIONS) {
  console.log(`\n=== Processing section: ${s.id} ===`);
  if (s.kind === "node") {
    await import(s.path);
  } else if (s.kind === "python") {
    const r = spawnSync("python3", [s.path], { stdio: "inherit", cwd: ROOT });
    if (r.status !== 0) throw new Error(`section ${s.id} python script failed (exit ${r.status})`);
  }
}
