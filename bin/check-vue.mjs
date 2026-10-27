#!/usr/bin/env node
// Compile check for the client: every .vue file through Vue's SFC compiler, every
// .js file through `node --check`. Writes nothing, so parallel agents can run it.
// Run: npm run typecheck
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = join(root, "client", "src");
const require = createRequire(join(root, "client", "package.json"));
const { parse, compileScript, compileTemplate } = require("vue/compiler-sfc");

const files = readdirSync(src, { recursive: true }).map((f) => join(src, f));
const problems = [];

for (const file of files.filter((f) => f.endsWith(".vue"))) {
  const name = relative(root, file);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file });
  if (errors.length) {
    problems.push(...errors.map((e) => `${name}: ${e.message}`));
    continue;
  }
  let bindings;
  try {
    if (descriptor.script || descriptor.scriptSetup) {
      bindings = compileScript(descriptor, { id: "check" }).bindings;
    }
  } catch (e) {
    problems.push(`${name}: ${e.message}`);
    continue;
  }
  if (descriptor.template) {
    const out = compileTemplate({
      source: descriptor.template.content,
      filename: file,
      id: "check",
      compilerOptions: { bindingMetadata: bindings },
    });
    problems.push(...out.errors.map((e) => `${name}: ${typeof e === "string" ? e : e.message}`));
  }
}

for (const file of files.filter((f) => f.endsWith(".js"))) {
  const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (r.status !== 0) problems.push(`${relative(root, file)}: ${(r.stderr || "").trim()}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-vue: ${files.filter((f) => /\.(vue|js)$/.test(f)).length} files compile`);
