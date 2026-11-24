// Help text for groups and generated commands.
import type { Command, JsonSchema, Manifest } from "./manifest.ts";
import { resolver, typeLabel } from "./build.ts";

export interface Node {
  children: Map<string, Node>;
  command?: Command;
}

export function buildTree(commands: Command[]): Node {
  const root: Node = { children: new Map() };
  for (const c of commands) {
    let n = root;
    for (const part of c.name) {
      if (!n.children.has(part)) n.children.set(part, { children: new Map() });
      n = n.children.get(part)!;
    }
    n.command = c;
  }
  return root;
}

function leaves(n: Node): Command[] {
  const out: Command[] = n.command ? [n.command] : [];
  for (const c of n.children.values()) out.push(...leaves(c));
  return out;
}

const firstLine = (s?: string) => (s ?? "").split("\n")[0].trim();
const pad = (s: string, n: number) => (s.length >= n ? s + "  " : s + " ".repeat(n - s.length));

export const BUILTINS: [string, string][] = [
  ["auth", "Log in with an API token, show the current login, switch profiles"],
  ["cli", "Search commands (cli search \"<task>\"), list them, refresh from the API spec"],
  ["schema", "Show the request and response shape of a command"],
  ["errors", "List the API's error types, or explain one (errors <type>)"],
  ["api", "Send a raw request: api <METHOD> <path> [--body json]"],
  ["skill", "Show or install the Claude Code skill for this CLI"],
];

export function rootHelp(m: Manifest, root: Node, version: string): string {
  const lines = [
    "ph24 " + version + " — command-line interface for the ph24 API (" + m.commands.length + " commands from " + m.title + " " + m.specVersion + ")",
    "",
    "Usage: ph24 <command> [subcommand…] [arguments] [flags]",
    "",
    "Start here:",
    "  ph24 auth login                 sign in with a project API token",
    "  ph24 cli search \"reboot a server\"   find the command for a task",
    "  ph24 schema vps power           request/response shape of a command",
    "",
    "Built-in commands:",
    ...BUILTINS.map(([n, d]) => "  " + pad(n, 16) + d),
    "",
    "API commands:",
  ];
  for (const [name, node] of root.children) {
    const ls = leaves(node);
    let desc: string;
    if (ls.length === 1) desc = ls[0].summary;
    else {
      const topics = [...new Set(ls.map((c) => c.tags[0]).filter(Boolean))];
      desc = ls.length + " commands" + (topics.length ? " — " + topics.join(", ") : "");
      if (desc.length > 90) desc = desc.slice(0, 89) + "…";
    }
    lines.push("  " + pad(name, 16) + desc);
  }
  lines.push(
    "",
    "Global flags:",
    "  --profile <name>       use a saved profile (default: the current one; env PH24_PROFILE)",
    "  --project <prj_…>      project for project commands (env PH24_PROJECT)",
    "  --api-url <url>        API base URL (env PH24_API_URL)",
    "  --verbose              log requests to stderr",
    "  -h, --help             help for any command",
    "",
    "Results are JSON on stdout; messages and errors go to stderr. Env PH24_API_TOKEN overrides the saved token.",
  );
  return lines.join("\n");
}

export function groupHelp(path: string[], node: Node): string {
  const lines = ["Usage: ph24 " + path.join(" ") + " <subcommand>", ""];
  if (node.command) lines.push("  " + pad("(itself)", 28) + node.command.summary);
  const rows: [string, string][] = [];
  const walk = (n: Node, prefix: string[]) => {
    for (const [k, c] of n.children) {
      const p = [...prefix, k];
      if (c.command) rows.push([p.join(" ") + c.command.positionals.map((x) => " <" + x.name + ">").join(""), c.command.summary + (c.command.destructive ? " [destructive]" : "")]);
      walk(c, p);
    }
  };
  walk(node, []);
  const w = Math.min(Math.max(...rows.map((r) => r[0].length)) + 2, 48);
  for (const [a, b] of rows) lines.push("  " + pad(a, w) + b);
  lines.push("", "Run ph24 " + path.join(" ") + " <subcommand> --help for its flags.");
  return lines.join("\n");
}

export function commandHelp(c: Command, schemas: Record<string, JsonSchema>): string {
  const r = resolver(schemas);
  const usage = "ph24 " + c.name.join(" ") + c.positionals.map((p) => " <" + p.name + ">").join("") + (c.query.length || c.body?.fields.length ? " [flags]" : "");
  const lines = [c.summary, "", "Usage: " + usage, ""];
  if (c.description) lines.push(c.description.trim(), "");
  const row = (flag: string, type: string, req: boolean, desc?: string) => {
    const left = flag + (type ? " <" + type + ">" : "");
    return "  " + pad(left, 34) + (req ? "(required) " : "") + firstLine(desc).slice(0, 160);
  };
  if (c.positionals.length) {
    lines.push("Arguments:");
    for (const p of c.positionals) lines.push(row("<" + p.name + ">", "", false, p.description));
    lines.push("");
  }
  if (c.query.length) {
    lines.push("Query flags:");
    for (const q of c.query) {
      const t = typeLabel(q.schema, r);
      lines.push(row("--" + q.flag, t === "boolean" ? "" : t, q.required, q.description));
    }
    lines.push("");
  }
  if (c.body) {
    lines.push("Body flags" + (c.body.required ? "" : " (body optional)") + ":");
    for (const f of c.body.fields) {
      const t = typeLabel(f.schema, r);
      lines.push(row("--" + f.flag, t === "boolean" ? "" : t, f.required, f.description));
    }
    lines.push("  " + pad("--body <json|@file|->", 34) + "whole request body as JSON; field flags override it", "");
  }
  lines.push("Command flags:");
  lines.push("  " + pad("--dry-run", 34) + "print the request instead of sending it (no credentials needed)");
  if (c.paginated) lines.push("  " + pad("--all", 34) + "follow next_cursor and print every item as one JSON array");
  if (c.destructive) lines.push("  " + pad("--force", 34) + "confirm this destructive action (required when not interactive)");
  if (c.idempotency) lines.push("  " + pad("--idempotency-key <key>", 34) + "reuse a key to retry safely (default: a new UUID)");
  lines.push("  " + pad("--output <file>", 34) + "write the response body to a file", "");
  const notes = [
    c.method + " " + c.path,
    c.auth === "token" ? "needs a project API token" + (c.ability ? " with ability " + c.ability : "") : "public, no token needed",
    c.stability ? "stability: " + c.stability : "",
    c.rateLimit?.per_minute ? "rate limit: " + c.rateLimit.per_minute + "/min" : "",
    c.destructive ? "destructive: needs --force" : "",
  ].filter(Boolean);
  lines.push("API: " + notes.join(" · "));
  return lines.join("\n");
}
