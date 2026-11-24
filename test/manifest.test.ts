import { describe, expect, test } from "bun:test";
import manifestJson from "../src/generated/manifest.json";
import { buildManifest, inlineSchema, toFlag, type Manifest } from "../src/manifest.ts";
import { search } from "../src/search.ts";

const M = manifestJson as unknown as Manifest;

const mini = {
  info: { title: "t", version: "1" },
  servers: [{ url: "https://x/api" }],
  paths: {
    "/projects/{project}/things": {
      get: { operationId: "projects.things.index", summary: "List things", security: [{ apiToken: [] }], parameters: [{ in: "path", name: "project", required: true }, { in: "query", name: "cursor" }, { in: "query", name: "filter[kind]" }], responses: { "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/List" } } } } } },
      post: { operationId: "projects.things.store", summary: "Create a thing", description: "It is billed by the hour.", security: [{ apiToken: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Req" } } } }, responses: {} },
    },
    "/projects/{project}/things/{thing}": {
      delete: { operationId: "projects.things.destroy", summary: "Delete", security: [{ apiToken: [] }], responses: {} },
    },
    "/projects/{project}/things/{thing}/wipe": {
      post: { operationId: "projects.things.wipe", summary: "Wipe", description: "Everything on its disk is lost.", security: [{ apiToken: [] }], responses: {} },
    },
    "/me": { get: { operationId: "me.show", "x-session-only": true, security: [{ apiToken: [] }], responses: {} } },
    "/public/ping": { get: { operationId: "public.ping", summary: "Ping", responses: {} } },
    "/auth/login": { post: { operationId: "auth.login", summary: "Login", responses: {} } },
  },
  components: {
    schemas: {
      List: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Thing" } }, meta: { type: "object" } } },
      Thing: { type: "object", properties: { id: { type: "string" } } },
      Req: { type: "object", required: ["name"], properties: { name: { type: "string" }, dry_run: { type: "boolean" }, size: { type: ["integer", "null"] } } },
      Unused: { type: "object" },
    },
  },
};

describe("buildManifest", () => {
  const m = buildManifest(mini, [{ type: "conflict", status: 409, title: "Conflict", explanation: "Wait." }]);
  const names = m.commands.map((c) => c.name.join(" "));
  test("includes token and public endpoints only", () => {
    expect(names.sort()).toEqual(["public ping", "things create", "things delete", "things list", "things wipe"]);
  });
  test("maps index/store/destroy to list/create/delete and drops {project}", () => {
    const del = m.commands.find((c) => c.operationId === "projects.things.destroy")!;
    expect(del.positionals.map((p) => p.name)).toEqual(["thing"]);
    expect(del.destructive).toBe(true);
  });
  test("destructive and costs-money come from the docs", () => {
    expect(m.commands.find((c) => c.name.join(" ") === "things wipe")!.destructive).toBe(true);
    expect(m.commands.find((c) => c.name.join(" ") === "things create")!.costsMoney).toBe(true);
  });
  test("body fields, nullable and reserved flags", () => {
    const f = m.commands.find((c) => c.name.join(" ") === "things create")!.body!.fields;
    expect(f.map((x) => x.flag)).toEqual(["name", "body-dry-run", "size"]);
    expect(f.find((x) => x.name === "size")!.nullable).toBe(true);
    expect(f.find((x) => x.name === "name")!.required).toBe(true);
  });
  test("pagination detected, schemas pruned, errors kept", () => {
    expect(m.commands.find((c) => c.name.join(" ") === "things list")!.paginated).toBe(true);
    expect(Object.keys(m.schemas).sort()).toEqual(["List", "Req", "Thing"]);
    expect(m.errors[0].type).toBe("conflict");
  });
  test("a command that is also a group gets a verb", () => {
    const spec = structuredClone(mini) as any;
    spec.paths["/projects/{project}/things/{thing}/rdns"] = {
      get: { operationId: "projects.things.rdns", summary: "rdns", security: [{ apiToken: [] }], responses: {} },
      put: { operationId: "projects.things.rdns.set", summary: "set", security: [{ apiToken: [] }], responses: {} },
    };
    const n = buildManifest(spec).commands.map((c) => c.name.join(" "));
    expect(n).toContain("things rdns get");
    expect(n).toContain("things rdns set");
  });
  test("toFlag", () => {
    expect(toFlag("filter[state]")).toBe("filter-state");
    expect(toFlag("tlds[]")).toBe("tlds");
    expect(toFlag("os_image_id")).toBe("os-image-id");
  });
  test("inlineSchema survives cycles", () => {
    const s = { A: { type: "object", properties: { self: { $ref: "#/components/schemas/A" } } } };
    expect(inlineSchema({ $ref: "#/components/schemas/A" }, s).properties.self).toEqual({ $ref: "A" });
  });
});

describe("generated manifest", () => {
  test("has the API's commands and errors", () => {
    expect(M.commands.length).toBeGreaterThan(200);
    expect(M.errors.length).toBeGreaterThan(50);
    expect(M.errors.every((e) => e.status && e.title)).toBe(true);
  });
  test("every command name is unique", () => {
    const k = M.commands.map((c) => c.name.join(" "));
    expect(new Set(k).size).toBe(k.length);
  });
});

describe("search", () => {
  const top = (q: string) => search(M.commands, q, 3).map((h) => h.command);
  test("finds the obvious command", () => {
    expect(top("reboot a server")[0]).toBe("ph24 vps power");
    expect(top("create kubernetes cluster")[0]).toBe("ph24 kubernetes clusters create");
    expect(top("list my domains")).toContain("ph24 domains list");
    expect(top("reverse dns of a vps")).toContain("ph24 vps rdns set");
  });
  test("empty query returns nothing", () => {
    expect(search(M.commands, "the a of")).toEqual([]);
  });
});
