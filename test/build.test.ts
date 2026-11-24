import { describe, expect, test } from "bun:test";
import manifestJson from "../src/generated/manifest.json";
import type { Manifest } from "../src/manifest.ts";
import { parseArgs, UsageError } from "../src/args.ts";
import { buildRequest, flagSpecs } from "../src/build.ts";

const M = manifestJson as unknown as Manifest;
const cmd = (name: string) => {
  const c = M.commands.find((c) => c.name.join(" ") === name);
  if (!c) throw new Error("no command " + name);
  return c;
};
const build = (name: string, argv: string[], project: string | null = "prj_1", stdin = "") => {
  const c = cmd(name);
  return buildRequest(c, parseArgs(argv, flagSpecs(c, M.schemas)), { apiUrl: "https://api.test/v1", project: project ?? undefined, dryRun: false }, M.schemas, () => stdin);
};

describe("buildRequest", () => {
  test("path params and body", () => {
    const r = build("vps power", ["vps_9", "--action", "reboot"]);
    expect(r.method).toBe("POST");
    expect(r.url).toBe("https://api.test/v1/projects/prj_1/vps/vps_9/power");
    expect(r.body).toEqual({ action: "reboot" });
  });
  test("enum is checked", () => {
    expect(() => build("vps power", ["vps_9", "--action", "explode"])).toThrow(/must be one of/);
  });
  test("required body fields", () => {
    expect(() => build("vps power", ["vps_9"])).toThrow(/--action/);
  });
  test("--body merges with field flags, flags win", () => {
    const r = build("vps power", ["vps_9", "--body", '{"action":"stop","x":1}', "--action", "start"]);
    expect(r.body).toEqual({ action: "start", x: 1 });
  });
  test("--body - reads stdin", () => {
    expect(build("vps power", ["vps_9", "--body", "-"], "prj_1", '{"action":"reset"}').body).toEqual({ action: "reset" });
  });
  test("query flags keep API names and coerce integers", () => {
    const r = build("vps list", ["--limit", "5", "--filter-state", "running"]);
    expect(r.url).toBe("https://api.test/v1/projects/prj_1/vps?limit=5&filter[state]=running");
    expect(() => build("vps list", ["--limit", "five"])).toThrow(/number/);
  });
  test("array query params repeat", () => {
    const r = build("domain-check", ["--name", "example", "--tlds", "com", "--tlds", "de"].filter(Boolean));
    expect(r.url).toContain("tlds[]=com&tlds[]=de");
  });
  test("argument count is checked", () => {
    expect(() => build("vps get", [])).toThrow(/Missing argument <vps>/);
    expect(() => build("vps get", ["a", "b"])).toThrow(/Too many/);
  });
  test("project is required for project commands", () => {
    expect(() => build("vps list", [], null)).toThrow(/No project/);
  });
  test("public commands need no project", () => {
    expect(build("public health", [], null).url).toBe("https://api.test/v1/public/health");
  });
  test("idempotency key is generated when the endpoint takes one", () => {
    const c = M.commands.find((c) => c.idempotency === "required")!;
    expect(c).toBeDefined();
    const args = c.positionals.map(() => "id_1");
    const body = Object.fromEntries((c.body?.fields ?? []).filter((f) => f.required).map((f) => [f.name, "x"]));
    const r = buildRequest(c, parseArgs([...args, "--body", JSON.stringify(body), "--idempotency-key", "key-12345"], flagSpecs(c, M.schemas)), { apiUrl: "https://a", project: "prj_1", dryRun: false }, M.schemas);
    expect(r.idempotencyKey).toBe("key-12345");
  });
  test("unknown flags are rejected", () => {
    expect(() => build("vps list", ["--bogus", "1"])).toThrow(UsageError);
  });
  test("API fields that clash with CLI flags get a prefix", () => {
    const c = cmd("firewalls create");
    expect(c.body!.fields.find((f) => f.name === "dry_run")?.flag).toBe("body-dry-run");
  });
});
