#!/usr/bin/env node
// Scope check: ISSUES.md allows changes in client/src only. Fails when any other
// tracked or new file differs from the `base` tag. Run: npm run lint
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const git = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" });

if (git("rev-parse", "--verify", "--quiet", "base").status !== 0) {
  console.log("check-scope: no base tag here, skipped");
  process.exit(0);
}
const changed = [
  ...git("diff", "--name-only", "base").stdout.split("\n"),
  ...git("ls-files", "--others", "--exclude-standard").stdout.split("\n"),
].filter(Boolean);
const outside = [...new Set(changed)].filter((f) => !f.startsWith("client/src/"));

if (outside.length) {
  console.error(`check-scope: these files are outside client/src and must not change:\n${outside.join("\n")}`);
  process.exit(1);
}
console.log(`check-scope: ${changed.length} changed files, all in client/src`);
