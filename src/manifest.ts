// Turns the ph24 OpenAPI document into the compact command manifest the CLI runs from.
// Used by scripts/generate.ts (build time) and `ph24 cli refresh` (runtime).

export type JsonSchema = Record<string, any>;

export interface Param {
  name: string; // API name, e.g. "filter[state]"
  flag: string; // CLI flag without dashes, e.g. "filter-state"
  description?: string;
  required: boolean;
  schema: JsonSchema;
}

export interface BodyField extends Param {
  nullable: boolean;
}

export interface Command {
  name: string[]; // e.g. ["vps", "power"]
  operationId: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
  auth: "token" | "none";
  ability?: string;
  stability?: string;
  rateLimit?: { limiter?: string; per_minute?: number };
  sudo?: boolean;
  positionals: Param[]; // path params except {project}, in path order
  query: Param[];
  body?: { required: boolean; schema: JsonSchema; fields: BodyField[] };
  idempotency?: "required" | "optional";
  destructive: boolean;
  costsMoney: boolean;
  tags: string[];
  response?: JsonSchema;
  paginated: boolean;
}

export interface ProblemType {
  type: string; // e.g. "validation-failed"
  status: number;
  title: string;
  explanation?: string;
}

export interface Manifest {
  generatedAt: string;
  specVersion: string;
  title: string;
  serverUrl: string;
  commands: Command[];
  schemas: Record<string, JsonSchema>; // components referenced by commands
  errors: ProblemType[]; // from GET /public/problem-types (falls back to the spec's Problem.type enum)
}

export const SPEC_URL = "https://ph24.io/docs/api/openapi.json";

// Fetches the spec and the error catalogue and builds a manifest.
export async function fetchManifest(specUrl = SPEC_URL, apiUrl?: string): Promise<Manifest> {
  const res = await fetch(specUrl);
  if (!res.ok) throw new Error("GET " + specUrl + " answered " + res.status);
  const spec = await res.json();
  const base = (apiUrl ?? spec.servers?.[0]?.url ?? "https://ph24.io/api/v1").replace(/\/+$/, "");
  let problems: ProblemType[] | undefined;
  try {
    const p = await fetch(base + "/public/problem-types");
    if (p.ok) problems = (await p.json()).data;
  } catch {}
  return buildManifest(spec, problems);
}

// The CLI owns these flags, so an API field with the same name gets a "body-"/"query-" prefix.
export const RESERVED_FLAGS = new Set([
  "project", "profile", "force", "dry-run", "all", "output", "body", "help", "idempotency-key",
  "api-url", "token", "verbose", "raw",
]);

const VERB: Record<string, string> = { index: "list", show: "get", store: "create", destroy: "delete" };

// Destructive = DELETE, or the endpoint's own description says data or access goes away for good.
const DESTRUCTIVE_TEXT = /\b(is|are) lost\b|replaces everything|gone for good|can(no|'|’)t (go back|be undone)|cannot be undone|irreversib|stops? working|is released|ends immediately|(?<!never )\bremoves the\b|\b(wipes?|erases?)\b|overwrites (the|its|everything)/i;
// Costs money = the description talks about charges, or the error docs' rule applies: an Idempotency-Key is
// required because the endpoint "can cost money or create resources".
const MONEY_TEXT = /\b(charged|billed|price|costs?|fee)\b/i;

export function toFlag(name: string): string {
  return name.replace(/\[\]$/, "").replace(/\[([^\]]+)\]/g, "-$1").replace(/[_.]/g, "-").toLowerCase();
}

function includeOp(op: any): "token" | "none" | null {
  if (op["x-session-only"]) return null;
  if (op.security?.some((s: any) => "apiToken" in s)) return "token";
  if (typeof op.operationId === "string" && op.operationId.startsWith("public.")) return "none";
  return null;
}

function commandName(opId: string): string[] {
  if (opId === "projects.show") return ["project", "get"];
  const parts = opId.split(".");
  if (parts[0] === "projects") parts.shift();
  const last = parts.length - 1;
  if (VERB[parts[last]]) parts[last] = VERB[parts[last]];
  return parts;
}

export function buildManifest(spec: any, problemTypes?: ProblemType[]): Manifest {
  const schemas = spec.components?.schemas ?? {};
  const resolve = (s: any): any => {
    let guard = 0;
    while (s && s.$ref && guard++ < 20) s = schemas[s.$ref.split("/").pop()];
    return s ?? {};
  };

  const commands: Command[] = [];
  for (const [path, item] of Object.entries<any>(spec.paths ?? {})) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const op = item[method];
      if (!op) continue;
      const auth = includeOp(op);
      if (!auth) continue;
      const params: any[] = [...(item.parameters ?? []), ...(op.parameters ?? [])].map(resolve);

      const order = [...path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      const positionals: Param[] = order
        .filter((n) => !(auth === "token" && n === "project"))
        .map((n) => {
          const p = params.find((x) => x.in === "path" && x.name === n) ?? {};
          return { name: n, flag: toFlag(n), description: p.description, required: true, schema: p.schema ?? { type: "string" } };
        });

      const used = new Set<string>();
      const query: Param[] = params
        .filter((p) => p.in === "query")
        .map((p) => {
          let flag = toFlag(p.name);
          if (RESERVED_FLAGS.has(flag)) flag = "query-" + flag;
          used.add(flag);
          return { name: p.name, flag, description: p.description, required: !!p.required, schema: p.schema ?? {} };
        });

      const idem = params.find((p) => p.in === "header" && p.name === "Idempotency-Key");

      let body: Command["body"];
      const bodySchema = op.requestBody?.content?.["application/json"]?.schema;
      if (bodySchema) {
        const r = resolve(bodySchema);
        const req = new Set<string>(r.required ?? []);
        const fields: BodyField[] = Object.entries<any>(r.properties ?? {}).map(([name, raw]) => {
          const s = resolve(raw);
          let flag = toFlag(name);
          if (RESERVED_FLAGS.has(flag) || used.has(flag)) flag = "body-" + flag;
          const types = Array.isArray(s.type) ? s.type : [s.type];
          return { name, flag, description: s.description ?? raw.description, required: req.has(name), nullable: types.includes("null") || s.nullable === true, schema: raw };
        });
        body = { required: !!op.requestBody.required, schema: bodySchema, fields };
      }

      const name = commandName(op.operationId);
      const ok = Object.entries<any>(op.responses ?? {}).find(([c]) => c.startsWith("2"));
      const response = ok?.[1]?.content?.["application/json"]?.schema;
      const respResolved = resolve(response);
      commands.push({
        name,
        operationId: op.operationId,
        method: method.toUpperCase(),
        path,
        summary: op.summary ?? "",
        description: op.description,
        auth,
        ability: op["x-ability"],
        stability: op["x-stability-level"],
        rateLimit: op["x-ratelimit"],
        sudo: op["x-sudo"] || undefined,
        positionals,
        query,
        body,
        idempotency: idem ? (idem.required ? "required" : "optional") : undefined,
        destructive: method === "delete" || DESTRUCTIVE_TEXT.test(op.description ?? ""),
        costsMoney: method !== "get" && (op["x-ability"] === "services.order" || MONEY_TEXT.test(op.description ?? "") || !!idem?.required),
        tags: op.tags ?? [],
        response,
        paginated: query.some((q) => q.name === "cursor") && !!respResolved?.properties?.meta,
      });
    }
  }

  // A command whose name is also a group prefix (e.g. "vps rdns" and "vps rdns set") gets a verb.
  const key = (n: string[]) => n.join(" ");
  const names = new Set(commands.map((c) => key(c.name)));
  for (const c of commands) {
    const isPrefix = commands.some((o) => o !== c && o.name.length > c.name.length && key(o.name.slice(0, c.name.length)) === key(c.name));
    if (isPrefix) {
      const verb = c.method === "GET" ? "get" : c.method === "DELETE" ? "delete" : "run";
      let n = [...c.name, verb];
      if (names.has(key(n))) n = [...c.name, c.method.toLowerCase()];
      c.name = n;
    }
  }
  const seen = new Map<string, string>();
  for (const c of commands) {
    const k = key(c.name);
    if (seen.has(k)) throw new Error(`command name clash: "${k}" for ${seen.get(k)} and ${c.operationId}`);
    seen.set(k, c.operationId);
  }
  commands.sort((a, b) => key(a.name).localeCompare(key(b.name)));

  // Keep only the component schemas the commands reach.
  const keep: Record<string, JsonSchema> = {};
  const visit = (s: any) => {
    if (!s || typeof s !== "object") return;
    if (Array.isArray(s)) return s.forEach(visit);
    if (typeof s.$ref === "string") {
      const n = s.$ref.split("/").pop();
      if (!keep[n] && schemas[n]) { keep[n] = schemas[n]; visit(schemas[n]); }
    }
    for (const v of Object.values(s)) visit(v);
  };
  for (const c of commands) { visit(c.body?.schema); visit(c.response); c.positionals.forEach((p) => visit(p.schema)); c.query.forEach((p) => visit(p.schema)); }

  return {
    generatedAt: new Date().toISOString(),
    specVersion: spec.info?.version ?? "",
    title: spec.info?.title ?? "",
    serverUrl: spec.servers?.[0]?.url ?? "https://ph24.io/api/v1",
    commands,
    schemas: keep,
    errors: problemTypes?.length
      ? problemTypes.map((p) => ({ type: p.type, status: p.status, title: p.title, explanation: p.explanation }))
      : (schemas.Problem?.properties?.type?.["x-extensible-enum"] ?? []).map((u: string) => ({ type: u.split("/").pop()!, status: 0, title: "" })),
  };
}

// Inline $refs for display (cycle-safe, depth-limited).
export function inlineSchema(s: any, schemas: Record<string, any>, depth = 8, stack: string[] = []): any {
  if (!s || typeof s !== "object") return s;
  if (Array.isArray(s)) return s.map((x) => inlineSchema(x, schemas, depth, stack));
  if (typeof s.$ref === "string") {
    const n = s.$ref.split("/").pop()!;
    if (stack.includes(n) || depth <= 0) return { $ref: n };
    return inlineSchema(schemas[n] ?? {}, schemas, depth - 1, [...stack, n]);
  }
  const out: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "title") continue;
    out[k] = inlineSchema(v, schemas, depth, stack);
  }
  return out;
}
