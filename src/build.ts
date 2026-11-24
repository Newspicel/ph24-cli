// Turns parsed CLI flags into an HTTP request for a generated command.
import type { Command, JsonSchema, Param } from "./manifest.ts";
import { flagStr, type FlagSpec, type Parsed, UsageError } from "./args.ts";
import { readFileSync } from "node:fs";

export const GLOBAL_FLAGS: Record<string, FlagSpec> = {
  help: { boolean: true },
  version: { boolean: true },
  verbose: { boolean: true },
  profile: {},
  project: {},
  "api-url": {},
};

export const COMMAND_FLAGS: Record<string, FlagSpec> = {
  "dry-run": { boolean: true },
  force: { boolean: true },
  all: { boolean: true },
  output: {},
  body: {},
  "idempotency-key": {},
};

export function resolver(schemas: Record<string, JsonSchema>) {
  return (s: any): any => {
    let g = 0;
    while (s && s.$ref && g++ < 20) s = schemas[s.$ref.split("/").pop()];
    return s ?? {};
  };
}

function types(s: any): string[] {
  if (Array.isArray(s.type)) return s.type;
  if (s.type) return [s.type];
  if (s.enum) return [...new Set(s.enum.map((v: any) => (typeof v === "number" ? "integer" : typeof v)))] as string[];
  return [];
}

export function flagSpecs(cmd: Command, schemas: Record<string, JsonSchema>): Map<string, FlagSpec> {
  const r = resolver(schemas);
  const m = new Map<string, FlagSpec>(Object.entries({ ...GLOBAL_FLAGS, ...COMMAND_FLAGS }));
  for (const p of [...cmd.query, ...(cmd.body?.fields ?? [])]) {
    const s = r(p.schema);
    const t = types(s);
    m.set(p.flag, { boolean: t.length > 0 && t.every((x) => x === "boolean" || x === "null"), multiple: t.includes("array") });
  }
  return m;
}

export function typeLabel(s: any, r: (s: any) => any): string {
  s = r(s);
  if (s.enum) return s.enum.filter((v: any) => v !== null).map(String).join("|");
  const t = types(s).filter((x) => x !== "null");
  if (t.includes("array")) {
    const it = r(s.items ?? {});
    return (it.type === "object" ? "json" : typeLabel(it, r)) + "[]";
  }
  if (t.includes("object") || !t.length) return "json";
  return t.join("|");
}

export function coerce(raw: string[], p: Param, schemas: Record<string, JsonSchema>, nullable = false): unknown {
  const r = resolver(schemas);
  const s = r(p.schema);
  const t = types(s);
  const one = (v: string, sch: any): unknown => {
    const tt = types(sch);
    if (v === "null" && (nullable || tt.includes("null"))) return null;
    if (tt.includes("integer") || tt.includes("number")) {
      const n = Number(v);
      if (v.trim() === "" || !Number.isFinite(n)) throw new UsageError("--" + p.flag + " must be a number, got " + JSON.stringify(v));
      if (tt.includes("integer") && !Number.isInteger(n)) throw new UsageError("--" + p.flag + " must be an integer, got " + v);
      if (sch.enum && !sch.enum.includes(n)) throw new UsageError("--" + p.flag + " must be one of " + sch.enum.join(", "));
      return n;
    }
    if (tt.includes("boolean") && (v === "true" || v === "false")) return v === "true";
    if (tt.includes("object") || (!tt.length && !sch.enum)) {
      try { return JSON.parse(v); } catch { if (tt.includes("object")) throw new UsageError("--" + p.flag + " takes JSON, got " + JSON.stringify(v)); return v; }
    }
    if (!tt.length && sch.enum) {
      try { const j = JSON.parse(v); if (sch.enum.includes(j)) return j; } catch {}
      return v;
    }
    if (sch.enum && !sch.enum.includes(v) && !sch["x-extensible-enum"]) {
      throw new UsageError("--" + p.flag + " must be one of: " + sch.enum.filter((x: any) => x !== null).join(", ") + " (got " + JSON.stringify(v) + ")");
    }
    return v;
  };
  if (t.includes("array")) {
    if (raw.length === 1 && raw[0] === "null" && (nullable || t.includes("null"))) return null;
    if (raw.length === 1 && raw[0].trim().startsWith("[")) {
      try { return JSON.parse(raw[0]); } catch { throw new UsageError("--" + p.flag + " takes a JSON array or a repeated flag"); }
    }
    const items = r(s.items ?? {});
    return raw.map((v) => (types(items).includes("object") ? one(v, { type: "object" }) : one(v, items)));
  }
  return one(raw[raw.length - 1], s);
}

export function readBodyArg(v: string, readStdin: () => string): unknown {
  let text = v;
  if (v === "-") text = readStdin();
  else if (v.startsWith("@")) text = readFileSync(v.slice(1), "utf8");
  try { return JSON.parse(text); } catch { throw new UsageError("--body must be JSON (inline, @file or - for stdin)"); }
}

export interface Built {
  method: string;
  url: string;
  query: [string, string][];
  body?: Record<string, unknown>;
  idempotencyKey?: string;
}

export function buildRequest(
  cmd: Command,
  parsed: Parsed,
  ctx: { apiUrl: string; project?: string; dryRun: boolean },
  schemas: Record<string, JsonSchema>,
  readStdin: () => string = () => readFileSync(0, "utf8"),
): Built {
  const usage = "ph24 " + cmd.name.join(" ") + cmd.positionals.map((p) => " <" + p.name + ">").join("");
  if (parsed.unknown.length) {
    throw new UsageError("Unknown flag" + (parsed.unknown.length > 1 ? "s " : " ") + parsed.unknown.join(", ") + ". See: " + usage + " --help");
  }
  if (parsed.positionals.length < cmd.positionals.length) {
    const missing = cmd.positionals.slice(parsed.positionals.length).map((p) => "<" + p.name + ">");
    throw new UsageError("Missing argument " + missing.join(" ") + ". Usage: " + usage);
  }
  if (parsed.positionals.length > cmd.positionals.length) {
    throw new UsageError("Too many arguments: " + parsed.positionals.slice(cmd.positionals.length).join(" ") + ". Usage: " + usage);
  }

  let path = cmd.path;
  if (cmd.auth === "token") {
    if (!ctx.project && !ctx.dryRun) throw new UsageError("No project selected. Run `ph24 auth login`, pass --project prj_…, or set PH24_PROJECT.");
    path = path.replace("{project}", ctx.project ? encodeURIComponent(ctx.project) : "{project}");
  }
  cmd.positionals.forEach((p, i) => { path = path.replace("{" + p.name + "}", encodeURIComponent(parsed.positionals[i])); });

  const query: [string, string][] = [];
  for (const q of cmd.query) {
    const raw = parsed.flags.get(q.flag);
    if (!raw) {
      if (q.required) throw new UsageError("Missing required flag --" + q.flag + ". See: " + usage + " --help");
      continue;
    }
    const v = coerce(raw, q, schemas);
    const vals = Array.isArray(v) ? v : [v];
    for (const x of vals) query.push([q.name, x === null ? "" : String(x)]);
  }

  let body: Record<string, unknown> | undefined;
  if (cmd.body) {
    const bodyFlag = flagStr(parsed, "body");
    if (bodyFlag !== undefined) {
      const b = readBodyArg(bodyFlag, readStdin);
      if (!b || typeof b !== "object" || Array.isArray(b)) throw new UsageError("--body must be a JSON object");
      body = b as Record<string, unknown>;
    }
    for (const f of cmd.body.fields) {
      const raw = parsed.flags.get(f.flag);
      if (raw) (body ??= {})[f.name] = coerce(raw, f, schemas, f.nullable);
    }
    const missing = cmd.body.fields.filter((f) => f.required && !(body && f.name in body));
    if (missing.length && (cmd.body.required || body)) {
      throw new UsageError("Missing required " + (missing.length > 1 ? "fields " : "field ") + missing.map((f) => "--" + f.flag).join(", ") + ". See: " + usage + " --help");
    }
    if (!body && (cmd.body.required || cmd.method !== "GET")) body = {};
  } else if (flagStr(parsed, "body") !== undefined) {
    throw new UsageError("This command takes no request body.");
  }

  const qs = query.length ? "?" + query.map(([k, v]) => encodeURIComponent(k).replace(/%5B/g, "[").replace(/%5D/g, "]") + "=" + encodeURIComponent(v)).join("&") : "";
  let idempotencyKey: string | undefined;
  if (cmd.idempotency) idempotencyKey = flagStr(parsed, "idempotency-key") ?? crypto.randomUUID();

  return { method: cmd.method, url: ctx.apiUrl + path + qs, query, body, idempotencyKey };
}
