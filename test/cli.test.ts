// End-to-end: runs the CLI as a subprocess against a local mock of the API.
import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";

setDefaultTimeout(20_000);
import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CLI = join(import.meta.dir, "..", "src", "cli.ts");
let server: ReturnType<typeof Bun.serve>;
let api = "";
const seen: { method: string; url: string; headers: Record<string, string>; body?: any }[] = [];
let calls429 = 0;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(req) {
      const u = new URL(req.url);
      const body = req.method === "GET" ? undefined : await req.text();
      seen.push({ method: req.method, url: u.pathname + u.search, headers: Object.fromEntries(req.headers), body: body ? JSON.parse(body) : undefined });
      const auth = req.headers.get("authorization");
      const problem = (status: number, type: string, title: string, extra = {}) =>
        Response.json({ type: "https://ph24.io/problems/" + type, title, status, request_id: "req_1", ...extra }, { status, headers: { "content-type": "application/problem+json" } });
      if (u.pathname === "/v1/public/health") return Response.json({ status: "ok" });
      if (auth !== "Bearer ph24_good") return problem(401, "unauthenticated", "Not logged in.");
      if (u.pathname === "/v1/projects/prj_1") return Response.json({ id: "prj_1", name: "Demo", organization_id: "org_1", abilities: ["services.view"] });
      if (u.pathname === "/v1/projects/prj_1/vps" && req.method === "GET") {
        const cursor = u.searchParams.get("cursor");
        if (!cursor) return Response.json({ data: [{ id: "vps_a" }], meta: { limit: 1, has_more: true, next_cursor: "c2" } });
        return Response.json({ data: [{ id: "vps_b" }], meta: { limit: 1, has_more: false, next_cursor: null } });
      }
      if (u.pathname === "/v1/projects/prj_1/vps/vps_busy/power") return problem(409, "operation-in-progress", "Another action is running on this server.", { operation: { id: "op_1" } });
      if (u.pathname === "/v1/projects/prj_1/vps/vps_1/power") return Response.json({ id: "vps_1", operation: { kind: "power" } }, { status: 202 });
      if (u.pathname === "/v1/projects/prj_1/vps/vps_slow") {
        if (calls429++ === 0) return problem(429, "rate-limited", "Too many requests.", {});
        return Response.json({ id: "vps_slow" });
      }
      if (u.pathname === "/v1/projects/prj_1/vps/vps_1/backups/b_1" && req.method === "DELETE") return new Response(null, { status: 204 });
      return problem(404, "not-found", "Not found.");
    },
  });
  api = "http://localhost:" + server.port + "/v1";
});
afterAll(() => server.stop(true));

// Async spawn: the mock server runs in this process, so a blocking spawn would deadlock.
async function run(args: string[], opts: { env?: Record<string, string>; stdin?: string; dir?: string } = {}) {
  const dir = opts.dir ?? mkdtempSync(join(tmpdir(), "ph24-test-"));
  const p = Bun.spawn(["bun", CLI, ...args], {
    env: { PATH: process.env.PATH!, HOME: dir, PH24_CONFIG_DIR: join(dir, "cfg"), PH24_API_URL: api, ...opts.env },
    stdin: opts.stdin !== undefined ? new TextEncoder().encode(opts.stdin) : "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [out, err, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  return { code, out, err, dir };
}

describe("cli", () => {
  test("--help and group help", async () => {
    expect((await run(["--help"])).out).toContain("API commands:");
    expect((await run(["vps", "--help"])).out).toContain("power <vps>");
    expect((await run(["vps", "power", "--help"])).out).toContain("--action <start|shutdown|reboot|stop|reset>");
  });
  test("unknown command suggests", async () => {
    const r = (await run(["vpss", "list"]));
    expect(r.code).toBe(2);
    expect(r.err).toContain("Did you mean");
  });
  test("public command without login", async () => {
    const r = (await run(["public", "health"]));
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toEqual({ status: "ok" });
  });
  test("not logged in exits 3", async () => {
    const r = (await run(["vps", "list", "--project", "prj_1"]));
    expect(r.code).toBe(3);
  });
  test("login via stdin verifies, saves 0600 and whoami works", async () => {
    const r = (await run(["auth", "login", "--with-token", "--project", "prj_1"], { stdin: "ph24_good\n" }));
    expect(r.code).toBe(0);
    expect(r.err).toContain('"Demo"');
    const cfg = join(r.dir, "cfg", "config.json");
    expect(statSync(cfg).mode & 0o777).toBe(0o600);
    expect(JSON.parse(readFileSync(cfg, "utf8")).profiles.default.token).toBe("ph24_good");
    const w = (await run(["auth", "whoami"], { dir: r.dir }));
    expect(w.code).toBe(0);
    const j = JSON.parse(w.out);
    expect(j.project.name).toBe("Demo");
    expect(j.token).not.toContain("good");
  });
  test("login with a bad token fails and saves nothing", async () => {
    const r = (await run(["auth", "login", "--with-token", "--project", "prj_1"], { stdin: "ph24_bad" }));
    expect(r.code).toBe(3);
    expect(r.err).toContain("fix:");
    expect((await run(["auth", "profiles"], { dir: r.dir })).out.trim()).toBe("[]");
  });
  const env = { PH24_API_TOKEN: "ph24_good", PH24_PROJECT: "prj_1" };
  test("--all follows cursors", async () => {
    const r = (await run(["vps", "list", "--all"], { env }));
    expect(JSON.parse(r.out)).toEqual([{ id: "vps_a" }, { id: "vps_b" }]);
  });
  test("202 hints how to follow the operation", async () => {
    const r = (await run(["vps", "power", "vps_1", "--action", "reboot"], { env }));
    expect(r.code).toBe(0);
    expect(r.err).toContain("ph24 vps get vps_1");
  });
  test("problem documents map to exit codes, fixes and details", async () => {
    const r = (await run(["vps", "power", "vps_busy", "--action", "start"], { env }));
    expect(r.code).toBe(6);
    expect(r.err).toContain("operation-in-progress");
    expect(r.err).toContain("fix: A server runs one action at a time");
    expect(r.err).toContain('"operation"');
  });
  test("429 is retried for GET", async () => {
    const r = (await run(["vps", "get", "vps_slow"], { env }));
    expect(r.code).toBe(0);
    expect(r.err).toContain("retrying");
  });
  test("destructive commands need --force when not interactive", async () => {
    const r = (await run(["vps", "backups", "delete", "vps_1", "b_1"], { env }));
    expect(r.code).toBe(2);
    expect(r.err).toContain("--force");
    const ok = (await run(["vps", "backups", "delete", "vps_1", "b_1", "--force"], { env }));
    expect(ok.code).toBe(0);
  });
  test("--dry-run sends nothing and redacts the token", async () => {
    const before = seen.length;
    const r = (await run(["vps", "power", "vps_1", "--action", "stop", "--dry-run"], { env }));
    expect(seen.length).toBe(before);
    const j = JSON.parse(r.out);
    expect(j.headers.Authorization).toContain("redacted");
    expect(j.headers.Authorization).not.toContain("ph24_good");
  });
  test("schema and errors", async () => {
    const s = JSON.parse((await run(["schema", "vps", "power"])).out);
    expect(s.body.flags[0].flag).toBe("--action");
    expect(s.auth).toContain("services.manage");
    expect(JSON.parse((await run(["errors", "rate-limited"])).out).status).toBe(429);
  });
  test("api passthrough fills {project}", async () => {
    const r = (await run(["api", "GET", "/projects/{project}"], { env }));
    expect(JSON.parse(r.out).name).toBe("Demo");
  });
  test("skill install writes SKILL.md", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ph24-skill-"));
    const r = (await run(["skill", "install", "--dir", join(dir, "ph24-cli")]));
    expect(r.code).toBe(0);
    const md = readFileSync(join(dir, "ph24-cli", "SKILL.md"), "utf8");
    expect(md).toStartWith("---\nname: ph24-cli\n");
    expect(md).toContain("ph24 cli search");
  });
});
