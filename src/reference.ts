// Markdown command reference, generated from the manifest.
import type { Manifest } from "./manifest.ts";
import { resolver, typeLabel } from "./build.ts";

const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n+/g, " ");

export function renderReference(m: Manifest): string {
  const r = resolver(m.schemas);
  const lines = [
    "# ph24 command reference",
    "",
    "Generated from the [ph24 OpenAPI spec](https://ph24.io/docs/api/openapi.json) (" + m.title + " " + m.specVersion + "). Do not edit: run `bun run generate`.",
    "",
    m.commands.length + " commands. ⚠ = destructive (needs `--force`), 💶 = may cost money.",
    "",
  ];
  let group = "";
  for (const c of m.commands) {
    if (c.name[0] !== group) {
      group = c.name[0];
      lines.push("## " + group, "");
    }
    const usage = "ph24 " + c.name.join(" ") + c.positionals.map((p) => " <" + p.name + ">").join("");
    lines.push("### `" + usage + "`" + (c.destructive ? " ⚠" : "") + (c.costsMoney ? " 💶" : ""), "");
    lines.push(c.summary + ". `" + c.method + " " + c.path + "`" + (c.ability ? " · ability `" + c.ability + "`" : "") + (c.stability ? " · " + c.stability : ""), "");
    const flags = [...c.query.map((q) => ({ ...q, where: "query" })), ...(c.body?.fields ?? []).map((f) => ({ ...f, where: "body" }))];
    if (flags.length) {
      lines.push("| Flag | Type | | Description |", "|---|---|---|---|");
      for (const f of flags) lines.push("| `--" + f.flag + "` | " + esc(typeLabel(f.schema, r)) + " | " + (f.required ? "required" : "") + " | " + esc((f.description ?? "").split("\n")[0]).slice(0, 200) + " |");
      lines.push("");
    }
  }
  lines.push("## Error types", "", "| Type | Status | Meaning |", "|---|---|---|");
  for (const e of m.errors) lines.push("| `" + e.type + "` | " + e.status + " | " + esc(e.title) + " |");
  return lines.join("\n") + "\n";
}
