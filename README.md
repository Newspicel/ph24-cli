# ph24-cli

A command-line interface for the [ph24 / ProHosting24 API](https://ph24.io/docs/api), in the style of Cloudflare's `cf`, built for people and for coding agents like Claude Code.

Nearly everything is **generated from the API's own docs**:

- **Commands** come from the [OpenAPI spec](https://ph24.io/docs/api/openapi.json): every endpoint that works with a project API token (servers, cloud, Kubernetes, domains, DNS, webhosting, subscriptions…) plus the public catalogue. Paths become commands (`/projects/{project}/vps/{vps}/power` → `ph24 vps power <vps>`), request fields become flags, and enums, required fields and types are checked before sending.
- **Errors** come from the API's error catalogue (`GET /public/problem-types`). Every RFC 9457 problem is printed with its meaning, how to fix it, and a typed exit code.
- **Safety flags** come from the endpoint descriptions. Deletes and endpoints whose docs say data or access is lost need `--force`. Orders and billed resources are marked `costs_money`.
- **The Claude skill** (`skills/ph24-cli/SKILL.md`) and the **[command reference](docs/COMMANDS.md)** are rendered from the same manifest.

A scheduled GitHub Action regenerates all of it every day and commits when the API changed. `ph24 cli refresh` does the same locally, without a new release.

## Install

```bash
npm install -g github:newspicel/ph24-cli     # needs Node.js 22+
ph24 --version
```

From a clone: `bun install && bun run build && npm install -g .`

## Sign in

API tokens belong to one project. Create one in the customer area under **Project settings → API tokens**, with only the abilities you need.

```bash
ph24 auth login                          # asks for the token (hidden) and the project id, then checks them
echo "$TOKEN" | ph24 auth login --with-token --project prj_…   # non-interactive
ph24 auth whoami                         # profile, project, token abilities (exit 3 when not logged in)
ph24 auth login --profile staging        # one profile per project
ph24 auth use staging                    # switch the default profile
ph24 auth logout
```

Credentials are stored in `~/.config/ph24/config.json` (mode 0600). `PH24_API_TOKEN`, `PH24_PROJECT`, `PH24_PROFILE` and `PH24_API_URL` override them, for CI and agents.

## Use

```bash
ph24 cli search "reboot a server"        # find commands for a task (local, JSON)
ph24 schema vps power                    # method, path, flags, body + response schema
ph24 vps power --help

ph24 vps list --filter-state running
ph24 vps list --all                      # follow every page
ph24 vps power vps_… --action reboot
ph24 vps power vps_… --action reboot --dry-run      # print the request, send nothing
ph24 dns-zones records change zone_… --body @changes.json
ph24 vps reinstall vps_… --os-image-id osi_… --force   # destructive: needs --force
ph24 public vps os-images                # public endpoints need no login
ph24 api GET /projects/{project}/vps     # raw request; {project} is filled in
ph24 errors                              # all error types; ph24 errors <type> explains one
```

- Path ids are positional. Body and query fields are kebab-case flags (`os_image_id` → `--os-image-id`, `filter[state]` → `--filter-state`). Arrays take repeated flags or JSON, objects take JSON, and `null` clears nullable fields.
- `--body <json|@file|->` sends a whole body; field flags override it.
- Endpoints that need an `Idempotency-Key` get a fresh UUID; pass `--idempotency-key` to retry the same action safely.
- `429`/`503` are retried (honouring `Retry-After`) for GETs and idempotent requests.
- Output is JSON on stdout; messages and errors go to stderr.

### Exit codes

| Code | Meaning |
|---|---|
| 0 | OK |
| 1 | other error (network, …) |
| 2 | usage error, or a destructive command without `--force` |
| 3 | not logged in / 401 |
| 4 | forbidden (403): the token lacks the ability |
| 5 | not found (404) |
| 6 | conflict (409), e.g. `operation-in-progress` |
| 7 | invalid request (400/413/422) |
| 8 | rate limited (429) |
| 9 | server error (5xx) |

## Use with Claude Code

```bash
ph24 skill install        # writes ~/.claude/skills/ph24-cli/SKILL.md from the current commands
```

The skill tells Claude to check the login, find commands with `ph24 cli search`, inspect them with `ph24 schema`, preview with `--dry-run`, and ask before destructive or paid actions. It also covers how to read errors. Re-run it after `ph24 cli refresh`.

## Development

```bash
bun install
bun run generate          # spec + error catalogue → src/generated/manifest.json, skills/, docs/
bun test                  # unit tests + end-to-end tests against a mock API
bun run build             # dist/ph24.js (single file, runs on Node 22+)
bun run build:binary      # standalone binary via bun --compile
```

| File | What it does |
|---|---|
| `src/manifest.ts` | OpenAPI → command manifest (naming, flags, destructive/costs-money detection, schema pruning) |
| `src/cli.ts` | entry point: routing, auth, built-ins, output, error mapping |
| `src/build.ts` | flags → HTTP request (validation, coercion, idempotency) |
| `src/search.ts` | BM25 search over names, summaries, tags, fields and descriptions |
| `src/skill.ts`, `src/reference.ts` | render the Claude skill and the command reference |

Only the session-based customer-area endpoints (account, organizations, logins, tokens) are left out, because API tokens can't call them.
