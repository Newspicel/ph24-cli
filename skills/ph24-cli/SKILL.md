---
name: ph24-cli
description: The ph24 CLI for the ProHosting24 (ph24.io) API, generated from its OpenAPI spec. Use for anything on ph24 / ProHosting24 from the terminal — signing in with a project API token, finding commands with ph24 cli search, ph24 schema, and running its 296 API commands (cloud, vps, kubernetes, subscriptions, domains, webhostings, dns-zones, firewalls, ip-lists, catalog, handovers). Use whenever the user mentions ph24, ProHosting24 or their servers, domains or cloud there.
---

# ProHosting24 CLI (`ph24`)

`ph24` is a command-line interface for the ph24 API (`https://ph24.io/api/v1`). Its 296 API commands are generated from the OpenAPI spec (ph24 API 1.0.0): every endpoint that works with a project API token, plus the public catalogue endpoints. Account, organization, login and token management are customer-area only and are not in the CLI.

**Prefer retrieval over memory.** Describe the task to `ph24 cli search`, inspect the match with `ph24 schema` or `--help`, and preview with `--dry-run` before running a command you have not verified.

## FIRST: check installation and sign in

```bash
ph24 --version
ph24 auth whoami        # exit 3 = not logged in
```

- A token belongs to one project. Create it in the customer area under Project settings → API tokens, with only the abilities the task needs.
- `ph24 auth login` asks for the token and the project id (`prj_…`) and checks them. Non-interactive: `echo "$TOKEN" | ph24 auth login --with-token --project prj_…`. Never put the token in a command line that ends up in logs or transcripts, and never print it.
- Several projects → one profile each: `ph24 auth login --profile staging`, then `ph24 auth use staging` or `--profile staging` per command.
- CI and unattended agents: set `PH24_API_TOKEN` and `PH24_PROJECT` instead of logging in.
- If you need the user to log in, ask them to run `! ph24 auth login` themselves so the token never passes through you.

## Find commands

```bash
ph24 cli search "reboot a server"   # local, no credentials; up to 5 JSON matches
ph24 schema vps power               # method, path, arguments, flags, body and response schema
ph24 vps power --help               # usage, flags, ability, rate limit
ph24 cli commands                   # every command, one per line (grep it)
```

Commands follow the API paths: `/projects/{project}/vps/{vps}/power` is `ph24 vps power <vps>`. The project comes from the login, so you never pass it. `index`, `show`, `store` and `destroy` endpoints are called `list`, `get`, `create` and `delete`.

Command groups:

- `catalog` (2): Catalog
- `cloud` (119): Cloud volumes, Cloud certificates, Cloud, Cloud firewalls, Cloud networking, Cloud images, Cloud servers, Cloud load balancers
- `dns-zones` (7): DNS
- `domain-check` (1): Domains
- `domain-contacts` (1): Domains
- `domain-prices` (1): Domains
- `domains` (16): Domains, Mailboxes
- `firewalls` (7): Server firewalls
- `handovers` (2): Services
- `immediate-start` (1): Services
- `invoice-address` (1): Services
- `ip-lists` (5): Server firewalls
- `kubernetes` (27): Kubernetes
- `project` (1): Projects
- `public` (34): Public, Developers, Catalog, Cloud images, Account, Domains
- `realtime` (1): Projects
- `subscriptions` (19): Services
- `vps` (35): Servers, Server firewalls, Services
- `webhostings` (16): Webhosting

## Pass arguments

- Path ids are positional: `ph24 vps backups delete vps_… bkp_…`.
- Body and query fields are flags in kebab case: `ph24 vps power vps_… --action reboot`, `ph24 vps list --filter-state running`.
- Arrays: repeat the flag or pass JSON (`--tlds com --tlds de`, `--ssh-keys '["key_…"]'`). Objects take JSON. `null` clears nullable fields.
- Whole body: `--body '{"…": …}'`, `--body @file.json` or `--body -` (stdin); field flags override it.
- Endpoints that need an `Idempotency-Key` get a fresh UUID automatically. To retry one action safely, pass the same `--idempotency-key` again.
- Anything not covered: `ph24 api GET /projects/{project}/…` (`{project}` is filled in).

## Read output

- Results are JSON on stdout; messages and errors go to stderr, so `| jq` works directly.
- Lists return one page (`data` + `meta.next_cursor`); add `--all` to fetch every page as one array, or `--cursor` to page by hand.
- Many actions run in the background: they answer `202` with an `operation`. Poll the resource with its `get` command (for example `ph24 vps get vps_…`) until the operation is finished, instead of starting the action again.
- Money is `{"amount": 1290, "currency": "EUR"}` in cents. Dates are ISO 8601 UTC.

## Run commands safely

- **Preview first.** `--dry-run` prints the request without sending it and needs no credentials.
- **Destructive commands need `--force`.** 44 commands (every delete, and endpoints whose docs say data or access is lost, e.g. `vps reinstall`, `cloud servers rebuild`, `subscriptions end`) refuse to run without a terminal unless `--force` is given, and exit 2. Get the user's explicit go-ahead before adding `--force`.
- **Commands that cost money** are marked `costs_money` in `cli search` and `schema` (orders, cloud resources, renewals). Show the user the price (quote / price-preview commands) and confirm before running them.

## Errors

Errors are RFC 9457 problem documents. `ph24` prints the status, the error type, the title, the field errors and **how to fix it** (from the API's error catalogue) to stderr; extra members such as `price_token`, `fee_cents`, `needed` or `blockers` are printed too. Look up any type with `ph24 errors <type>`.

Exit codes: 0 ok · 1 other error · 2 usage (bad flags, missing --force) · 3 not logged in / 401 · 4 forbidden (403) · 5 not found (404) · 6 conflict (409) · 7 invalid request (400/413/422) · 8 rate limited (429, retried automatically for safe requests) · 9 server error (5xx).

- 400: `bad-request`
- 401: `unauthenticated`, `invalid-credentials`
- 403: `email-not-verified`, `sudo-required`, `session-required`, `two-factor-required`, `token-ip-not-allowed`, `invitation-email-mismatch`, `impersonation-blocked`, `account-locked`, `forbidden`, `organization-restricted`, `account-pending-deletion`, `account-moving`, `staff-ability-missing`, `handover-email-mismatch`
- 404: `not-found`
- 405: `method-not-allowed`
- 409: `conflict`, `operation-in-progress`, `service-suspended`, `service-locked`, `service-suspended-by-staff`, `already-member`, `last-owner`, `not-empty`, `price-changed`, `limit-reached`, `change-not-allowed`, `fee-not-confirmed`, `payment-status-unclear`, `export-limit`, `idempotency-in-progress`, `in-use`, `external-network-read-only`, `no-address-available`, `external-network-unreachable`, `address-not-held`, `already-assigned`, `vps-guest-agent-unavailable`, `vps-firewall-unmanaged`, `dpa-version-outdated`, `terms-acceptance-required`, `rule-exists`, `last-firewall`, `managed-firewall`, `managed-by-kubernetes`, `cloud-not-set-up`, `firewall-limit-reached`, `handover-not-pending`, `service-handover-pending`
- 410: `link-invalid`
- 413: `payload-too-large`
- 422: `validation-failed`, `not-orderable`, `legacy-plan-change-first`, `insufficient-credit`, `billing-profile-incomplete`, `verification-limit-reached`, `ssh-key-exists`, `credit-limit-reached`, `quota-exceeded`, `postpaid-not-possible`, `payment-method-unusable`, `prepayment-not-refundable`, `code-invalid`, `code-locked`, `voucher-limit-reached`, `deletion-blocked`, `idempotency-key-required`, `idempotency-conflict`, `next-hop-not-connected`, `next-hop-in-use`, `guest-agent-command-disabled`, `guest-agent-unavailable`, `guest-agent-timeout`, `affiliate-terms-required`, `captcha-failed`, `immediate-start-required`, `cloud-consent-required`, `certificate-invalid`, `flavor-not-offered`, `confirmation-required`
- 429: `rate-limited`
- 500: `server-error`
- 503: `provider-unavailable`, `service-unavailable`

Common fixes: `forbidden` → the token lacks the ability (`ph24 schema <cmd>` names it); `not-found` → wrong id or wrong project (`ph24 auth whoami`); `operation-in-progress` → wait for the running operation; `price-changed` / `fee-not-confirmed` → show the new amount and resend with the token or fee it returns, only after the user agrees.

## Keep it current

`ph24 cli refresh` downloads the latest OpenAPI spec and error catalogue and regenerates the commands locally (`--reset` goes back to the built-in ones). `ph24 skill install` rewrites this skill from the current commands.
