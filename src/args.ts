// Minimal argv parser that knows which flags are booleans and which repeat.

export interface FlagSpec {
  boolean?: boolean;
  multiple?: boolean;
}

export interface Parsed {
  positionals: string[];
  flags: Map<string, string[]>; // booleans are stored as ["true"] / ["false"]
  unknown: string[];
}

export class UsageError extends Error {}

export function parseArgs(tokens: string[], spec: Map<string, FlagSpec>): Parsed {
  const positionals: string[] = [];
  const flags = new Map<string, string[]>();
  const unknown: string[] = [];
  const put = (k: string, v: string, multiple?: boolean) => {
    const cur = flags.get(k);
    if (cur && multiple) cur.push(v);
    else flags.set(k, [v]);
  };
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "--") { positionals.push(...tokens.slice(i + 1)); break; }
    if (t === "-h") { put("help", "true"); continue; }
    if (!t.startsWith("--") || t === "-") { positionals.push(t); continue; }
    let name = t.slice(2);
    let value: string | undefined;
    const eq = name.indexOf("=");
    if (eq >= 0) { value = name.slice(eq + 1); name = name.slice(0, eq); }
    let s = spec.get(name);
    if (!s && name.startsWith("no-") && spec.get(name.slice(3))?.boolean && value === undefined) {
      put(name.slice(3), "false");
      continue;
    }
    if (!s) {
      // accept the API spelling too (e.g. --filter[state], --dry_run)
      const alt = name.replace(/\[\]$/, "").replace(/\[([^\]]+)\]/g, "-$1").replace(/_/g, "-").toLowerCase();
      s = spec.get(alt);
      if (s) name = alt;
    }
    if (!s) { unknown.push("--" + name); if (value === undefined && tokens[i + 1] && !tokens[i + 1].startsWith("--")) i++; continue; }
    if (s.boolean) {
      if (value === undefined && (tokens[i + 1] === "true" || tokens[i + 1] === "false")) value = tokens[++i];
      if (value !== undefined && value !== "true" && value !== "false") throw new UsageError("--" + name + " takes true or false, got " + JSON.stringify(value));
      put(name, value ?? "true");
      continue;
    }
    if (value === undefined) {
      if (i + 1 >= tokens.length) throw new UsageError("--" + name + " needs a value");
      value = tokens[++i];
    }
    put(name, value, s.multiple);
  }
  return { positionals, flags, unknown };
}

export function flagStr(p: Parsed, name: string): string | undefined {
  return p.flags.get(name)?.at(-1);
}

export function flagBool(p: Parsed, name: string): boolean {
  return p.flags.get(name)?.at(-1) === "true";
}
