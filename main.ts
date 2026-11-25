// Fridge Roast: One Line, Biggest Laugh — make.fun entry.
//
// Writes a single roast of a smart fridge to /output/entry.txt.
// The sealed gate wants UTF-8 text of 1 to 200 characters, not only
// whitespace, so this program checks the gate itself before it writes
// and then reads the file back to prove the bytes landed intact.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast. Aimed at the fridge's camera: it mistakes the butter for
// a person and keeps filing daily reports on "him". Specific to the
// camera feature, tight, and the punchline lands on the last words.
const LINE =
  "My fridge's camera mistook the butter for a person and now sends me a daily notification that 'he' hasn't moved in three days.";

// Gate limits from RULES.txt: /output/entry.txt must be UTF-8 text of
// 1 to 200 characters, and not only whitespace.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// Where the harness expects the artifact. The grader convention reads
// MAKEFUN_OUTPUT_DIR first, then OUTPUT_DIR, then /output.
function resolveOutputDir(): string {
  const fromEnv =
    process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUTPUT_DIR ?? "";
  return fromEnv.trim() !== "" ? fromEnv : "/output";
}

// Collect every gate violation at once instead of failing on the first,
// so a bad line tells us everything wrong with it in one run.
function gateProblems(line: string): string[] {
  const problems: string[] = [];
  if (line.length < MIN_CHARS) {
    problems.push(`line is empty (needs at least ${MIN_CHARS} char)`);
  }
  if (line.length > MAX_CHARS) {
    problems.push(
      `line is ${line.length} chars (gate allows at most ${MAX_CHARS})`,
    );
  }
  if (line.trim() === "") {
    problems.push("line is only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    problems.push("line must be a single line, no newlines");
  }
  // UTF-8 round-trip: encoding then decoding must give back the same
  // string, otherwise the sealed scorer would see different bytes.
  const encoded = new TextEncoder().encode(line);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  if (decoded !== line) {
    problems.push("line is not clean UTF-8 text");
  }
  return problems;
}

function main(): void {
  const problems = gateProblems(LINE);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`gate: ${problem}`);
    }
    process.exit(1);
  }

  // --check validates the line and exits without writing, handy for a
  // quick gate check before the real run.
  if (process.argv.includes("--check")) {
    console.log(`check: ${LINE.length} chars, gate OK`);
    return;
  }

  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");

  // Read it back and confirm byte-for-byte, the same way the scorer
  // will read it.
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    console.error("verify: entry.txt does not match the line");
    process.exit(1);
  }

  console.log(`wrote ${outPath}: ${LINE.length} chars, gate OK`);
}

main();
