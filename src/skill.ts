// Renders the Claude Code skill (SKILL.md) from the manifest, so it follows the API.
import type { Command, Manifest } from "./manifest.ts";

export function groups(m: Manifest): { name: string; count: number; topics: string[]; examples: string[] }[] {
  const by = new Map<string, Command[]>();
  for (const c of m.commands) {
    const k = c.name[0];
    if (!by.has(k)) by.set(k, []);
    by.get(k)!.push(c);
  }
  return [...by.entries()].map(([name, cs]) => {
    const topics = [...new Set(cs.map((c) => c.tags[0]).filter(Boolean))];
    return { name, count: cs.length, topics, examples: cs.slice(0, 3).map((c) => c.name.join(" ")) };
  });
}

export function renderSkill(m: Manifest): string {
  const gs = groups(m);
  const topicList = gs.filter((g) => g.count > 1 && g.name !== "public").sort((a, b) => b.count - a.count).map((g) => g.name).join(", ");
  const destructive = m.commands.filter((c) => c.destructive).length;
  const byStatus = new Map<number, string[]>();
  for (const e of m.errors) {
    if (!byStatus.has(e.status)) byStatus.set(e.status, []);
    byStatus.get(e.status)!.push(e.type);
  }
  return `---
name: ph24-cli
description: The ph24 CLI for the ProHosting24 (ph24.io) API, generated from its OpenAPI spec. Use for anything on ph24 / ProHosting24 from the terminal — signing in with a project API token, finding commands with ph24 cli search, ph24 schema, and running its ${m.commands.length} API commands (${topicList}). Use whenever the user mentions ph24, ProHosting24 or their servers, domains or cloud there.
---

# ProHosting24 CLI (\`ph24\`)

\`ph24\` is a command-line interface for the ph24 API (\`${m.serverUrl}\`). Its ${m.commands.length} API commands are generated from the OpenAPI spec (${m.title} ${m.specVersion}): every endpoint that works with a project API token, plus the public catalogue endpoints. Account, organization, login and token management are customer-area only and are not in the CLI.

**Prefer retrieval over memory.** Describe the task to \`ph24 cli search\`, inspect the match with \`ph24 schema\` or \`--help\`, and preview with \`--dry-run\` before running a command you have not verified.

## FIRST: check installation and sign in

\`\`\`bash
ph24 --version
ph24 auth whoami        # exit 3 = not logged in
\`\`\`

- A token belongs to one project. Create it in the customer area under Project settings → API tokens, with only the abilities the task needs.
- \`ph24 auth login\` asks for the token and the project id (\`prj_…\`) and checks them. Non-interactive: \`echo "$TOKEN" | ph24 auth login --with-token --project prj_…\`. Never put the token in a command line that ends up in logs or transcripts, and never print it.
- Several projects → one profile each: \`ph24 auth login --profile staging\`, then \`ph24 auth use staging\` or \`--profile staging\` per command.
- CI and unattended agents: set \`PH24_API_TOKEN\` and \`PH24_PROJECT\` instead of logging in.
- If you need the user to log in, ask them to run \`! ph24 auth login\` themselves so the token never passes through you.

## Find commands

\`\`\`bash
ph24 cli search "reboot a server"   # local, no credentials; up to 5 JSON matches
ph24 schema vps power               # method, path, arguments, flags, body and response schema
ph24 vps power --help               # usage, flags, ability, rate limit
ph24 cli commands                   # every command, one per line (grep it)
\`\`\`

Commands follow the API paths: \`/projects/{project}/vps/{vps}/power\` is \`ph24 vps power <vps>\`. The project comes from the login, so you never pass it. \`index\`, \`show\`, \`store\` and \`destroy\` endpoints are called \`list\`, \`get\`, \`create\` and \`delete\`.

Command groups:

${gs.map((g) => "- \`" + g.name + "\` (" + g.count + "): " + (g.topics.join(", ") || g.examples.join("; "))).join("\n")}

## Pass arguments

- Path ids are positional: \`ph24 vps backups delete vps_… bkp_…\`.
- Body and query fields are flags in kebab case: \`ph24 vps power vps_… --action reboot\`, \`ph24 vps list --filter-state running\`.
- Arrays: repeat the flag or pass JSON (\`--tlds com --tlds de\`, \`--ssh-keys '["key_…"]'\`). Objects take JSON. \`null\` clears nullable fields.
- Whole body: \`--body '{"…": …}'\`, \`--body @file.json\` or \`--body -\` (stdin); field flags override it.
- Endpoints that need an \`Idempotency-Key\` get a fresh UUID automatically. To retry one action safely, pass the same \`--idempotency-key\` again.
- Anything not covered: \`ph24 api GET /projects/{project}/…\` (\`{project}\` is filled in).

## Read output

- Results are JSON on stdout; messages and errors go to stderr, so \`| jq\` works directly.
- Lists return one page (\`data\` + \`meta.next_cursor\`); add \`--all\` to fetch every page as one array, or \`--cursor\` to page by hand.
- Many actions run in the background: they answer \`202\` with an \`operation\`. Poll the resource with its \`get\` command (for example \`ph24 vps get vps_…\`) until the operation is finished, instead of starting the action again.
- Money is \`{"amount": 1290, "currency": "EUR"}\` in cents. Dates are ISO 8601 UTC.

## Run commands safely

- **Preview first.** \`--dry-run\` prints the request without sending it and needs no credentials.
- **Destructive commands need \`--force\`.** ${destructive} commands (every delete, and endpoints whose docs say data or access is lost, e.g. \`vps reinstall\`, \`cloud servers rebuild\`, \`subscriptions end\`) refuse to run without a terminal unless \`--force\` is given, and exit 2. Get the user's explicit go-ahead before adding \`--force\`.
- **Commands that cost money** are marked \`costs_money\` in \`cli search\` and \`schema\` (orders, cloud resources, renewals). Show the user the price (quote / price-preview commands) and confirm before running them.

## Errors

Errors are RFC 9457 problem documents. \`ph24\` prints the status, the error type, the title, the field errors and **how to fix it** (from the API's error catalogue) to stderr; extra members such as \`price_token\`, \`fee_cents\`, \`needed\` or \`blockers\` are printed too. Look up any type with \`ph24 errors <type>\`.

Exit codes: 0 ok · 1 other error · 2 usage (bad flags, missing --force) · 3 not logged in / 401 · 4 forbidden (403) · 5 not found (404) · 6 conflict (409) · 7 invalid request (400/413/422) · 8 rate limited (429, retried automatically for safe requests) · 9 server error (5xx).

${[...byStatus.entries()].sort((a, b) => a[0] - b[0]).map(([s, ts]) => "- " + s + ": " + ts.map((t) => "\`" + t + "\`").join(", ")).join("\n")}

Common fixes: \`forbidden\` → the token lacks the ability (\`ph24 schema <cmd>\` names it); \`not-found\` → wrong id or wrong project (\`ph24 auth whoami\`); \`operation-in-progress\` → wait for the running operation; \`price-changed\` / \`fee-not-confirmed\` → show the new amount and resend with the token or fee it returns, only after the user agrees.

## Keep it current

\`ph24 cli refresh\` downloads the latest OpenAPI spec and error catalogue and regenerates the commands locally (\`--reset\` goes back to the built-in ones). \`ph24 skill install\` rewrites this skill from the current commands.
`;
}
