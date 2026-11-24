#!/usr/bin/env node
// ph24 — command-line interface for the ph24 (ProHosting24) API.
import bundledManifest from "./generated/manifest.json" with { type: "json" };
import pkg from "../package.json" with { type: "json" };
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { flagBool, flagStr, parseArgs, type FlagSpec, type Parsed, UsageError } from "./args.ts";
import { buildRequest, flagSpecs, GLOBAL_FLAGS, readBodyArg, typeLabel, resolver } from "./build.ts";
import { configDir, configPath, loadConfig, maskToken, removeConfigFile, resolveContext, saveConfig, type Context } from "./config.ts";
import { buildTree, commandHelp, groupHelp, rootHelp, type Node } from "./help.ts";
import { ApiError, formatProblem, send } from "./http.ts";
import { fetchManifest, inlineSchema, SPEC_URL, type Command, type Manifest } from "./manifest.ts";
import { search } from "./search.ts";
import { renderSkill } from "./skill.ts";

const VERSION: string = pkg.version;

class AuthError extends Error {}

// ---------- manifest ----------

function loadManifest(): { manifest: Manifest; source: "bundled" | "cache" } {
  const cache = join(configDir(), "manifest.json");
  if (!process.env.PH24_NO_CACHE && existsSync(cache)) {
    try { return { manifest: JSON.parse(readFileSync(cache, "utf8")), source: "cache" }; } catch {}
  }
  return { manifest: bundledManifest as unknown as Manifest, source: "bundled" };
}

const { manifest: M, source: manifestSource } = loadManifest();
const tree = buildTree(M.commands);

// ---------- output helpers ----------

const out = (v: unknown) => process.stdout.write(JSON.stringify(v, null, 2) + "\n");
const info = (s: string) => process.stderr.write(s + "\n");

function findCommand(words: string[]): { node: Node; used: number } {
  let node = tree;
  let used = 0;
  for (const w of words) {
    const next = node.children.get(w);
    if (!next) break;
    node = next;
    used++;
  }
  return { node, used };
}

function suggest(words: string[]): string {
  const hits = search(M.commands, words.join(" "), 3);
  return hits.length ? "\nDid you mean:\n" + hits.map((h) => "  " + h.command + h.arguments.map((a) => " " + a).join("") + "   " + h.summary).join("\n") : "";
}

function headersFor(ctx: Context, cmdAuth: "token" | "none", extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json", "User-Agent": "ph24-cli/" + VERSION, ...extra };
  if (ctx.token && cmdAuth === "token") h.Authorization = "Bearer " + ctx.token;
  return h;
}

function redact(h: Record<string, string>): Record<string, string> {
  const c = { ...h };
  if (c.Authorization) c.Authorization = "Bearer " + maskToken(c.Authorization.slice(7)) + " (redacted)";
  return c;
}

async function writeResult(r: { status: number; json?: any; text?: string; bytes?: Uint8Array }, output?: string) {
  if (output) {
    const data = r.bytes ?? (r.text !== undefined ? r.text : JSON.stringify(r.json, null, 2) + "\n");
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, data);
    info("Wrote " + (typeof data === "string" ? Buffer.byteLength(data) : data.length) + " bytes to " + output);
    return;
  }
  if (r.status === 204) { info("Done (204 No Content)."); return; }
  if (r.json !== undefined) out(r.json);
  else if (r.text !== undefined) process.stdout.write(r.text.endsWith("\n") ? r.text : r.text + "\n");
  else if (r.bytes) {
    if (process.stdout.isTTY) throw new UsageError("The response is binary (" + r.bytes.length + " bytes). Use --output <file>.");
    process.stdout.write(r.bytes);
  }
}

// ---------- prompts ----------

const interactive = () => !!process.stdin.isTTY && !!process.stderr.isTTY;

function promptLine(q: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((res) => rl.question(q, (a) => { rl.close(); res(a.trim()); }));
}

const CTRL_C = String.fromCharCode(3);
const BACKSPACE = String.fromCharCode(127);

function promptHidden(q: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    process.stderr.write(q);
    let buf = "";
    const cleanup = () => { stdin.setRawMode(false); stdin.pause(); stdin.off("data", onData); };
    const onData = (s: string) => {
      for (const ch of s) {
        if (ch === "\r" || ch === "\n") { cleanup(); process.stderr.write("\n"); resolve(buf.trim()); return; }
        if (ch === CTRL_C) { cleanup(); process.stderr.write("\n"); reject(new UsageError("Aborted.")); return; }
        if (ch === BACKSPACE || ch === "\b") { buf = buf.slice(0, -1); continue; }
        buf += ch;
      }
    };
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onData);
  });
}

const readStdin = () => readFileSync(0, "utf8");

// ---------- generated API commands ----------

async function runCommand(cmd: Command, parsed: Parsed) {
  if (flagBool(parsed, "help")) { console.log(commandHelp(cmd, M.schemas)); return; }
  const ctx = resolveContext({ profile: flagStr(parsed, "profile"), project: flagStr(parsed, "project"), apiUrl: flagStr(parsed, "api-url") });
  const dryRun = flagBool(parsed, "dry-run");
  const built = buildRequest(cmd, parsed, { apiUrl: ctx.apiUrl, project: ctx.project, dryRun }, M.schemas, readStdin);
  const extra: Record<string, string> = {};
  if (built.body !== undefined) extra["Content-Type"] = "application/json";
  if (built.idempotencyKey) extra["Idempotency-Key"] = built.idempotencyKey;
  const headers = headersFor(ctx, cmd.auth, extra);

  if (dryRun) {
    out({ method: built.method, url: built.url, headers: redact(headers), body: built.body, destructive: cmd.destructive || undefined, costs_money: cmd.costsMoney || undefined });
    return;
  }
  if (cmd.auth === "token" && !ctx.token) throw new AuthError("Not logged in (profile \"" + ctx.profileName + "\"). Run `ph24 auth login` or set PH24_API_TOKEN.");

  if (cmd.destructive && !flagBool(parsed, "force")) {
    const what = ("ph24 " + cmd.name.join(" ") + " " + parsed.positionals.join(" ")).trim();
    if (!interactive()) throw new UsageError("Refusing to run \"" + what + "\" without --force: it is destructive (" + cmd.summary + "). Re-run with --force to confirm.");
    const a = await promptLine(cmd.summary + " (" + built.method + " " + built.url + ").\nThis is destructive. Continue? [y/N] ");
    if (!/^y(es)?$/i.test(a)) throw new UsageError("Aborted.");
  }

  const verbose = flagBool(parsed, "verbose");
  const retry = cmd.method === "GET" || !!built.idempotencyKey;
  if (flagBool(parsed, "all")) {
    if (!cmd.paginated) throw new UsageError("--all works only on paginated list commands.");
    const items: unknown[] = [];
    let url = built.url;
    for (let page = 0; page < 10000; page++) {
      const r = await send({ method: built.method, url, headers }, { retry: true, verbose });
      items.push(...(Array.isArray(r.json?.data) ? r.json.data : []));
      const next = r.json?.meta?.next_cursor;
      if (!next || r.json?.meta?.has_more === false) break;
      const u = new URL(url);
      u.searchParams.set("cursor", next);
      url = u.toString();
    }
    await writeResult({ status: 200, json: items }, flagStr(parsed, "output"));
    return;
  }
  const r = await send({ method: built.method, url: built.url, headers, body: built.body }, { retry, verbose });
  await writeResult(r, flagStr(parsed, "output"));
  if (r.status === 202) {
    const parent = cmd.name.slice(0, -1).join(" ");
    const getCmd = M.commands.find((c) => c.method === "GET" && c.name.at(-1) === "get" && c.name.slice(0, -1).join(" ") === parent);
    info("Accepted (202): runs in the background." + (getCmd ? " Follow it with: ph24 " + getCmd.name.join(" ") + getCmd.positionals.map((p, i) => " " + (parsed.positionals[i] ?? "<" + p.name + ">")).join("") : ""));
  }
}

// ---------- built-ins ----------

function parseBuiltin(tokens: string[], extra: Record<string, FlagSpec> = {}): Parsed {
  const p = parseArgs(tokens, new Map(Object.entries({ ...GLOBAL_FLAGS, ...extra })));
  if (p.unknown.length) throw new UsageError("Unknown flag " + p.unknown.join(", "));
  return p;
}

const AUTH_HELP = [
  "Usage: ph24 auth <subcommand>",
  "",
  "  login      Save a project API token (prompts for it; or --with-token reads stdin)",
  "  whoami     Show the profile, project and token in use (exit 3 when not logged in)",
  "  logout     Remove a profile's token (--all removes every profile)",
  "  profiles   List saved profiles",
  "  use <name> Make a profile the default",
  "",
  "Login flags:",
  "  --project <prj_…>   the token's project (asked when missing)",
  "  --profile <name>    save under this profile (default: the current one, else \"default\")",
  "  --with-token        read the token from stdin",
  "  --token <token>     the token (avoid: it ends up in shell history)",
  "  --api-url <url>     another API base URL",
  "  --no-verify         save without calling the API",
  "",
  "Tokens are created in the customer area under Project settings → API tokens.",
  "Env PH24_API_TOKEN / PH24_PROJECT / PH24_PROFILE override the saved values.",
].join("\n");

async function auth(tokens: string[]) {
  const sub = tokens[0] && !tokens[0].startsWith("-") ? tokens.shift() : undefined;
  if (!sub || sub === "help") { console.log(AUTH_HELP); return; }
  if (sub === "login") {
    const p = parseBuiltin(tokens, { token: {}, "with-token": { boolean: true }, verify: { boolean: true } });
    if (flagBool(p, "help")) { console.log(AUTH_HELP); return; }
    const cfg = loadConfig();
    const profileName = flagStr(p, "profile") || process.env.PH24_PROFILE || cfg.current || "default";
    const existing = cfg.profiles[profileName] ?? {};
    let token = flagStr(p, "token");
    if (!token && flagBool(p, "with-token")) token = readStdin().trim();
    if (!token) {
      if (!interactive()) throw new UsageError("No token given. Pipe it in: echo \"$TOKEN\" | ph24 auth login --with-token --project prj_…");
      info("Create a token in the customer area: Project settings → API tokens.");
      token = await promptHidden("API token (ph24_…): ");
    }
    if (!token) throw new UsageError("No token given.");
    if (!token.startsWith("ph24_")) info("Warning: ph24 API tokens usually start with ph24_.");
    let project = flagStr(p, "project") || process.env.PH24_PROJECT || existing.project;
    if (!project && interactive()) project = await promptLine("Project id (prj_…): ");
    if (!project) throw new UsageError("No project given. Pass --project prj_… (the project the token belongs to).");
    const apiUrl = (flagStr(p, "api-url") || existing.api_url || process.env.PH24_API_URL || M.serverUrl).replace(/\/+$/, "");
    let projectName: string | undefined;
    if (p.flags.get("verify")?.at(-1) !== "false") {
      const ctx = { token, apiUrl } as Context;
      try {
        const r = await send({ method: "GET", url: apiUrl + "/projects/" + encodeURIComponent(project), headers: headersFor(ctx, "token") }, { retry: true });
        const pr = r.json?.data ?? r.json;
        projectName = pr?.name;
        if (pr?.abilities) info("Token abilities: " + pr.abilities.join(", "));
      } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 403)) info("The token can't open project " + project + ": check that the token belongs to this project.");
        throw e;
      }
    }
    cfg.profiles[profileName] = { ...existing, token, project, project_name: projectName, api_url: apiUrl === M.serverUrl ? undefined : apiUrl };
    cfg.current = profileName;
    saveConfig(cfg);
    info("Logged in to project " + (projectName ? "\"" + projectName + "\" " : "") + "(" + project + ") as profile \"" + profileName + "\". Saved to " + configPath());
    if (process.env.PH24_API_TOKEN) info("Note: PH24_API_TOKEN is set and overrides the saved token.");
    return;
  }
  if (sub === "whoami") {
    const p = parseBuiltin(tokens);
    const ctx = resolveContext({ profile: flagStr(p, "profile"), project: flagStr(p, "project"), apiUrl: flagStr(p, "api-url") });
    const base = { profile: ctx.profileName, api_url: ctx.apiUrl, token: maskToken(ctx.token), token_source: ctx.tokenSource, project_id: ctx.project, project_source: ctx.projectSource, config: configPath(), commands: manifestSource };
    if (!ctx.token) { out({ logged_in: false, ...base }); throw new AuthError("Not logged in. Run ph24 auth login or set PH24_API_TOKEN."); }
    if (!ctx.project) { out({ logged_in: true, ...base }); throw new UsageError("No project selected. Pass --project or run ph24 auth login."); }
    const r = await send({ method: "GET", url: ctx.apiUrl + "/projects/" + encodeURIComponent(ctx.project), headers: headersFor(ctx, "token") }, { retry: true });
    const pr = r.json?.data ?? r.json;
    out({ logged_in: true, ...base, project: { id: pr?.id, name: pr?.name, organization_id: pr?.organization_id, abilities: pr?.abilities } });
    return;
  }
  if (sub === "logout") {
    const p = parseBuiltin(tokens, { all: { boolean: true } });
    const cfg = loadConfig();
    if (flagBool(p, "all")) { removeConfigFile("config.json"); info("Removed all profiles."); return; }
    const name = flagStr(p, "profile") || process.env.PH24_PROFILE || cfg.current || "default";
    if (!cfg.profiles[name]) { info("Profile \"" + name + "\" is not logged in."); return; }
    delete cfg.profiles[name];
    if (cfg.current === name) cfg.current = Object.keys(cfg.profiles)[0];
    saveConfig(cfg);
    info("Logged out of profile \"" + name + "\"." + (cfg.current ? " Current profile: " + cfg.current : ""));
    return;
  }
  if (sub === "profiles") {
    parseBuiltin(tokens);
    const cfg = loadConfig();
    out(Object.entries(cfg.profiles).map(([name, pr]) => ({ name, current: name === (cfg.current ?? "default"), project: pr.project, project_name: pr.project_name, token: maskToken(pr.token), api_url: pr.api_url })));
    return;
  }
  if (sub === "use") {
    const p = parseBuiltin(tokens);
    const name = p.positionals[0];
    if (!name) throw new UsageError("Usage: ph24 auth use <profile>");
    const cfg = loadConfig();
    if (!cfg.profiles[name]) throw new UsageError("No profile \"" + name + "\". Known: " + (Object.keys(cfg.profiles).join(", ") || "none"));
    cfg.current = name;
    saveConfig(cfg);
    info("Now using profile \"" + name + "\" (" + (cfg.profiles[name].project_name ?? cfg.profiles[name].project) + ").");
    return;
  }
  throw new UsageError("Unknown subcommand auth " + sub + ".\n" + AUTH_HELP);
}

const CLI_HELP = [
  "Usage: ph24 cli <subcommand>",
  "",
  "  search \"<task>\" [--limit n]      find commands for a task (local, JSON)",
  "  commands [--json]                list every command",
  "  refresh [--url <spec>] [--reset] regenerate the commands from the latest OpenAPI spec and error catalogue",
].join("\n");

async function cli(tokens: string[]) {
  const sub = tokens[0] && !tokens[0].startsWith("-") ? tokens.shift() : undefined;
  if (!sub || sub === "help") { console.log(CLI_HELP); return; }
  if (sub === "search") {
    const p = parseBuiltin(tokens, { limit: {} });
    const q = p.positionals.join(" ");
    if (!q) throw new UsageError("Usage: ph24 cli search \"<task>\"");
    out(search(M.commands, q, Number(flagStr(p, "limit") ?? 5)));
    return;
  }
  if (sub === "commands") {
    const p = parseBuiltin(tokens, { json: { boolean: true } });
    if (flagBool(p, "json")) {
      out(M.commands.map((c) => ({ command: "ph24 " + c.name.join(" "), arguments: c.positionals.map((x) => "<" + x.name + ">"), summary: c.summary, method: c.method, path: c.path, destructive: c.destructive, costs_money: c.costsMoney })));
    } else {
      for (const c of M.commands) console.log("ph24 " + c.name.join(" ") + c.positionals.map((x) => " <" + x.name + ">").join("") + "  —  " + c.summary + (c.destructive ? " [destructive]" : ""));
    }
    return;
  }
  if (sub === "refresh") {
    const p = parseBuiltin(tokens, { url: {}, reset: { boolean: true } });
    const cache = join(configDir(), "manifest.json");
    if (flagBool(p, "reset")) { removeConfigFile("manifest.json"); info("Using the built-in commands again (" + (bundledManifest as any).commands.length + ")."); return; }
    const url = flagStr(p, "url") ?? SPEC_URL;
    info("Fetching " + url + " …");
    const next = await fetchManifest(url, flagStr(p, "api-url"));
    const key = (c: Command) => c.name.join(" ");
    const before = new Set(M.commands.map(key));
    const after = new Set(next.commands.map(key));
    mkdirSync(configDir(), { recursive: true, mode: 0o700 });
    writeFileSync(cache, JSON.stringify(next));
    out({
      commands: next.commands.length,
      error_types: next.errors.length,
      spec_version: next.specVersion,
      added: [...after].filter((k) => !before.has(k)).map((k) => "ph24 " + k),
      removed: [...before].filter((k) => !after.has(k)).map((k) => "ph24 " + k),
      saved: cache,
    });
    return;
  }
  throw new UsageError("Unknown subcommand cli " + sub + ".\n" + CLI_HELP);
}

function schema(tokens: string[]) {
  const p = parseBuiltin(tokens, { depth: {} });
  if (!p.positionals.length || flagBool(p, "help")) { console.log("Usage: ph24 schema <command…> [--depth n]   e.g. ph24 schema vps power"); return; }
  const { node, used } = findCommand(p.positionals);
  if (!node.command || used !== p.positionals.length) {
    if (used && used === p.positionals.length && node.children.size) throw new UsageError("\"" + p.positionals.join(" ") + "\" is a group.\n" + groupHelp(p.positionals, node));
    throw new UsageError("No command \"" + p.positionals.join(" ") + "\"." + suggest(p.positionals));
  }
  const c = node.command;
  const depth = Number(flagStr(p, "depth") ?? 6);
  const r = resolver(M.schemas);
  const inl = (s: any) => inlineSchema(s, M.schemas, depth);
  out({
    command: "ph24 " + c.name.join(" ") + c.positionals.map((x) => " <" + x.name + ">").join(""),
    operation_id: c.operationId,
    method: c.method,
    path: c.path,
    summary: c.summary,
    description: c.description,
    auth: c.auth === "token" ? "project API token" + (c.ability ? " with ability " + c.ability : "") : "none",
    stability: c.stability,
    rate_limit_per_minute: c.rateLimit?.per_minute,
    destructive: c.destructive,
    costs_money: c.costsMoney,
    idempotency_key: c.idempotency,
    paginated: c.paginated,
    arguments: c.positionals.map((x) => ({ name: x.name, description: x.description })),
    query: c.query.map((q) => ({ flag: "--" + q.flag, name: q.name, type: typeLabel(q.schema, r), required: q.required, description: q.description, schema: inl(q.schema) })),
    body: c.body && {
      required: c.body.required,
      flags: c.body.fields.map((f) => ({ flag: "--" + f.flag, name: f.name, type: typeLabel(f.schema, r), required: f.required, description: f.description })),
      schema: inl(c.body.schema),
    },
    response: inl(c.response),
  });
}

function errors(tokens: string[]) {
  const p = parseBuiltin(tokens);
  const t = p.positionals[0];
  if (!t) { out(M.errors.map((e) => ({ type: e.type, status: e.status, title: e.title }))); return; }
  const key = t.split("/").pop()!;
  const e = M.errors.find((x) => x.type === key);
  if (!e) throw new UsageError("Unknown error type \"" + t + "\". Run ph24 errors to list them.");
  out({ ...e, uri: "https://ph24.io/problems/" + e.type });
}

async function api(tokens: string[]) {
  const p = parseBuiltin(tokens, { body: {}, query: { multiple: true }, "dry-run": { boolean: true }, output: {}, "idempotency-key": {}, force: { boolean: true } });
  const [method, path] = p.positionals;
  if (!method || !path || flagBool(p, "help")) {
    console.log("Usage: ph24 api <METHOD> <path> [--query k=v]… [--body json|@file|-] [--idempotency-key k] [--dry-run]\n  {project} in the path is replaced with the current project, e.g. ph24 api GET /projects/{project}/vps");
    return;
  }
  const ctx = resolveContext({ profile: flagStr(p, "profile"), project: flagStr(p, "project"), apiUrl: flagStr(p, "api-url") });
  let resolved = path;
  if (resolved.includes("{project}")) {
    if (!ctx.project) throw new UsageError("No project selected for {project}.");
    resolved = resolved.replace("{project}", encodeURIComponent(ctx.project));
  }
  const u = new URL(/^https?:/.test(resolved) ? resolved : ctx.apiUrl + (resolved.startsWith("/") ? "" : "/") + resolved);
  for (const kv of p.flags.get("query") ?? []) {
    const i = kv.indexOf("=");
    if (i < 1) throw new UsageError("--query takes key=value");
    u.searchParams.append(kv.slice(0, i), kv.slice(i + 1));
  }
  const bodyArg = flagStr(p, "body");
  const body = bodyArg !== undefined ? readBodyArg(bodyArg, readStdin) : undefined;
  const m = method.toUpperCase();
  const extra: Record<string, string> = {};
  if (body !== undefined) extra["Content-Type"] = "application/json";
  const idem = flagStr(p, "idempotency-key") ?? (m === "POST" ? crypto.randomUUID() : undefined);
  if (idem) extra["Idempotency-Key"] = idem;
  const headers = headersFor(ctx, "token", extra);
  if (flagBool(p, "dry-run")) { out({ method: m, url: u.toString(), headers: redact(headers), body }); return; }
  if (m === "DELETE" && !flagBool(p, "force")) throw new UsageError("Refusing to send DELETE without --force.");
  const r = await send({ method: m, url: u.toString(), headers, body }, { retry: m === "GET" || !!idem, verbose: flagBool(p, "verbose") });
  await writeResult(r, flagStr(p, "output"));
}

function skill(tokens: string[]) {
  const sub = tokens[0] && !tokens[0].startsWith("-") ? tokens.shift() : undefined;
  const p = parseBuiltin(tokens, { dir: {} });
  if (sub === "show") { process.stdout.write(renderSkill(M)); return; }
  if (sub === "install") {
    const dir = flagStr(p, "dir") ?? join(homedir(), ".claude", "skills", "ph24-cli");
    const f = join(dir, "SKILL.md");
    const existed = existsSync(f);
    mkdirSync(dir, { recursive: true });
    writeFileSync(f, renderSkill(M));
    info((existed ? "Updated " : "Installed ") + f);
    return;
  }
  console.log("Usage: ph24 skill show | ph24 skill install [--dir <dir>]   (default dir: ~/.claude/skills/ph24-cli)");
}

// ---------- main ----------

const GLOBAL_VALUE_FLAGS = new Set(Object.entries(GLOBAL_FLAGS).filter(([, s]) => !s.boolean).map(([k]) => k));

export async function main(argv: string[]): Promise<void> {
  // Pull leading global flags off so "ph24 --profile x vps list" works.
  const lead: string[] = [];
  let i = 0;
  while (i < argv.length && argv[i].startsWith("-")) {
    const t = argv[i];
    lead.push(t);
    if (t.startsWith("--") && !t.includes("=") && GLOBAL_VALUE_FLAGS.has(t.slice(2)) && i + 1 < argv.length) lead.push(argv[++i]);
    i++;
  }
  const rest = argv.slice(i);
  const first = rest[0];

  if (!first) {
    if (lead.includes("--version") || lead.includes("-v")) { console.log(VERSION); return; }
    console.log(rootHelp(M, tree, VERSION));
    return;
  }
  const tail = [...rest.slice(1), ...lead];
  switch (first) {
    case "version": console.log(VERSION); return;
    case "help":
      if (rest.length === 1) { console.log(rootHelp(M, tree, VERSION)); return; }
      return main([...rest.slice(1), "--help"]);
    case "auth": return auth(tail);
    case "cli": return cli(tail);
    case "schema": return schema(tail);
    case "errors": return errors(tail);
    case "api": return api(tail);
    case "skill": return skill(tail);
  }

  const { node, used } = findCommand(rest);
  if (!used) throw new UsageError("Unknown command \"" + first + "\"." + suggest(rest) + "\nRun ph24 --help for all commands.");
  const words = rest.slice(0, used);
  const remaining = [...lead, ...rest.slice(used)];
  if (!node.command) {
    const wantsHelp = remaining.includes("--help") || remaining.includes("-h");
    const next = remaining.find((t) => !t.startsWith("-"));
    if (wantsHelp && !next) { console.log(groupHelp(words, node)); return; }
    throw new UsageError((next ? "Unknown subcommand \"" + next + "\" for ph24 " + words.join(" ") + ".\n\n" : "") + groupHelp(words, node));
  }
  const parsed = parseArgs(remaining, flagSpecs(node.command, M.schemas));
  return runCommand(node.command, parsed);
}

export function exitCodeFor(status: number): number {
  if (status === 401) return 3;
  if (status === 403) return 4;
  if (status === 404) return 5;
  if (status === 409) return 6;
  if (status === 400 || status === 413 || status === 422) return 7;
  if (status === 429) return 8;
  if (status >= 500) return 9;
  return 1;
}

const STANDARD = new Set(["type", "title", "status", "detail", "instance", "errors", "request_id"]);

export function describeError(e: ApiError): string {
  const p = e.problem;
  const kind = p && typeof p === "object" && typeof p.type === "string" ? p.type.split("/").pop() : undefined;
  const entry = M.errors.find((x) => x.type === kind);
  let s = "Error: " + formatProblem(e.status, p, entry?.explanation?.replace(/\s+/g, " "));
  if (p && typeof p === "object") {
    const extras = Object.fromEntries(Object.entries(p).filter(([k]) => !STANDARD.has(k)));
    if (Object.keys(extras).length) s += "\n  details: " + JSON.stringify(extras);
  } else if (e.status === 401) {
    s += "\n  fix: the token was refused. Run ph24 auth login with a valid token.";
  }
  return s;
}

if (!process.env.PH24_NO_MAIN) {
  main(process.argv.slice(2)).catch((e) => {
    if (e instanceof ApiError) { info(describeError(e)); process.exit(exitCodeFor(e.status)); }
    if (e instanceof UsageError) { info("Error: " + e.message); process.exit(2); }
    if (e instanceof AuthError) { info("Error: " + e.message); process.exit(3); }
    info("Error: " + (e?.cause?.message ? e.message + " (" + e.cause.message + ")" : e?.message ?? String(e)));
    process.exit(1);
  });
}
