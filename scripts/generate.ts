#!/usr/bin/env bun
// Regenerates everything derived from the ph24 API docs:
//   src/generated/manifest.json  commands, schemas and error catalogue the CLI runs from
//   skills/ph24-cli/SKILL.md     the Claude Code skill
//   docs/COMMANDS.md             the command reference
//
//   bun scripts/generate.ts                 # fetch https://ph24.io/docs/api/openapi.json
//   bun scripts/generate.ts ./openapi.json  # use a local copy of the spec
import { buildManifest, fetchManifest, SPEC_URL, type Manifest } from "../src/manifest.ts";
import { renderSkill } from "../src/skill.ts";
import { renderReference } from "../src/reference.ts";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = join(import.meta.dir, "..");
const src = process.argv[2] ?? SPEC_URL;
let manifest: Manifest;
if (/^https?:/.test(src)) {
  manifest = await fetchManifest(src);
} else {
  const spec = JSON.parse(readFileSync(src, "utf8"));
  let problems;
  try { problems = (await (await fetch((spec.servers?.[0]?.url ?? "https://ph24.io/api/v1") + "/public/problem-types")).json()).data; } catch {}
  manifest = buildManifest(spec, problems);
}

// Keep the file stable when nothing changed, so scheduled regeneration only commits real API changes.
const target = join(root, "src", "generated", "manifest.json");
try {
  const prev = JSON.parse(readFileSync(target, "utf8"));
  const strip = (m: any) => JSON.stringify({ ...m, generatedAt: undefined });
  if (strip(prev) === strip(manifest)) manifest.generatedAt = prev.generatedAt;
} catch {}

const write = (rel: string, text: string) => {
  const f = join(root, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, text);
};
write("src/generated/manifest.json", JSON.stringify(manifest) + "\n");
write("skills/ph24-cli/SKILL.md", renderSkill(manifest));
write("docs/COMMANDS.md", renderReference(manifest));
console.error("Generated " + manifest.commands.length + " commands, " + Object.keys(manifest.schemas).length + " schemas, " + manifest.errors.length + " error types (spec " + manifest.specVersion + ").");
