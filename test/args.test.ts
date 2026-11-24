import { describe, expect, test } from "bun:test";
import { parseArgs, UsageError } from "../src/args.ts";

const spec = new Map([
  ["force", { boolean: true }],
  ["name", {}],
  ["tlds", { multiple: true }],
  ["filter-state", {}],
]);

describe("parseArgs", () => {
  test("positionals, values and booleans", () => {
    const p = parseArgs(["vps_1", "--name", "web", "--force", "x"], spec);
    expect(p.positionals).toEqual(["vps_1", "x"]);
    expect(p.flags.get("name")).toEqual(["web"]);
    expect(p.flags.get("force")).toEqual(["true"]);
  });
  test("--flag=value, --no-flag and explicit booleans", () => {
    const p = parseArgs(["--name=a=b", "--no-force"], spec);
    expect(p.flags.get("name")).toEqual(["a=b"]);
    expect(p.flags.get("force")).toEqual(["false"]);
    expect(parseArgs(["--force", "false"], spec).flags.get("force")).toEqual(["false"]);
  });
  test("repeatable flags collect values", () => {
    expect(parseArgs(["--tlds", "com", "--tlds", "de"], spec).flags.get("tlds")).toEqual(["com", "de"]);
  });
  test("API spelling is accepted", () => {
    expect(parseArgs(["--filter[state]", "running"], spec).flags.get("filter-state")).toEqual(["running"]);
  });
  test("unknown flags are reported, -- ends flags", () => {
    const p = parseArgs(["--nope", "1", "--", "--name"], spec);
    expect(p.unknown).toEqual(["--nope"]);
    expect(p.positionals).toEqual(["--name"]);
  });
  test("missing value throws", () => {
    expect(() => parseArgs(["--name"], spec)).toThrow(UsageError);
  });
});
