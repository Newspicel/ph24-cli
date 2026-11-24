// HTTP client: auth header, retries on 429/503 for safe requests, RFC 9457 problems.

export interface RequestSpec {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface Response {
  status: number;
  contentType: string;
  headers: Headers;
  json?: any;
  text?: string;
  bytes?: Uint8Array;
}

export class ApiError extends Error {
  constructor(public status: number, public problem: any, public requestId?: string) {
    super(formatProblem(status, problem));
  }
}

export function formatProblem(status: number, p: any, fix?: string): string {
  if (!p || typeof p !== "object") return "HTTP " + status + (p ? ": " + String(p).slice(0, 500) : "");
  const kind = typeof p.type === "string" ? p.type.split("/").pop() : undefined;
  let s = "HTTP " + status + (kind ? " " + kind : "") + ": " + (p.title ?? "Request failed");
  if (p.detail && p.detail !== p.title) s += " — " + p.detail;
  for (const e of p.errors ?? []) s += "\n  " + e.field + ": " + e.message + (e.code ? " (" + e.code + ")" : "");
  if (fix) s += "\n  fix: " + fix;
  if (p.type) s += "\n  see " + p.type;
  if (p.request_id) s += "\n  request id: " + p.request_id;
  return s;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function send(req: RequestSpec, opts: { retry: boolean; verbose?: boolean; log?: (s: string) => void } = { retry: false }): Promise<Response> {
  const log = opts.log ?? ((s: string) => process.stderr.write(s + "\n"));
  for (let attempt = 0; ; attempt++) {
    if (opts.verbose) log("> " + req.method + " " + req.url);
    const res = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body === undefined ? undefined : JSON.stringify(req.body),
    });
    if ((res.status === 429 || res.status === 503) && opts.retry && attempt < 3) {
      const ra = Number(res.headers.get("retry-after"));
      const wait = Math.min(Number.isFinite(ra) && ra > 0 ? ra * 1000 : 2 ** attempt * 1000, 60_000);
      log("Rate limited (" + res.status + "), retrying in " + Math.round(wait / 1000) + "s…");
      await res.body?.cancel();
      await sleep(wait);
      continue;
    }
    if (opts.verbose) log("< " + res.status + " " + (res.headers.get("x-request-id") ?? ""));
    const contentType = res.headers.get("content-type") ?? "";
    const out: Response = { status: res.status, contentType, headers: res.headers };
    if (res.status === 204) return check(out);
    if (/json/.test(contentType)) {
      const t = await res.text();
      try { out.json = t ? JSON.parse(t) : undefined; } catch { out.text = t; }
    } else if (/^text\//.test(contentType)) {
      out.text = await res.text();
    } else {
      out.bytes = new Uint8Array(await res.arrayBuffer());
    }
    return check(out);
  }
}

function check(r: Response): Response {
  if (r.status >= 400) throw new ApiError(r.status, r.json ?? r.text, r.headers.get("x-request-id") ?? undefined);
  return r;
}
