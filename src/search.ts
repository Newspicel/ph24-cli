// Local command search: BM25-style ranking over each command's name, summary, tags, fields and description.
// Everything is indexed from the manifest; only generic English verbs are mapped by hand.
import type { Command } from "./manifest.ts";

const VERBS: Record<string, string[]> = {
  create: ["create", "add", "new", "make", "order", "store"],
  delete: ["delete", "remove", "destroy", "drop"],
  list: ["list", "index", "all", "show"],
  get: ["get", "show", "view", "read", "detail"],
  update: ["update", "change", "edit", "set", "modify", "rename"],
};
const SYN = new Map<string, string[]>();
for (const group of Object.values(VERBS)) for (const w of group) SYN.set(w, group);

const STOP = new Set(["a", "an", "the", "of", "to", "for", "my", "in", "on", "and", "or", "with", "from", "by", "is", "it", "me", "how", "do", "i", "can", "this", "that", "its", "be", "are", "as", "at"]);

export function words(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .flatMap((w) => (w.includes("-") ? [w, ...w.split("-")] : [w]))
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

function stem(w: string): string {
  if (w.length <= 3) return w;
  return w.replace(/ies$/, "y").replace(/(ses|xes)$/, (m) => m.slice(0, -2)).replace(/s$/, "").replace(/ing$/, "");
}

const FIELDS: [keyof Doc, number][] = [["name", 5], ["summary", 3], ["tags", 2.5], ["params", 1], ["description", 1]];
interface Doc { name: string[]; summary: string[]; tags: string[]; params: string[]; description: string[] }

function doc(c: Command): Doc {
  return {
    name: c.name.flatMap(words),
    summary: words(c.summary),
    tags: c.tags.flatMap(words),
    params: [...c.positionals, ...c.query, ...(c.body?.fields ?? [])].flatMap((p) => words(p.name)),
    description: words(c.description ?? ""),
  };
}

export interface SearchHit {
  command: string;
  summary: string;
  method: string;
  path: string;
  arguments: string[];
  destructive: boolean;
  costs_money: boolean;
  score: number;
}

export function search(commands: Command[], query: string, limit = 5): SearchHit[] {
  const terms = [...new Set(words(query))];
  if (!terms.length) return [];
  const docs = commands.map(doc);
  const all = docs.map((d) => new Set(Object.values(d).flat()));
  const idf = (t: string) => {
    const n = all.filter((s) => s.has(t)).length;
    return Math.log(1 + (commands.length - n + 0.5) / (n + 0.5));
  };
  const scored = commands.map((c, i) => {
    let score = 0;
    for (const t of terms) {
      const alts = [t, ...(SYN.get(t) ?? []).map(stem)];
      let best = 0;
      for (const a of alts) {
        const weight = a === t ? 1 : 0.7;
        for (const [field, w] of FIELDS) {
          const ws = docs[i][field];
          const tf = ws.filter((x) => x === a).length;
          if (!tf) continue;
          const s = idf(a) * w * weight * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * ws.length / 12));
          best = Math.max(best, s);
        }
      }
      score += best;
    }
    if (c.name[0] === "public" && !terms.includes("public")) score *= 0.8; // prefer the project variant
    return { c, score };
  });
  return scored
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score || a.c.name.length - b.c.name.length)
    .slice(0, limit)
    .map(({ c, score }) => ({
      command: "ph24 " + c.name.join(" "),
      summary: c.summary,
      method: c.method,
      path: c.path,
      arguments: c.positionals.map((p) => "<" + p.name + ">"),
      destructive: c.destructive,
      costs_money: c.costsMoney,
      score: Math.round(score * 10) / 10,
    }));
}
