# ph24 command reference

Generated from the [ph24 OpenAPI spec](https://ph24.io/docs/api/openapi.json) (ph24 API 1.0.0). Do not edit: run `bun run generate`.

296 commands. ⚠ = destructive (needs `--force`), 💶 = may cost money.

## catalog

### `ph24 catalog plan-group`

Show a plan group with your prices. `GET /projects/{project}/catalog/plan-group` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--slug` | string | required | The plan group, e.g. from `/offers/{slug}`. |
| `--campaign-token` | string |  | The private link token of the campaign segment the group belongs to (S-098). |

### `ph24 catalog plans`

List a product's plans with your prices. `GET /projects/{project}/catalog/plans` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--product` | string | required | The product key, e.g. `vps`. |

## cloud

### `ph24 cloud backups delete <backup>` ⚠

Delete a volume backup. `DELETE /projects/{project}/cloud/backups/{backup}` · ability `cloud.manage` · beta

### `ph24 cloud backups list`

List the volume backups of a project. `GET /projects/{project}/cloud/backups` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `created`, `-created` (default), `name`, `-name`. |
| `--q` | string |  | Part of the name or of the volume's name. |

### `ph24 cloud backups restore <backup>` 💶

Restore a volume backup. `POST /projects/{project}/cloud/backups/{backup}/restore` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--availability-zone` | string |  | A volume availability zone of the location; default: OpenStack chooses. |
| `--name` | string | required | The new volume's name (hostname rules). |
| `--price-token` | string |  | The `price_token` of the price preview the dialog showed (`POST …/cloud/price-preview`): when the price changed since, the request is refused with `price-changed` and the new price. Optional for API c |
| `--size-gb` | integer |  | Whole GB, at least the backup's size (default: the backup's size), at most 10240. |
| `--volume-type` | string | required | A volume type of the backup's location. |

### `ph24 cloud backups update <backup>`

Rename or protect a volume backup. `PATCH /projects/{project}/cloud/backups/{backup}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string |  | Hostname rules: `a-z`, `0-9`, `-`, 1–63 characters. |
| `--protected` | boolean |  | A protected backup is never pruned by the schedule. |

### `ph24 cloud certificates create` 💶

Upload a certificate. `POST /projects/{project}/cloud/certificates` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--certificate` | string | required | The certificate (PEM), at most 64 KB. |
| `--chain` | string |  | Intermediate certificates (PEM), each signing the one before. |
| `--name` | string | required | Plain text, 1–255. |
| `--private-key` | string | required | The unencrypted private key (PEM): RSA ≥ 2048 bit or ECDSA P-256/P-384. Never stored by ph24 outside the cloud's key store. |

### `ph24 cloud certificates delete <certificate>` ⚠ 💶

Delete a certificate. `DELETE /projects/{project}/cloud/certificates/{certificate}` · ability `cloud.manage` · beta

### `ph24 cloud certificates get <certificate>`

Get a certificate. `GET /projects/{project}/cloud/certificates/{certificate}` · ability `cloud.view` · beta

### `ph24 cloud certificates letsencrypt` 💶

Get a certificate from Let's Encrypt. `POST /projects/{project}/cloud/certificates/letsencrypt` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--domains` | string[] | required | 1–100 names (`*.` allowed), each in a DNS zone of the organization at ph24 or behind a CNAME to ph24 (see `domains[].cname`). |
| `--name` | string | required |  |

### `ph24 cloud certificates list`

List the certificates of a project. `GET /projects/{project}/cloud/certificates` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `name` (default), `expires` or `created`, `-` in front for descending. |
| `--filter-name` | string |  | Part of the name. |

### `ph24 cloud consent create`

Activate the cloud for the project. `POST /projects/{project}/cloud/consent` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--immediate-start` | boolean |  | Consumers only (`consumer: true`): `true` asks for the cloud services to start at once, as the `immediate_start` text says. Businesses leave it out. |
| `--text-version` | string | required | The `version` of the texts shown (`GET /projects/{project}/cloud/consent`). |

### `ph24 cloud consent get`

Get the project's cloud terms. `GET /projects/{project}/cloud/consent` · ability `cloud.view` · beta

### `ph24 cloud costs`

Show the project's cloud costs this month. `GET /projects/{project}/cloud/costs` · ability `cloud.view` · beta

### `ph24 cloud credentials list`

List application credentials. `GET /projects/{project}/cloud/credentials` · ability `cloud.view` · beta

### `ph24 cloud firewalls create` 💶

Create a firewall. `POST /projects/{project}/cloud/firewalls` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  | Plain text, up to 255 characters. |
| `--name` | string | required | Plain text, 1–255 characters, not `default`. |

### `ph24 cloud firewalls delete <firewall>` ⚠ 💶

Delete a firewall. `DELETE /projects/{project}/cloud/firewalls/{firewall}` · ability `cloud.manage` · beta

### `ph24 cloud firewalls get <firewall>`

Get a cloud firewall. `GET /projects/{project}/cloud/firewalls/{firewall}` · ability `cloud.view` · beta

### `ph24 cloud firewalls list`

List the firewalls of a project. `GET /projects/{project}/cloud/firewalls` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `name` (default) or `created`, `-` in front for descending. |
| `--filter-name` | string |  | Part of the name. |
| `--filter-kind` | string |  | `default`, `custom` or `managed`. |

### `ph24 cloud firewalls rules create <firewall>` 💶

Add a rule. `POST /projects/{project}/cloud/firewalls/{firewall}/rules` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  | Plain text, up to 255 characters. |
| `--direction` | inbound\|outbound | required | `inbound` or `outbound`. |
| `--icmp-code` | integer |  | ICMP code 0–255, only with a type. |
| `--icmp-type` | integer |  | ICMP/IPv6-ICMP type 0–255; empty = any. |
| `--ip-version` | ipv4\|ipv6 | required | `ipv4` or `ipv6`. |
| `--port-max` | integer |  | Last port; empty = only `port_min`. |
| `--port-min` | integer |  | First port (1–65535) for TCP, UDP, DCCP, SCTP, UDP-Lite; empty = all ports. |
| `--protocol` | string | required | `any`, `tcp`, `udp`, `icmp` (IPv4), `ipv6-icmp` (IPv6) or a protocol number 0–255. |
| `--remote-cidr` | string |  | An address range of the rule's IP version (`203.0.113.0/24`, `2001:db8::/48`), or `any` (the default). |
| `--remote-firewall` | string |  | Instead of a range: another firewall of the project (`fwl_…`): its servers. |

### `ph24 cloud firewalls rules delete <firewall> <rule>` ⚠ 💶

Delete a rule. `DELETE /projects/{project}/cloud/firewalls/{firewall}/rules/{rule}` · ability `cloud.manage` · beta

### `ph24 cloud firewalls rules update <firewall> <rule>` 💶

Change a rule. `PUT /projects/{project}/cloud/firewalls/{firewall}/rules/{rule}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  | Plain text, up to 255 characters. |
| `--direction` | inbound\|outbound | required | `inbound` or `outbound`. |
| `--icmp-code` | integer |  | ICMP code 0–255, only with a type. |
| `--icmp-type` | integer |  | ICMP/IPv6-ICMP type 0–255; empty = any. |
| `--ip-version` | ipv4\|ipv6 | required | `ipv4` or `ipv6`. |
| `--port-max` | integer |  | Last port; empty = only `port_min`. |
| `--port-min` | integer |  | First port (1–65535) for TCP, UDP, DCCP, SCTP, UDP-Lite; empty = all ports. |
| `--protocol` | string | required | `any`, `tcp`, `udp`, `icmp` (IPv4), `ipv6-icmp` (IPv6) or a protocol number 0–255. |
| `--remote-cidr` | string |  | An address range of the rule's IP version (`203.0.113.0/24`, `2001:db8::/48`), or `any` (the default). |
| `--remote-firewall` | string |  | Instead of a range: another firewall of the project (`fwl_…`): its servers. |

### `ph24 cloud firewalls update <firewall>` 💶

Rename a firewall or change its description. `PATCH /projects/{project}/cloud/firewalls/{firewall}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  | Plain text, up to 255 characters; empty clears it. |
| `--name` | string |  | Plain text, 1–255 characters, not `default`. The default firewall keeps its name. |

### `ph24 cloud floating-ips attach <floating_ip>`

Attach to a server port (`202`). `POST /projects/{project}/cloud/floating-ips/{floating_ip}/attach` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--port` | string | required | `prt_…` of a server in a private network of the project |

### `ph24 cloud floating-ips create` 💶

Create a floating IP. `POST /projects/{project}/cloud/floating-ips` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string |  | `clo_…`: optional; when sent, the project's location. |

### `ph24 cloud floating-ips delete <floating_ip>` ⚠

Release a floating IP. `DELETE /projects/{project}/cloud/floating-ips/{floating_ip}` · ability `cloud.manage` · beta

### `ph24 cloud floating-ips detach <floating_ip>` 💶

Detach a floating IP. `POST /projects/{project}/cloud/floating-ips/{floating_ip}/detach` · ability `cloud.manage` · beta

### `ph24 cloud floating-ips get <floating_ip>`

Get a floating IP. `GET /projects/{project}/cloud/floating-ips/{floating_ip}` · ability `cloud.view` · beta

### `ph24 cloud floating-ips list`

List floating IPs. `GET /projects/{project}/cloud/floating-ips` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 cloud get`

Show the project's cloud. `GET /projects/{project}/cloud` · ability `cloud.view` · beta

### `ph24 cloud images create` 💶

Import an own image from a URL. `POST /projects/{project}/cloud/images` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--disk-format` | qcow2\|raw\|iso | required | `qcow2`, `raw` or `iso`. |
| `--location-id` | string | required | The cloud location (`clo_…`) the image is imported into. |
| `--name` | string | required | Plain text, 1–255 characters. |
| `--size-gb` | integer | required | The image's size in GB, rounded up; at most 50. The real size is checked again after the import. |
| `--source-url` | string | required | A direct, public `https:` download link (port 443 or 80, no share page) OpenStack downloads the image from (no upload through the API). Kept only until the import ended. |

### `ph24 cloud images delete <image>` ⚠

Delete an own image. `DELETE /projects/{project}/cloud/images/{image}` · ability `cloud.manage` · beta

### `ph24 cloud images list`

List the images of a project. `GET /projects/{project}/cloud/images` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `name` (default), `-name`, `created` or `-created`. |
| `--filter-location` | string |  | Only images of this location (`clo_…`). |
| `--filter-own` | string |  | `true`: only the project's own images. |

### `ph24 cloud images update <image>`

Rename an own image. `PATCH /projects/{project}/cloud/images/{image}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Servers: `a-z`, `0-9`, `-`, 1–63 characters. Images and snapshots: plain text, 1–255 characters. |

### `ph24 cloud keypairs list`

List the project's Nova key pairs. `GET /projects/{project}/cloud/keypairs` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string | required | The cloud location (`clo_…`). |

### `ph24 cloud live list`

List everything of one kind in the project's cloud. `GET /projects/{project}/cloud/live` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--kind` | servers\|volumes\|volume_snapshots\|volume_backups\|images\|networks\|subnets\|routers\|floating_ips\|ports\|firewalls\|load_balancers\|certificates | required | Which objects to list. |
| `--limit` | integer |  | Page size, 1–100 (default 100). |
| `--after` | string |  | `next_after` of the previous page. |

### `ph24 cloud load-balancer-flavors`

List the load balancer sizes and availability zones. `GET /projects/{project}/cloud/load-balancer-flavors` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string |  | Only for a project without cloud yet: the location (`clo_…`) the first load balancer goes to. |

### `ph24 cloud load-balancers create` 💶

Create a load balancer. `POST /projects/{project}/cloud/load-balancers` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--availability-zone` | string |  | Empty = Octavia's default. |
| `--description` | string |  |  |
| `--flavor` | string | required | An offered size (`GET …/load-balancer-flavors`). |
| `--listeners` | json[] | required | 1–10 listeners, each with its default pool. |
| `--location-id` | string |  | The cloud location (`clo_…`): optional; when sent, the location the project's cloud was set up in. |
| `--name` | string | required | Plain text, 1–255. |
| `--vip-subnet` | string |  | `sbn_…`: a private VIP on this subnet (attach a floating IP to its port for public access); empty = a public IPv4 on the location's external network. |

### `ph24 cloud load-balancers delete <lb>` ⚠ 💶

Delete a load balancer. `DELETE /projects/{project}/cloud/load-balancers/{lb}` · ability `cloud.manage` · beta

### `ph24 cloud load-balancers get <lb>`

Get a load balancer. `GET /projects/{project}/cloud/load-balancers/{lb}` · ability `cloud.view` · beta

### `ph24 cloud load-balancers health-monitor delete <lb> <pool>` ⚠ 💶

Remove a pool's health monitor. `DELETE /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}/health-monitor` · ability `cloud.manage` · beta

### `ph24 cloud load-balancers health-monitor update <lb> <pool>` 💶

Set a pool's health monitor. `PUT /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}/health-monitor` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--delay` | integer |  | Seconds, default 60. |
| `--expected-codes` | string |  | HTTP(S): default `200`; `200-299` or `200,201`. |
| `--http-method` | string |  | HTTP(S): default `GET`. |
| `--max-retries` | integer |  | Successful checks (1–10, default 1) before a member counts as up. |
| `--max-retries-down` | integer |  | Failed checks (1–10, default 1) before a member counts as down. |
| `--timeout` | integer |  | Seconds, default 30. |
| `--type` | string |  | `HTTP`, `HTTPS`, `PING`, `TCP`; UDP pools also `UDP-CONNECT`. |
| `--url-path` | string |  | HTTP(S): default `/`. |

### `ph24 cloud load-balancers list`

List the load balancers of a project. `GET /projects/{project}/cloud/load-balancers` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--filter-name` | string |  | Part of the name. |

### `ph24 cloud load-balancers listeners create <lb>` 💶

Add a listener. `POST /projects/{project}/cloud/load-balancers/{lb}/listeners` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--allowed-cidrs` | string[] |  | Only these ranges may connect; empty = any (clears it). |
| `--certificate` | string |  | `crt_…` for TERMINATED_HTTPS; null removes it. |
| `--connection-limit` | integer |  | -1 = unlimited (default). |
| `--default-pool` | string |  | `lbp_…` of this load balancer. |
| `--name` | string |  |  |
| `--port` | integer | required | 1–65535; can't change later. |
| `--protocol` | string | required | `HTTP`, `HTTPS` (passed through), `TCP`, `UDP` or `TERMINATED_HTTPS`; can't change later. |

### `ph24 cloud load-balancers listeners delete <lb> <listener>` ⚠ 💶

Remove a listener. `DELETE /projects/{project}/cloud/load-balancers/{lb}/listeners/{listener}` · ability `cloud.manage` · beta

### `ph24 cloud load-balancers listeners update <lb> <listener>` 💶

Change a listener. `PATCH /projects/{project}/cloud/load-balancers/{lb}/listeners/{listener}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--allowed-cidrs` | string[] |  | Only these ranges may connect; empty = any (clears it). |
| `--certificate` | string |  | `crt_…` for TERMINATED_HTTPS; null removes it. |
| `--connection-limit` | integer |  | -1 = unlimited (default). |
| `--default-pool` | string |  | `lbp_…` of this load balancer; null removes it. |
| `--name` | string |  |  |

### `ph24 cloud load-balancers members create <lb> <pool>` 💶

Add a pool member. `POST /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}/members` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--address` | string | required | An IPv4 or IPv6 address (a project server's or any reachable one). |
| `--name` | string |  |  |
| `--port` | integer | required | The member's port, 1–65535. |
| `--subnet` | string |  | `sbn_…` of the project: reached through that private subnet; empty = an external member. |
| `--weight` | integer |  | 0–256 (default 1). |

### `ph24 cloud load-balancers members delete <lb> <pool> <member>` ⚠ 💶

Remove a pool member. `DELETE /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}/members/{member}` · ability `cloud.manage` · beta

### `ph24 cloud load-balancers members update <lb> <pool> <member>` 💶

Change a pool member. `PATCH /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}/members/{member}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string |  |  |
| `--weight` | integer |  | 0–256. |

### `ph24 cloud load-balancers pools create <lb>` 💶

Add a pool. `POST /projects/{project}/cloud/load-balancers/{lb}/pools` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--algorithm` | string |  | `ROUND_ROBIN` (default), `LEAST_CONNECTIONS` or `SOURCE_IP`. |
| `--health-monitor` | json |  | Checks the members; null or missing = none. |
| `--members` | json[] |  | The backends to start with (up to 50); more can be added later. |
| `--name` | string |  |  |
| `--protocol` | string | required | `HTTP`, `HTTPS`, `TCP`, `UDP`, `PROXY` or `PROXYV2` (Octavia's compatibility matrix applies). |
| `--session-persistence` | json |  | `{type: SOURCE_IP\|HTTP_COOKIE\|APP_COOKIE, cookie_name?}`; null clears it. |

### `ph24 cloud load-balancers pools delete <lb> <pool>` ⚠ 💶

Remove a pool. `DELETE /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}` · ability `cloud.manage` · beta

### `ph24 cloud load-balancers pools update <lb> <pool>` 💶

Change a pool. `PATCH /projects/{project}/cloud/load-balancers/{lb}/pools/{pool}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--algorithm` | string |  | `ROUND_ROBIN` (default), `LEAST_CONNECTIONS` or `SOURCE_IP`. |
| `--name` | string |  |  |
| `--session-persistence` | json |  | `{type: SOURCE_IP\|HTTP_COOKIE\|APP_COOKIE, cookie_name?}`; null clears it. |

### `ph24 cloud load-balancers update <lb>` 💶

Change a load balancer. `PATCH /projects/{project}/cloud/load-balancers/{lb}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  |  |
| `--name` | string |  |  |

### `ph24 cloud networks create` 💶

Create a private network. `POST /projects/{project}/cloud/networks` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string |  | `clo_…`: optional; when sent, the project's location. |
| `--name` | string | required | Plain text, up to 255 characters. |

### `ph24 cloud networks delete <network>` ⚠

Delete a private network (`202`). `DELETE /projects/{project}/cloud/networks/{network}` · ability `cloud.manage` · beta

### `ph24 cloud networks get <network>`

Get a private network. `GET /projects/{project}/cloud/networks/{network}` · ability `cloud.view` · beta

### `ph24 cloud networks list`

List the project's private networks. `GET /projects/{project}/cloud/networks` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 cloud networks update <network>`

Rename a private network. `PATCH /projects/{project}/cloud/networks/{network}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Plain text, up to 255 characters. |

### `ph24 cloud operations dismiss <operation>`

Dismiss a failed cloud operation. `POST /projects/{project}/cloud/operations/{operation}/dismiss` · ability `cloud.manage` · beta

### `ph24 cloud operations dismiss-failed`

Dismiss every failed cloud operation. `POST /projects/{project}/cloud/operations/dismiss-failed` · ability `cloud.manage` · beta

### `ph24 cloud operations get <operation>`

Show a cloud operation. `GET /projects/{project}/cloud/operations/{operation}` · ability `cloud.view` · beta

### `ph24 cloud overview`

Show the project's cloud overview. `GET /projects/{project}/cloud/overview` · ability `cloud.view` · beta

### `ph24 cloud ports ipv6-net create <server> <port>`

Assign a routed IPv6 /64 to a server port. `POST /projects/{project}/cloud/servers/{server}/ports/{port}/ipv6-net` · ability `cloud.manage` · beta

### `ph24 cloud ports ipv6-net delete <server> <port>` ⚠

Remove a port's IPv6 network. `DELETE /projects/{project}/cloud/servers/{server}/ports/{port}/ipv6-net` · ability `cloud.manage` · beta

### `ph24 cloud ports ipv6-net rdns <server> <port>`

Set or remove the reverse DNS of an address in the port's IPv6 /64. `PUT /projects/{project}/cloud/servers/{server}/ports/{port}/ipv6-net/rdns` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--address` | string | required | Any IPv6 address inside the /64. |
| `--hostname` | string |  | Any valid hostname (RFC 1123, IDNs as punycode), up to 253 characters; null or empty removes it. |

### `ph24 cloud ports list`

List the project's server ports. `GET /projects/{project}/cloud/ports` · ability `cloud.view` · beta

### `ph24 cloud price-preview` 💶

Price a cloud create. `POST /projects/{project}/cloud/price-preview` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--count` | integer |  | How many resources are created at once; multiplies every item. |
| `--items` | json[] | required | What the create orders. |
| `--location` | string | required | `clo_…` of the location: the project's location, or for the project's first resource the one chosen. |

### `ph24 cloud prices`

List the project's cloud prices. `GET /projects/{project}/cloud/prices` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string |  | `clo_…`: required until the project's first cloud resource binds it to its location. |

### `ph24 cloud public-ips list`

List the project's public IPv4 addresses. `GET /projects/{project}/cloud/public-ips` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 cloud public-ips rdns <ip>`

Set or clear the reverse DNS of a public IPv4. `PUT /projects/{project}/cloud/public-ips/{ip}/rdns` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--hostname` | string |  | Any valid hostname (RFC 1123, IDNs as punycode), up to 253 characters; null or empty: back to the default. |

### `ph24 cloud routers create` 💶

Create a router. `POST /projects/{project}/cloud/routers` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--external-gateway` | boolean | required | true: the public network as gateway (a billed public IPv4); false: internal only (free). |
| `--location` | string |  | `clo_…`: optional; when sent, the project's location. |
| `--name` | string | required |  |

### `ph24 cloud routers delete <router>` ⚠

Delete a router. `DELETE /projects/{project}/cloud/routers/{router}` · ability `cloud.manage` · beta

### `ph24 cloud routers gateway remove <router>` ⚠

Remove a router's public gateway. `DELETE /projects/{project}/cloud/routers/{router}/gateway` · ability `cloud.manage` · beta

### `ph24 cloud routers gateway set <router>` 💶

Give a router a public gateway. `PUT /projects/{project}/cloud/routers/{router}/gateway` · ability `cloud.manage` · beta

### `ph24 cloud routers get <router>`

Get a router. `GET /projects/{project}/cloud/routers/{router}` · ability `cloud.view` · beta

### `ph24 cloud routers interfaces create <router>`

Attach a subnet to a router. `POST /projects/{project}/cloud/routers/{router}/interfaces` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--subnet` | string | required | `sbn_…` |

### `ph24 cloud routers interfaces delete <router> <subnet>` ⚠

Detach a subnet from a router. `DELETE /projects/{project}/cloud/routers/{router}/interfaces/{subnet}` · ability `cloud.manage` · beta

### `ph24 cloud routers list`

List routers. `GET /projects/{project}/cloud/routers` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 cloud routers routes create <router>`

Add a static route (`202`). `POST /projects/{project}/cloud/routers/{router}/routes` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--destination` | string | required | CIDR, e.g. `192.168.10.0/24`. |
| `--nexthop` | string | required | An address inside a subnet attached to the router. |

### `ph24 cloud routers routes delete <router>` ⚠

Remove a static route. `DELETE /projects/{project}/cloud/routers/{router}/routes` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--destination` | string | required | CIDR, e.g. `192.168.10.0/24`. |
| `--nexthop` | string | required | An address inside a subnet attached to the router. |

### `ph24 cloud routers update <router>`

Rename a router. `PATCH /projects/{project}/cloud/routers/{router}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Plain text, up to 255 characters. |

### `ph24 cloud servers action <server> <action>` 💶

Run a server action. `POST /projects/{project}/cloud/servers/{server}/actions/{action}` · ability `cloud.manage` · beta

### `ph24 cloud servers action-log <server>`

List a cloud server's action history. `GET /projects/{project}/cloud/servers/{server}/action-log` · ability `cloud.view` · beta

### `ph24 cloud servers confirm-resize <server>` 💶

Confirm a resize. `POST /projects/{project}/cloud/servers/{server}/actions/confirm-resize` · ability `cloud.manage` · beta

### `ph24 cloud servers create` 💶

Create cloud servers. `POST /projects/{project}/cloud/servers` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--availability-zone` | string |  | One of the location's compute availability zones (`/public/cloud/locations/{location}/availability-zones`); default: OpenStack chooses. |
| `--boot-volume-gb` | integer |  | Size of the boot volume in GB, only for flavors without a disk (`disk_gib` 0): at least the image's `min_disk_gb` (and 1), at most 10240. Flavors with a disk boot from a volume of their disk size. |
| `--count` | integer |  | How many servers, 1–10 (default 1); each gets its own operation and its own password. |
| `--firewalls` | string[] |  | Firewalls (`fwl_…`, S-087). Until firewalls can be managed every server gets the project's default firewall. |
| `--flavor-id` | string | required | A flavor of the location (OpenStack id from `/public/cloud/locations/{location}/flavors`). |
| `--generate-password` | boolean |  | Let ph24 generate a password: returned once per server in this answer, never again. Not together with `password`. |
| `--image-id` | string | required | An active image (`img_…`): public at the location or the project's own. |
| `--location-id` | string | required | The cloud location (`clo_…`). A project lives in the one location its cloud was set up in. |
| `--login-user` | string |  | Required when the image has no default user (`login_user` null in the image list): a Linux user name. |
| `--name` | string | required | Hostname rules: `a-z`, `0-9`, `-`, 1–63 characters. With `count` > 1 the servers are named `<name>-1 … <name>-n` (each at most 63 characters). |
| `--networks` | string[] |  | `external` (public IPv4/IPv6) and/or private networks of the project (`net_…`). At least one; default `["external"]`. |
| `--password` | string |  | Your own password: 12–128 characters with upper and lower case letters, a digit and a symbol, not the name, not known from data breaches. Never stored. |
| `--ssh-key-ids` | string[] |  | SSH keys of your account (`sshk_…`), written for the login user. At least one key or a password. |
| `--subnet-ids` | string[] |  | Optional: the subnet (`sbn_…`) a server's address on a chosen private network comes from, at most one per network. Without one, OpenStack picks an address of the network. |
| `--user-data` | string |  | Your own cloud-init user-data (cloud-config, a script or anything cloud-init reads), at most 48 KB. Never stored after the server is created. |

### `ph24 cloud servers delete <server>` ⚠ 💶

Delete a cloud server. `DELETE /projects/{project}/cloud/servers/{server}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--delete-boot-volume` | boolean |  | Delete the boot volume too (default true). Kept anyway while the server's snapshots are kept (`boot_volume_kept_reason`). |
| `--delete-data-volumes` | boolean |  | Delete attached data volumes (default false: they are detached and kept). |
| `--delete-snapshots` | boolean |  | Delete the server's snapshots (default false: they stay as own images). |

### `ph24 cloud servers firewalls apply <server>` 💶

Apply a server's firewalls again. `POST /projects/{project}/cloud/servers/{server}/firewalls/apply` · ability `cloud.manage` · beta

### `ph24 cloud servers firewalls get <server>`

Get a server's firewalls. `GET /projects/{project}/cloud/servers/{server}/firewalls` · ability `cloud.view` · beta

### `ph24 cloud servers firewalls update <server>` 💶

Set a server's firewalls. `PUT /projects/{project}/cloud/servers/{server}/firewalls` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--firewalls` | string[] | required | The full set (`fwl_…`), at least one: firewalls missing here are removed from the server. |

### `ph24 cloud servers get <server>`

Get a cloud server. `GET /projects/{project}/cloud/servers/{server}` · ability `cloud.view` · beta

### `ph24 cloud servers list`

List the cloud servers of a project. `GET /projects/{project}/cloud/servers` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `created`, `-created` (default) or `name`, `-name`. |
| `--filter-state` | string |  | One state, e.g. `running`, `stopped`, `error`. |
| `--q` | string |  | Part of the name, or an address. |

### `ph24 cloud servers rebuild <server>` ⚠ 💶

Rebuild a cloud server with an image. `POST /projects/{project}/cloud/servers/{server}/actions/rebuild` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--generate-password` | boolean |  | Let ph24 generate a password: returned once in this answer. |
| `--image-id` | string | required | The new image (`img_…`), active and visible to the project; the same image reinstalls. |
| `--login-user` | string |  | Required when the image has no default user. |
| `--password` | string |  | Your own password (rules as at create). Never stored. |
| `--ssh-key-ids` | string[] |  | SSH keys of your account (`sshk_…`). At least one key or a password. |
| `--user-data` | string |  | Your own cloud-init user-data, at most 48 KB. |

### `ph24 cloud servers rescue <server>`

Boot a cloud server into rescue. `POST /projects/{project}/cloud/servers/{server}/actions/rescue` · ability `cloud.manage` · beta

### `ph24 cloud servers resize <server>` 💶

Resize a cloud server. `POST /projects/{project}/cloud/servers/{server}/actions/resize` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--flavor-id` | string | required | Another flavor of the location (OpenStack id). A bigger disk grows the boot volume; a smaller one keeps it as it is. |

### `ph24 cloud servers revert-resize <server>` 💶

Revert a resize. `POST /projects/{project}/cloud/servers/{server}/actions/revert-resize` · ability `cloud.manage` · beta

### `ph24 cloud servers shelve <server>` 💶

Shelve a cloud server. `POST /projects/{project}/cloud/servers/{server}/actions/shelve` · ability `cloud.manage` · beta

### `ph24 cloud servers snapshot <server>` 💶

Take a snapshot of a cloud server. `POST /projects/{project}/cloud/servers/{server}/actions/snapshot` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Servers: `a-z`, `0-9`, `-`, 1–63 characters. Images and snapshots: plain text, 1–255 characters. |

### `ph24 cloud servers unshelve <server>` 💶

Unshelve a cloud server. `POST /projects/{project}/cloud/servers/{server}/actions/unshelve` · ability `cloud.manage` · beta

### `ph24 cloud servers update <server>`

Rename a cloud server. `PATCH /projects/{project}/cloud/servers/{server}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Servers: `a-z`, `0-9`, `-`, 1–63 characters. Images and snapshots: plain text, 1–255 characters. |

### `ph24 cloud setup create` 💶

Set up the project's cloud. `POST /projects/{project}/cloud/setup` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--immediate-start` | boolean |  | Consumers only (`consent.consumer: true`): `true` asks for the cloud services to start at once, as `consent.immediate_start` says. |
| `--location` | string |  | `clo_…`; needed only when several locations are open (`locations`). A retry keeps the location of the failed setup. |
| `--text-version` | string |  | While `state` is `consent_required`: the `consent.version` of the terms shown. Confirms them. |

### `ph24 cloud setup get`

Get the project's cloud setup. `GET /projects/{project}/cloud/setup` · ability `cloud.view` · beta

### `ph24 cloud snapshots delete <snapshot>` ⚠

Delete a volume snapshot. `DELETE /projects/{project}/cloud/snapshots/{snapshot}` · ability `cloud.manage` · beta

### `ph24 cloud snapshots list`

List volume snapshots. `GET /projects/{project}/cloud/snapshots` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `created`, `-created` (default), `name`, `-name`. |
| `--q` | string |  | Part of the name. |

### `ph24 cloud subnets create <network>` 💶

Add a subnet. `POST /projects/{project}/cloud/networks/{network}/subnets` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--cidr` | string | required | IPv4 /8–/29 or IPv6 /48–/64, e.g. `10.0.0.0/24`. |
| `--name` | string | required |  |

### `ph24 cloud subnets delete <network> <subnet>` ⚠

Delete a subnet. `DELETE /projects/{project}/cloud/networks/{network}/subnets/{subnet}` · ability `cloud.manage` · beta

### `ph24 cloud subnets update <network> <subnet>`

Rename a subnet. `PATCH /projects/{project}/cloud/networks/{network}/subnets/{subnet}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Plain text, up to 255 characters. |

### `ph24 cloud topology`

Show the project's network topology. `GET /projects/{project}/cloud/topology` · ability `cloud.view` · beta

### `ph24 cloud volumes attach <volume>`

Attach a volume to a server. `POST /projects/{project}/cloud/volumes/{volume}/attach` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--server-id` | string | required | A server (`srv_…`) of the project at the volume's location; not `building`, `error` or being deleted. |

### `ph24 cloud volumes backup-schedule get <volume>`

Get a volume's backup schedule. `GET /projects/{project}/cloud/volumes/{volume}/backup-schedule` · ability `cloud.view` · beta

### `ph24 cloud volumes backup-schedule update <volume>`

Set a volume's backup schedule. `PUT /projects/{project}/cloud/volumes/{volume}/backup-schedule` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--enabled` | boolean | required | On or off. Off by default: backups cost. |
| `--keep` | integer |  | How many scheduled backups to keep, 1–30 (default 7). |
| `--minute` | integer |  | Time of day in UTC as minutes after midnight, in steps of 10 (0–1430); default: the slot ph24 picked. |

### `ph24 cloud volumes backups create <volume>` 💶

Back up a volume. `POST /projects/{project}/cloud/volumes/{volume}/backups` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string |  | Hostname rules; default `<volume>-<yyyymmdd>-<hhmm>`. |
| `--price-token` | string |  | The `price_token` of the price preview the dialog showed (`POST …/cloud/price-preview`): when the price changed since, the request is refused with `price-changed` and the new price. Optional for API c |

### `ph24 cloud volumes backups list <volume>`

List a volume's backups. `GET /projects/{project}/cloud/volumes/{volume}/backups` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `created`, `-created` (default), `name`, `-name`. |
| `--q` | string |  | Part of the name. |

### `ph24 cloud volumes create` 💶

Create a volume. `POST /projects/{project}/cloud/volumes` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--availability-zone` | string |  | A volume availability zone of the location; default: OpenStack chooses. |
| `--location-id` | string | required | The cloud location (`clo_…`). A project lives in the one location its cloud was set up in. |
| `--name` | string | required | Hostname rules: `a-z`, `0-9`, `-`, 1–63 characters; need not be unique. |
| `--price-token` | string |  | The `price_token` of the price preview the dialog showed (`POST …/cloud/price-preview`): when the price changed since, the request is refused with `price-changed` and the new price. Optional for API c |
| `--size-gb` | integer | required | Whole GB, 1–10240 (10 TB), within the organization's cloud volume total. From a snapshot: at least its size. |
| `--snapshot-id` | string |  | Start from this snapshot (`vsn_…`) of the project. |
| `--volume-type` | string | required | A volume type of the location (`/public/cloud/locations/{location}/volume-types`); from a snapshot: the snapshot's type. |

### `ph24 cloud volumes delete <volume>` ⚠ 💶

Delete a volume. `DELETE /projects/{project}/cloud/volumes/{volume}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--delete-snapshots` | boolean |  | Delete the volume's snapshots too (each is waited for until gone). Without it a volume with snapshots can't be deleted. Backups always stay. |

### `ph24 cloud volumes detach <volume>`

Detach a volume from its server. `POST /projects/{project}/cloud/volumes/{volume}/detach` · ability `cloud.manage` · beta

### `ph24 cloud volumes extend <volume>` 💶

Extend a volume. `POST /projects/{project}/cloud/volumes/{volume}/extend` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--price-token` | string |  | The `price_token` of the price preview the dialog showed (`POST …/cloud/price-preview`): when the price changed since, the request is refused with `price-changed` and the new price. Optional for API c |
| `--size-gb` | integer | required | The new size in whole GB: more than now, at most 10240. |

### `ph24 cloud volumes get <volume>`

Get a volume. `GET /projects/{project}/cloud/volumes/{volume}` · ability `cloud.view` · beta

### `ph24 cloud volumes list`

List the volumes of a project. `GET /projects/{project}/cloud/volumes` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `created`, `-created` (default), `name`, `-name`, `size`, `-size`. |
| `--filter-state` | string |  | One state, e.g. `available`, `in_use`, `error`. |
| `--filter-kind` | string |  | `boot` or `data`. |
| `--q` | string |  | Part of the name, or the v2 or OpenStack id. |

### `ph24 cloud volumes snapshots create <volume>` 💶

Take a snapshot of a volume. `POST /projects/{project}/cloud/volumes/{volume}/snapshots` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Hostname rules: `a-z`, `0-9`, `-`, 1–63 characters. |
| `--price-token` | string |  | The `price_token` of the price preview the dialog showed (`POST …/cloud/price-preview`): when the price changed since, the request is refused with `price-changed` and the new price. Optional for API c |

### `ph24 cloud volumes snapshots list <volume>`

List a volume's snapshots. `GET /projects/{project}/cloud/volumes/{volume}/snapshots` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `created`, `-created` (default), `name`, `-name`. |
| `--q` | string |  | Part of the name. |

### `ph24 cloud volumes update <volume>`

Rename a volume. `PATCH /projects/{project}/cloud/volumes/{volume}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | Servers: `a-z`, `0-9`, `-`, 1–63 characters. Images and snapshots: plain text, 1–255 characters. |

## dns-zones

### `ph24 dns-zones check <zone>`

Check a DNS zone now. `POST /projects/{project}/dns-zones/{zone}/check` · ability `services.view` · beta

### `ph24 dns-zones create`

Create a DNS zone. `POST /projects/{project}/dns-zones` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | The domain, e.g. `example.com` or `müller.de`. |

### `ph24 dns-zones delete <zone>` ⚠

Delete a DNS zone. `DELETE /projects/{project}/dns-zones/{zone}` · ability `services.manage` · beta

### `ph24 dns-zones get <zone>`

Get a DNS zone. `GET /projects/{project}/dns-zones/{zone}` · ability `services.view` · beta

### `ph24 dns-zones list`

List the DNS zones of a project. `GET /projects/{project}/dns-zones` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--filter-name` | string |  | Part of the domain. |
| `--filter-delegation` | string |  | `ours`, `partly`, `other`, `none` or `unknown`. |

### `ph24 dns-zones records change <zone>`

Change records. `PATCH /projects/{project}/dns-zones/{zone}/records` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--confirm-managed` | boolean |  | Change records set by mailboxes or web hosting anyway (otherwise 409 with `managed_by`). |
| `--create` | json[] |  | Records to add: `name` (`@` or relative, e.g. `www`), `type`, `content`, `ttl` (60–86400, default 3600), `priority` (MX, SRV). |
| `--delete` | string[] |  | The `id`s of records to delete. |
| `--keep-value` | boolean |  | Keep changed web hosting records as your own: the sync stops updating that name and type (`confirm_managed` too). |
| `--update` | json[] |  | Records to change: `id` plus the same fields. |

### `ph24 dns-zones records get <zone>`

List the records of a DNS zone. `GET /projects/{project}/dns-zones/{zone}/records` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--filter-type` | string |  | A record type, e.g. `MX`. |
| `--filter-name` | string |  | Part of the name. |

## domain-check

### `ph24 domain-check`

Check domain names. `GET /projects/{project}/domain-check` · ability `services.order` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | A name (`example`) or a domain (`example.de`), Unicode or punycode. |
| `--tlds` | string[] |  | checked against the endings sold right now (a closure, so the API reference doesn't list them as an enum) |

## domain-contacts

### `ph24 domain-contacts`

List the contacts you can choose as a domain owner. `GET /projects/{project}/domain-contacts` · ability `services.order` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

## domain-prices

### `ph24 domain-prices`

List the domain prices for this organization. `GET /projects/{project}/domain-prices` · ability `services.order` · beta

## domains

### `ph24 domains auto-renew <domain>` 💶

Cancel or keep the domain. `PUT /projects/{project}/domains/{domain}/auto-renew` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--enabled` | boolean | required | `false` cancels the domain, `true` keeps it. |

### `ph24 domains create` 💶

Order a domain. `POST /projects/{project}/domains` · ability `services.order` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--auth-code` | string |  | Transfers: the auth code from the current provider. |
| `--code` | string |  | A discount coupon (`WELCOME20`). One that doesn't work refuses the order with `code-invalid`; repeated failures lock it for up to an hour. Missing: a coupon attached to the organization that fits, if  |
| `--contact-id` | string | required | The owner from your organization's contacts (`con_…`); the domain gets its own copy. |
| `--immediate-start` | boolean |  | Consumers (billing profile without company name and VAT ID) only: `true` asks for the service to start at once, as the text shown says (`GET /projects/{project}/immediate-start`). Without it a consume |
| `--immediate-start-text-version` | string |  | The `version` of the text shown with the box: `service` for a plan, `domain` for a domain. |
| `--name` | string | required | The domain with its ending, e.g. `example.de` (Unicode or punycode). |
| `--nameservers` | string[] |  | 2–5 nameservers of your own; leave out for ours (DNS zone at ph24, created first). |
| `--type` | register\|transfer | required | How the domain came to us. |

### `ph24 domains get <domain>`

Get a domain. `GET /projects/{project}/domains/{domain}` · ability `services.view` · beta

### `ph24 domains keep-zone <domain>` 💶

Keep the DNS zone of a deleted domain. `POST /projects/{project}/domains/{domain}/keep-zone` · ability `services.manage` · beta

### `ph24 domains list`

List the domains of a project. `GET /projects/{project}/domains` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--q` | string |  | Part of the domain. |
| `--filter-status` | string |  | `ordering`, `active`, `expiring`, `deleted`, `transferred_out` or `failed`. |

### `ph24 domains mail check <domain>`

Check the mail DNS records. `POST /projects/{project}/domains/{domain}/mail/check` · ability `mail.view` · beta

### `ph24 domains mail dns <domain>`

Write the mail DNS records. `POST /projects/{project}/domains/{domain}/mail/dns` · ability `mail.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--replace` | boolean |  | Also removes the records in `dns.collisions`. |

### `ph24 domains mail get <domain>`

Get a domain's mail. `GET /projects/{project}/domains/{domain}/mail` · ability `mail.view` · beta

### `ph24 domains mail refresh <domain>`

Refresh the usage. `POST /projects/{project}/domains/{domain}/mail/refresh` · ability `mail.view` · beta

### `ph24 domains mail turn-off <domain>` ⚠

Turn off mailboxes. `POST /projects/{project}/domains/{domain}/mail/turn-off` · ability `mail.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--confirm` | string | required | The address or domain, typed. |

### `ph24 domains mail-aliases list <domain>`

List mail aliases. `GET /projects/{project}/domains/{domain}/mail-aliases` · ability `mail.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--q` | string |  | Part of the address. |

### `ph24 domains mailboxes create <domain>`

Create a mailbox. `POST /projects/{project}/domains/{domain}/mailboxes` · ability `mail.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--local-part` | string | required | The part before the `@`: 1–64 letters, digits, `.`, `_` or `-`, starting and ending with a letter or digit. |

### `ph24 domains mailboxes list <domain>`

List mailboxes. `GET /projects/{project}/domains/{domain}/mailboxes` · ability `mail.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--q` | string |  | Part of the address. |
| `--sort` | string |  | `address`, `status`, `usage` or `created`, with `-` for descending. |
| `--filter-status` | string |  | `creating`, `needs_password`, `active`, `deleting` or `failed`. |

### `ph24 domains nameservers <domain>` 💶

Change the nameservers. `PUT /projects/{project}/domains/{domain}/nameservers` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--mode` | ours\|custom | required | `ours` (DNS zone at ph24) or `custom`. |
| `--nameservers` | string[] |  | `custom`: 2–5 host names. |

### `ph24 domains owner <domain>` 💶

Change the owner. `PUT /projects/{project}/domains/{domain}/owner` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--confirm` | string | required | The domain name, typed to confirm. |
| `--contact-id` | string | required | From your organization's contacts (`con_…`); the domain gets its own copy. |
| `--fee-cents` | integer |  | Where the registry charges for an owner change: the fee you confirm (net cents, from `owner_change_fee`). |

### `ph24 domains restore <domain>` 💶

Restore a deleted domain. `POST /projects/{project}/domains/{domain}/restore` · ability `services.order` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--price-cents` | integer | required | The net price you saw (`renewal.restore_price`), in cents. |

## firewalls

### `ph24 firewalls create`

Create a firewall. `POST /projects/{project}/firewalls` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  |  |
| `--body-dry-run` | boolean |  | Only check (lockout warning), save nothing. |
| `--inbound` | json | required | Inbound traffic: the default (`policy`) and the `rules`. |
| `--name` | string | required | Up to 64 characters, unique in the project. |
| `--outbound` | json | required | Outbound traffic: the default (`policy`) and the `rules`. |

### `ph24 firewalls delete <firewall>` ⚠

Delete a firewall. `DELETE /projects/{project}/firewalls/{firewall}` · ability `services.manage` · beta

### `ph24 firewalls get <firewall>`

Get a firewall. `GET /projects/{project}/firewalls/{firewall}` · ability `services.view` · beta

### `ph24 firewalls list`

List firewalls. `GET /projects/{project}/firewalls` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `name`, `-name`, `updated` or `-updated`. |
| `--q` | string |  | Search in name and description. |
| `--filter-server` | string |  | Only firewalls on this server (`vps_…`). |

### `ph24 firewalls servers <firewall>`

Set the servers of a firewall. `PUT /projects/{project}/firewalls/{firewall}/servers` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--body-dry-run` | boolean |  | Only check (lockout warning and preview), save nothing. |
| `--servers` | string[] | required | `vps_…` of this project: the complete list, it replaces the current one; empty removes the firewall from all servers. |
| `--version` | string |  | The firewall's `servers_version` the list was made from: `conflict` (409) when its servers changed since. |

### `ph24 firewalls templates`

List firewall templates. `GET /projects/{project}/firewalls/templates` · ability `services.view` · beta

### `ph24 firewalls update <firewall>`

Change a firewall. `PUT /projects/{project}/firewalls/{firewall}` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  |  |
| `--body-dry-run` | boolean |  | Only check (lockout warning), save nothing. |
| `--inbound` | json | required | Inbound traffic: the default (`policy`) and the `rules`. |
| `--name` | string | required | Up to 64 characters, unique in the project. |
| `--outbound` | json | required | Outbound traffic: the default (`policy`) and the `rules`. |

## handovers

### `ph24 handovers delete <handover>` ⚠

Revoke a hand-over. `DELETE /projects/{project}/handovers/{handover}` · ability `services.handover` · beta

### `ph24 handovers resend <handover>` ⚠

Send a hand-over link again. `POST /projects/{project}/handovers/{handover}/resend` · ability `services.handover` · beta

## immediate-start

### `ph24 immediate-start`

Get the "start immediately" declaration. `GET /projects/{project}/immediate-start` · ability `services.order` · beta

## invoice-address

### `ph24 invoice-address`

Get whether invoices carry the address. `GET /projects/{project}/invoice-address` · ability `services.view` · beta

## ip-lists

### `ph24 ip-lists create`

Create an IP list. `POST /projects/{project}/ip-lists` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  |  |
| `--body-dry-run` | boolean |  | Only check (lockout warning), save nothing. |
| `--entries` | json[] | required | Up to 1,000 entries by default (`firewall-limit-reached` above). |
| `--name` | string | required | Up to 64 characters, unique in the project. |

### `ph24 ip-lists delete <ipList>` ⚠

Delete an IP list. `DELETE /projects/{project}/ip-lists/{ipList}` · ability `services.manage` · beta

### `ph24 ip-lists get <ipList>`

Get an IP list. `GET /projects/{project}/ip-lists/{ipList}` · ability `services.view` · beta

### `ph24 ip-lists list`

List IP lists. `GET /projects/{project}/ip-lists` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--sort` | string |  | `name`, `-name`, `updated` or `-updated`. |
| `--q` | string |  | Search in name, description and addresses. |

### `ph24 ip-lists update <ipList>`

Change an IP list. `PUT /projects/{project}/ip-lists/{ipList}` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--description` | string |  |  |
| `--body-dry-run` | boolean |  | Only check (lockout warning), save nothing. |
| `--entries` | json[] | required | Up to 1,000 entries by default (`firewall-limit-reached` above). |
| `--name` | string | required | Up to 64 characters, unique in the project. |

## kubernetes

### `ph24 kubernetes addons available <cluster>`

List the add-ons offered. `GET /projects/{project}/kubernetes/clusters/{cluster}/addons/available` · ability `cloud.view` · beta

### `ph24 kubernetes addons create <cluster>`

Install an add-on. `POST /projects/{project}/kubernetes/clusters/{cluster}/addons` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | The add-on's name from `addons/available`. |
| `--variables` | string[] |  | Its settings by `name` of the form's fields. |

### `ph24 kubernetes addons delete <cluster> <addon>` ⚠

Remove an add-on. `DELETE /projects/{project}/kubernetes/clusters/{cluster}/addons/{addon}` · ability `cloud.manage` · beta

### `ph24 kubernetes addons list <cluster>`

List the add-ons of a cluster. `GET /projects/{project}/kubernetes/clusters/{cluster}/addons` · ability `cloud.view` · beta

### `ph24 kubernetes backups create <cluster>`

Back up now. `POST /projects/{project}/kubernetes/clusters/{cluster}/backups` · ability `cloud.manage` · beta

### `ph24 kubernetes backups delete <cluster> <backup>` ⚠

Delete a manual backup. `DELETE /projects/{project}/kubernetes/clusters/{cluster}/backups/{backup}` · ability `cloud.manage` · beta

### `ph24 kubernetes backups list <cluster>`

List the backups of a cluster. `GET /projects/{project}/kubernetes/clusters/{cluster}/backups` · ability `cloud.view` · beta

### `ph24 kubernetes clusters costs <cluster>`

Show a cluster's running costs this month. `GET /projects/{project}/kubernetes/clusters/{cluster}/costs` · ability `cloud.view` · beta

### `ph24 kubernetes clusters create` 💶

Create a Kubernetes cluster. `POST /projects/{project}/kubernetes/clusters` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--audit-logging` | boolean |  | Kubernetes audit logging with the recommended policy. Default off; can be switched later. |
| `--cni` | cilium\|canal |  | The CNI of a cluster (S-091 R14, owner Q3): Cilium (default, eBPF proxy mode) or Canal; only at create. |
| `--location` | string |  | The location's code, e.g. `fra1`. Optional; when sent, the location the project's cloud was set up in. |
| `--name` | string | required | Lower-case letters, digits and hyphens; the MachineDeployment keeps the first name. |
| `--node-pool` | json |  | The first node pool (S-092), added once the control plane is healthy; leave it out for a cluster without workers. |
| `--opa` | boolean |  | OPA Gatekeeper. Default off; can be switched later. |
| `--pod-cidr` | string |  | Private range for pods (default `172.25.0.0/16`, /8 to /22). Can't be changed later. |
| `--service-cidr` | string |  | Private range for services (default `10.240.16.0/20`, /12 to /24). Can't be changed later. |
| `--version` | string |  | A version from `GET …/kubernetes/versions`; default: the location's default. |

### `ph24 kubernetes clusters delete <cluster>` ⚠ 💶

Delete a cluster. `DELETE /projects/{project}/kubernetes/clusters/{cluster}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--cleanup-cloud-resources` | boolean |  | Also delete the load balancers and volumes the cluster created. Default true. |

### `ph24 kubernetes clusters get <cluster>`

Show a Kubernetes cluster. `GET /projects/{project}/kubernetes/clusters/{cluster}` · ability `cloud.view` · beta

### `ph24 kubernetes clusters kubeconfig regenerate <cluster>` ⚠

Regenerate the kubeconfig. `POST /projects/{project}/kubernetes/clusters/{cluster}/kubeconfig/regenerate` · ability `cloud.manage` · beta

### `ph24 kubernetes clusters list`

List the Kubernetes clusters of a project. `GET /projects/{project}/kubernetes/clusters` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--filter-name` | string |  | Part of the name. |
| `--filter-state` | string |  | One state, e.g. `running`. |

### `ph24 kubernetes clusters nodes <cluster>`

List the nodes of a cluster. `GET /projects/{project}/kubernetes/clusters/{cluster}/nodes` · ability `cloud.view` · beta

### `ph24 kubernetes clusters update <cluster>`

Rename a cluster or switch audit logging and OPA Gatekeeper. `PATCH /projects/{project}/kubernetes/clusters/{cluster}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--audit-logging` | boolean |  | Switch Kubernetes audit logging on or off. |
| `--cni` | string |  | Fixed at creation: sending it is refused (`validation-failed`). |
| `--name` | string |  | A new name, unique in the project. |
| `--opa` | boolean |  | Switch OPA Gatekeeper on or off. |
| `--pod-cidr` | string |  | Fixed at creation: sending it is refused (`validation-failed`). |
| `--service-cidr` | string |  | Fixed at creation: sending it is refused (`validation-failed`). |
| `--version` | string |  | Changed only by the upgrade endpoint: sending it is refused (`validation-failed`). |

### `ph24 kubernetes clusters upgrade <cluster>` ⚠

Upgrade a cluster. `POST /projects/{project}/kubernetes/clusters/{cluster}/upgrade` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--version` | string | required | The target version. |

### `ph24 kubernetes grafana-login <cluster>`

Open Grafana. `POST /projects/{project}/kubernetes/clusters/{cluster}/grafana-login` · ability `cloud.view` · beta

### `ph24 kubernetes monitoring disable <cluster>` ⚠

Disable monitoring. `DELETE /projects/{project}/kubernetes/clusters/{cluster}/monitoring` · ability `cloud.manage` · beta

### `ph24 kubernetes monitoring enable <cluster>`

Enable monitoring. `POST /projects/{project}/kubernetes/clusters/{cluster}/monitoring` · ability `cloud.manage` · beta

### `ph24 kubernetes node-pools create <cluster>` 💶

Create a node pool. `POST /projects/{project}/kubernetes/clusters/{cluster}/node-pools` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--autoscaling` | json |  | `{min, max}` lets the pool grow and shrink by itself; null switches it off. The maximum isn't checked against the quota. |
| `--availability-zone` | string | required | A compute availability zone of the location. |
| `--disk-gb` | integer |  | Root disk per node in GB; default: the flavor's disk. |
| `--flavor` | string | required | An offered flavor's id (`GET /cloud/flavors`) with at least `flavor_min_vcpus` vCPUs (`…/kubernetes/worker-images`); a pool keeps a smaller one it already has. |
| `--image` | string | required | An id from `GET …/kubernetes/worker-images`. |
| `--kubelet-version` | string |  | Kubelet version, never newer than the control plane; default: the control plane's. |
| `--name` | string | required | Lower-case letters, digits and hyphens; the MachineDeployment keeps the first name. |
| `--replicas` | integer | required | Number of nodes, 0 or more. |
| `--ssh-keys` | string[] |  | Panel SSH keys (`sshk_…`); their public keys go onto the nodes. Changing them replaces the nodes. |
| `--volume-type` | string |  | An offered volume type's id; default: the location's default type. |

### `ph24 kubernetes node-pools delete <cluster> <pool>` ⚠

Delete a node pool. `DELETE /projects/{project}/kubernetes/clusters/{cluster}/node-pools/{pool}` · ability `cloud.manage` · beta

### `ph24 kubernetes node-pools get <cluster> <pool>`

Show a node pool. `GET /projects/{project}/kubernetes/clusters/{cluster}/node-pools/{pool}` · ability `cloud.view` · beta

### `ph24 kubernetes node-pools list <cluster>`

List the node pools of a cluster. `GET /projects/{project}/kubernetes/clusters/{cluster}/node-pools` · ability `cloud.view` · beta

### `ph24 kubernetes node-pools update <cluster> <pool>` 💶

Change or scale a node pool. `PATCH /projects/{project}/kubernetes/clusters/{cluster}/node-pools/{pool}` · ability `cloud.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--autoscaling` | json |  | `{min, max}` lets the pool grow and shrink by itself; null switches it off. The maximum isn't checked against the quota. |
| `--availability-zone` | string | required | A compute availability zone of the location. |
| `--disk-gb` | integer |  | Root disk per node in GB; default: the flavor's disk. |
| `--flavor` | string | required | An offered flavor's id (`GET /cloud/flavors`) with at least `flavor_min_vcpus` vCPUs (`…/kubernetes/worker-images`); a pool keeps a smaller one it already has. |
| `--image` | string | required | An id from `GET …/kubernetes/worker-images`. |
| `--kubelet-version` | string |  | Kubelet version, never newer than the control plane; default: the control plane's. |
| `--name` | string | required | Lower-case letters, digits and hyphens; the MachineDeployment keeps the first name. |
| `--replicas` | integer | required | Number of nodes, 0 or more. |
| `--ssh-keys` | string[] |  | Panel SSH keys (`sshk_…`); their public keys go onto the nodes. Changing them replaces the nodes. |
| `--volume-type` | string |  | An offered volume type's id; default: the location's default type. |

### `ph24 kubernetes operations get <operation>`

Show a Kubernetes operation. `GET /projects/{project}/kubernetes/operations/{operation}` · ability `cloud.view` · beta

### `ph24 kubernetes versions`

List the Kubernetes versions. `GET /projects/{project}/kubernetes/versions` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string |  | Location code, for a project without cloud resources yet. |
| `--cluster` | string |  | A cluster (`cls_…`) whose upgrade targets you want. |

### `ph24 kubernetes worker-images`

List the worker images. `GET /projects/{project}/kubernetes/worker-images` · ability `cloud.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--location` | string |  | Location code, for a project without cloud resources yet. |

## project

### `ph24 project get`

Get a project. `GET /projects/{project}` · ability `project.view` · beta

## public

### `ph24 public abuse-notices challenge`

Get a challenge for the abuse notice form. `GET /public/abuse-notices/challenge` · beta

### `ph24 public abuse-notices create`

Report illegal content. `POST /public/abuse-notices` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--answer` | string | required | The answer to the challenge's `question`, in digits. |
| `--category` | illegal_content\|copyright\|phishing\|malware\|spam\|network_attack\|crypto_mining\|child_sexual_abuse\|terrorism\|privacy\|other | required | What a notice is about (S-072 R17). Crypto mining isn't allowed on any product (owner decision 18). |
| `--challenge` | string | required | From `GET /public/abuse-notices/challenge`. |
| `--email` | string | required | The confirmation of receipt and our decision go here. |
| `--explanation` | string | required | Why you think it is illegal or against our terms. |
| `--good-faith` | yes\|on\|1\|1\|true\|true | required | You confirm that the notice is accurate and complete to the best of your knowledge (Art. 16 (2) (d) DSA). |
| `--locations` | string | required | Where exactly: URLs or IP addresses, one per line. |
| `--name` | string | required | Your name. |
| `--solution` | string | required | A number so that SHA-256 of `<challenge>.<solution>` starts with `difficulty` zero bits. |

### `ph24 public api-changelog`

Get the API changelog. `GET /public/api-changelog` · beta

### `ph24 public campaigns banner`

Show the campaign banner. `GET /public/campaigns/banner` · beta

### `ph24 public campaigns get <slug>`

Show a campaign. `GET /public/campaigns/{slug}` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--preview` | string |  | A staff preview value from the admin (shows a campaign before it starts). |

### `ph24 public campaigns link <slug> <token>`

Show a campaign through a private link. `GET /public/campaigns/{slug}/{token}` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--preview` | string |  | A staff preview value from the admin (shows a campaign before it starts). |

### `ph24 public campaigns state <slug>`

Show where a campaign stands. `GET /public/campaigns/{slug}/state` · beta

### `ph24 public cancellations challenge`

Get a challenge for the cancellation form. `GET /public/cancellations/challenge` · beta

### `ph24 public cancellations create`

Cancel a contract. `POST /public/cancellations` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--answer` | string | required |  |
| `--challenge` | string | required |  |
| `--contract` | string | required | The order number or the name of the service, e.g. `example.de` or `Server web-1`. |
| `--email` | string | required | The acknowledgement goes here, and our answer. |
| `--end-date` | string |  |  |
| `--name` | string | required | Your name. |
| `--reason` | string |  |  |
| `--solution` | string | required |  |
| `--type` | ordinary\|for_cause | required | What kind of cancellation (§ 312k Abs. 3 BGB): ordinary, or for cause with its reason. |

### `ph24 public catalog plan-group <slug>`

Show a plan group. `GET /public/catalog/plan-groups/{slug}` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--campaign-token` | string |  | The private link token of the campaign segment the group belongs to (S-098). |

### `ph24 public catalog plans <product>`

List a product's plans. `GET /public/catalog/products/{product}/plans` · beta

### `ph24 public catalog products`

List products. `GET /public/catalog/products` · beta

### `ph24 public cloud availability-zones <location>`

List the availability zones of a cloud location. `GET /public/cloud/locations/{location}/availability-zones` · beta

### `ph24 public cloud flavors <location>`

List the server sizes of a cloud location. `GET /public/cloud/locations/{location}/flavors` · beta

### `ph24 public cloud images <location>`

List the public images of a cloud location. `GET /public/cloud/locations/{location}/images` · beta

### `ph24 public cloud locations`

List the cloud locations. `GET /public/cloud/locations` · beta

### `ph24 public cloud prices <location>`

List the prices of a cloud location. `GET /public/cloud/locations/{location}/prices` · beta

### `ph24 public cloud volume-types <location>`

List the volume types of a cloud location. `GET /public/cloud/locations/{location}/volume-types` · beta

### `ph24 public deletion-cancel <token>`

Cancel a deletion with the link from the mail. `POST /public/deletion-cancel/{token}` · beta

### `ph24 public domain-check`

Search a domain. `GET /public/domain-check` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | A name (`example`) or a domain (`example.de`), Unicode or punycode. |
| `--tlds` | string[] |  | checked against the endings sold right now (a closure, so the API reference doesn't list them as an enum) |

### `ph24 public domain-tlds`

List domain prices. `GET /public/domain-tlds` · beta

### `ph24 public donation-links challenge <slug>`

Get a captcha challenge. `GET /public/donation-links/{slug}/challenge` · beta

### `ph24 public donation-links checkout <slug>` 💶

Donate. `POST /public/donation-links/{slug}/checkout` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--amount` | integer | required | Integer cents, within the link's bounds (`min_amount`, `max_amount` of the link). |
| `--challenge` | string | required | From `GET …/challenge`. |
| `--email` | string | required | Gets the confirmation and the receipt; never shown to the organization or the public. |
| `--is-anonymous` | boolean |  | Default true: the donor's name and message stay out of the public list and the organization's view. |
| `--message` | string |  | A message, up to 500 characters; shown only with `is_anonymous: false`. |
| `--method` | card\|paypal\|crypto | required | `card`, `paypal` or `crypto`, one of the link's `methods`. SEPA direct debit is never accepted. |
| `--name` | string |  | Shown publicly only with `is_anonymous: false`. |
| `--solution` | string | required | A number so that SHA-256 of `<challenge>.<solution>` starts with `difficulty` zero bits. |

### `ph24 public donation-links get <slug>`

Get a donation link. `GET /public/donation-links/{slug}` · beta

### `ph24 public health`

Health check. `GET /public/health` · stable

### `ph24 public popular-countries`

List the most used countries. `GET /public/popular-countries` · beta

### `ph24 public problem-types`

List the error types. `GET /public/problem-types` · beta

### `ph24 public realtime`

Where to connect for live updates. `GET /public/realtime` · beta

### `ph24 public stats`

Public figures. `GET /public/stats` · beta

### `ph24 public unsubscribe`

Unsubscribe from offers and news. `POST /public/unsubscribe` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--l` | newsletter\|offers\|api-changelog |  | `newsletter` (default): withdraws the newsletter consent; `offers`: objects to offers for existing customers; `api-changelog`: withdraws the consent to API changelog mails. |
| `--s` | string | required | Signature from the link. |
| `--u` | string | required | User id from the link. |

### `ph24 public vat-rates`

List VAT rates. `GET /public/vat-rates` · beta

### `ph24 public vps os-images`

List the operating systems for servers. `GET /public/vps/os-images` · beta

### `ph24 public withdrawals challenge`

Get a challenge for the withdrawal form. `GET /public/withdrawals/challenge` · beta

### `ph24 public withdrawals create`

Withdraw from a contract. `POST /public/withdrawals` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--answer` | string | required |  |
| `--challenge` | string | required |  |
| `--contract` | string | required | The order number or the name of the service, e.g. `example.de` or `Server web-1`. |
| `--email` | string | required | The acknowledgement goes here, and our answer. |
| `--name` | string | required | Your name. |
| `--solution` | string | required |  |

## realtime

### `ph24 realtime auth`

Authorize a private channel of the project. `POST /projects/{project}/realtime/auth` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--channel-name` | string | required | `private-projects.{project}.vps` of this project. |
| `--socket-id` | string | required | From the WebSocket connection (Pusher protocol), e.g. `1234.5678`. |

## subscriptions

### `ph24 subscriptions addons <subscription>` 💶

Set the addons. `PUT /projects/{project}/subscriptions/{subscription}/addons` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--addons` | json[] | required | Addons with the number of steps, e.g. `[{"addon_id": "add_…", "steps": 2}]`. Missing = none. |

### `ph24 subscriptions addons-quote <subscription>` 💶

Price new addons. `POST /projects/{project}/subscriptions/{subscription}/addons-quote` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--addons` | json[] | required | Addons with the number of steps, e.g. `[{"addon_id": "add_…", "steps": 2}]`. Missing = none. |

### `ph24 subscriptions auto-renew <subscription>` 💶

Turn automatic renewal of a prepayment on or off. `PUT /projects/{project}/subscriptions/{subscription}/auto-renew` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--consent` | boolean |  | With `enabled: true` on a prepayment: you agree that the prepayment renews automatically with the same period |
| `--enabled` | boolean | required | `true` turns automatic renewal on (a prepayment needs `consent`), `false` off. |

### `ph24 subscriptions billing <subscription>` 💶

Switch how a service is billed. `PUT /projects/{project}/subscriptions/{subscription}/billing` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--auto-renew` | boolean |  | With `prepay`: `true` = you agree that the prepayment renews automatically with the same period and discount (can be turned off any time). Never assumed. |
| `--billing` | hourly\|monthly_advance\|prepay | required | `hourly`, `monthly_advance` or `prepay` (3, 6 or 12 months in advance at the plan's discount). Missing = the product's default. Only options the catalog lists for the product / plan. |
| `--follow-up` | hourly\|monthly_advance |  | With `prepay`: how the service is billed after the prepayment if it isn't renewed, `hourly` or `monthly_advance`. Missing = the product's default. |
| `--prepay-months` | integer |  | With `prepay`: 3, 6 or 12 months (the plan's `prepayment` periods). |

### `ph24 subscriptions billing-quote <subscription>`

Preview a billing switch. `GET /projects/{project}/subscriptions/{subscription}/billing-quote` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--billing` | hourly\|monthly_advance\|prepay | required | `hourly`, `monthly_advance` or `prepay`, as for the switch. |
| `--prepay-months` | integer |  | With `prepay`: the months (the plan's `prepayment` periods). |

### `ph24 subscriptions charges <subscription>`

List a service's charges. `GET /projects/{project}/subscriptions/{subscription}/charges` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 subscriptions create` 💶

Order a service. `POST /projects/{project}/subscriptions` · ability `services.order` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--addons` | json[] |  | Addons with the number of steps, e.g. `[{"addon_id": "add_…", "steps": 2}]`. Missing = none. |
| `--auto-renew` | boolean |  | With `prepay`: `true` = you agree that the prepayment renews automatically with the same period and discount (can be turned off any time). Never assumed. |
| `--billing` | hourly\|monthly_advance\|prepay |  | `hourly`, `monthly_advance` or `prepay` (3, 6 or 12 months in advance at the plan's discount). Missing = the product's default. Only options the catalog lists for the product / plan. |
| `--campaign-token` | string |  | A campaign's private link token (S-098): needed for the plans of a segment shown only through its link. |
| `--code` | string |  | A discount coupon (`WELCOME20`). One that doesn't work refuses the order with `code-invalid`; repeated failures lock it for up to an hour. Missing: a coupon attached to the organization that fits, if  |
| `--follow-up` | hourly\|monthly_advance |  | With `prepay`: how the service is billed after the prepayment if it isn't renewed, `hourly` or `monthly_advance`. Missing = the product's default. |
| `--immediate-start` | boolean |  | Consumers (billing profile without company name and VAT ID) only: `true` asks for the service to start at once, as the text shown says (`GET /projects/{project}/immediate-start`). Without it a consume |
| `--immediate-start-text-version` | string |  | The `version` of the text shown with the box: `service` for a plan, `domain` for a domain. |
| `--options` | json |  | Product options. VPS (required): `location_id` (`loc_…`, a location the plan group lists), `os_image_id` (`osi_…`), `hostname`, `ssh_key_ids` (your account's `sshk_…`) and/or `password` (12–128 charac |
| `--plan-id` | string | required | The plan to order (`pln_…`, from the public catalog API). |
| `--prepay-months` | integer |  | With `prepay`: 3, 6 or 12 months (the plan's `prepayment` periods). |

### `ph24 subscriptions end <subscription>` ⚠ 💶

End a service. `POST /projects/{project}/subscriptions/{subscription}/end` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--when` | now\|period_end | required | \| \| |

### `ph24 subscriptions end-quote <subscription>`

What ending a service now would mean. `GET /projects/{project}/subscriptions/{subscription}/end-quote` · ability `services.view` · beta

### `ph24 subscriptions get <subscription>`

Get a service. `GET /projects/{project}/subscriptions/{subscription}` · ability `services.view` · beta

### `ph24 subscriptions keep <subscription>` 💶

Keep a service. `POST /projects/{project}/subscriptions/{subscription}/keep` · ability `services.manage` · beta

### `ph24 subscriptions keep-after-free-period <subscription>` 💶

Keep a free service after its free period. `POST /projects/{project}/subscriptions/{subscription}/keep-after-free-period` · ability `services.order` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--consent` | yes\|on\|1\|1\|true\|true | required | Your consent to the regular price from the end of the free period. Must be `true`. |

### `ph24 subscriptions list`

List the services of a project. `GET /projects/{project}/subscriptions` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--filter-status` | string |  | `pending`, `active`, `suspended` or `ended`. |

### `ph24 subscriptions pay-ahead <subscription>` 💶

Pay a service ahead. `POST /projects/{project}/subscriptions/{subscription}/pay-ahead` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--periods` | integer | required | How many periods (months, or 30 days on the cycle of the previous system) to pay ahead now: 1–12, at most what `GET …/pay-ahead` still offers. |

### `ph24 subscriptions pay-ahead-quote <subscription>`

Preview paying a service ahead. `GET /projects/{project}/subscriptions/{subscription}/pay-ahead` · ability `services.manage` · beta

### `ph24 subscriptions plan <subscription>` 💶

Change the plan. `PUT /projects/{project}/subscriptions/{subscription}/plan` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--keep-disk` | boolean |  | Servers only: keep the current disk size on an upgrade, so a later downgrade works without reinstalling. Default false. |
| `--plan-id` | string | required | The new plan (`pln_…`): same plan group, or a regular plan when the service is a promotion. |
| `--reinstall` | json |  | Servers only, when the new plan's disk is smaller (S-028 R25): the server is reinstalled, everything on its disk is deleted. |

### `ph24 subscriptions plan-options <subscription>`

List the plans a service may change to. `GET /projects/{project}/subscriptions/{subscription}/plan-options` · ability `services.manage` · beta

### `ph24 subscriptions plan-quote <subscription>`

Preview a plan change. `GET /projects/{project}/subscriptions/{subscription}/plan-quote` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--plan-id` | string | required | The plan to price (`pln_…`), one of `plan-options`. |
| `--keep-disk` | 0\|1 |  | Servers only: `1` keeps the current disk size on an upgrade; default `0`. |

### `ph24 subscriptions renew <subscription>` 💶

Renew a suspended or expired service. `POST /projects/{project}/subscriptions/{subscription}/renew` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--auto-renew` | boolean |  | With `prepay`: `true` = you agree that the prepayment renews automatically with the same period and discount (can be turned off any time). Never assumed. |
| `--billing` | hourly\|monthly_advance\|prepay |  | `hourly`, `monthly_advance` or `prepay` (3, 6 or 12 months in advance at the plan's discount). Missing = the product's default. Only options the catalog lists for the product / plan. |
| `--follow-up` | hourly\|monthly_advance |  | With `prepay`: how the service is billed after the prepayment if it isn't renewed, `hourly` or `monthly_advance`. Missing = the product's default. |
| `--prepay-months` | integer |  | With `prepay`: 3, 6 or 12 months (the plan's `prepayment` periods). |

## vps

### `ph24 vps activity <vps>`

List the server's activity. `GET /projects/{project}/vps/{vps}/activity` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 vps backup-job <vps>`

Set the daily backup. `PUT /projects/{project}/vps/{vps}/backup-job` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--enabled` | boolean | required | `false` pauses the daily backups; the kept ones stay. |
| `--keep` | integer | required | Daily backups to keep, 1 to the slots. |
| `--minute` | integer | required | Minute of the day in UTC, 0–1439. |

### `ph24 vps backups create <vps>`

Back up now. `POST /projects/{project}/vps/{vps}/backups` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--replace` | boolean |  | Replace the oldest unprotected backup when all slots are used. |

### `ph24 vps backups delete <vps> <backup>` ⚠

Delete a backup. `DELETE /projects/{project}/vps/{vps}/backups/{backup}` · ability `services.manage` · beta

### `ph24 vps backups list <vps>`

List backups. `GET /projects/{project}/vps/{vps}/backups` · ability `services.view` · beta

### `ph24 vps backups update <vps> <backup>`

Protect a backup. `PATCH /projects/{project}/vps/{vps}/backups/{backup}` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--protected` | boolean | required | `true` protects the backup, `false` lets the daily job remove it again. |

### `ph24 vps commands list <vps>`

List command runs. `GET /projects/{project}/vps/{vps}/commands` · ability `services.manage` · beta

### `ph24 vps devices <vps>`

List a server's disks and devices. `GET /projects/{project}/vps/{vps}/devices` · ability `services.view` · beta

### `ph24 vps disks create <vps>` 💶

Add a disk. `POST /projects/{project}/vps/{vps}/disks` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--addon-id` | string | required | The disk type: an addon (`add_…`) of the server's offer whose resource is `disk_<class>_gb`. |
| `--size-gb` | integer | required | Size in GB: a multiple of the disk type's `step` (e.g. 500), at least `min_steps` × `step`, and with the server's other disks of that type at most `max_steps` × `step` (otherwise 422 on `size_gb`). |

### `ph24 vps disks delete <vps> <slot>` ⚠

Remove a disk. `DELETE /projects/{project}/vps/{vps}/disks/{slot}` · ability `services.manage` · beta

### `ph24 vps firewalls apply <vps>`

Apply a server's firewalls again. `POST /projects/{project}/vps/{vps}/firewalls/apply` · ability `services.manage` · beta

### `ph24 vps firewalls effective <vps>`

Get a server's effective rules. `GET /projects/{project}/vps/{vps}/firewalls/effective` · ability `services.view` · beta

### `ph24 vps firewalls get <vps>`

Get a server's firewalls. `GET /projects/{project}/vps/{vps}/firewalls` · ability `services.view` · beta

### `ph24 vps firewalls update <vps>`

Set a server's firewalls. `PUT /projects/{project}/vps/{vps}/firewalls` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--body-dry-run` | boolean |  | Only check (lockout warning and `preview`), save nothing. |
| `--firewalls` | string[] | required | `fw_…` of this project, in evaluation order (the first one is evaluated first): the complete list, it replaces the current one; empty switches the firewall off. |
| `--version` | string |  | The `version` of the server's firewalls the list was made from: `conflict` (409) when they changed since. |

### `ph24 vps firewalls v1-note <vps>` ⚠

Dismiss the note about the previous system. `DELETE /projects/{project}/vps/{vps}/firewalls/v1-note` · ability `services.manage` · beta

### `ph24 vps get <vps>`

Get a server. `GET /projects/{project}/vps/{vps}` · ability `services.view` · beta

### `ph24 vps guest <vps>`

Show guest info. `GET /projects/{project}/vps/{vps}/guest` · ability `services.view` · beta

### `ph24 vps handovers list <vps>`

List a server's hand-overs. `GET /projects/{project}/vps/{vps}/handovers` · ability `services.handover` · beta

### `ph24 vps isos <vps>`

ISOs for the CD drives. `GET /projects/{project}/vps/{vps}/isos` · ability `services.view` · beta

### `ph24 vps jobs create <vps>`

Add a job. `POST /projects/{project}/vps/{vps}/jobs` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--action` | start\|shutdown\|reboot\|stop |  | For `power`. |
| `--command` | string |  | For `guest_command`, up to 2000 characters. |
| `--day` | integer |  | Monthly: 1–31. |
| `--enabled` | boolean | required | `false` keeps the job but doesn't run it. |
| `--kind` | power\|guest_command | required | `power` or `guest_command`. |
| `--minute` | integer | required | Minute of the day in `timezone`, 0–1439. |
| `--schedule` | daily\|weekly\|monthly | required | `daily`, `weekly` (with `weekday`) or `monthly` (with `day`). |
| `--timezone` | string | required | IANA time zone, e.g. `Europe/Berlin`. |
| `--weekday` | integer |  | Weekly: 1 (Monday) to 7 (Sunday). |

### `ph24 vps jobs delete <vps> <job>` ⚠

Delete a job. `DELETE /projects/{project}/vps/{vps}/jobs/{job}` · ability `services.manage` · beta

### `ph24 vps jobs list <vps>`

List jobs. `GET /projects/{project}/vps/{vps}/jobs` · ability `services.view` · beta

### `ph24 vps jobs update <vps> <job>`

Change a job. `PATCH /projects/{project}/vps/{vps}/jobs/{job}` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--action` | start\|shutdown\|reboot\|stop |  | For `power`. |
| `--command` | string |  | For `guest_command`, up to 2000 characters. |
| `--day` | integer |  | Monthly: 1–31. |
| `--enabled` | boolean | required | `false` keeps the job but doesn't run it. |
| `--kind` | power\|guest_command | required | `power` or `guest_command`. |
| `--minute` | integer | required | Minute of the day in `timezone`, 0–1439. |
| `--schedule` | daily\|weekly\|monthly | required | `daily`, `weekly` (with `weekday`) or `monthly` (with `day`). |
| `--timezone` | string | required | IANA time zone, e.g. `Europe/Berlin`. |
| `--weekday` | integer |  | Weekly: 1 (Monday) to 7 (Sunday). |

### `ph24 vps list`

List the servers of a project. `GET /projects/{project}/vps` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--filter-state` | string |  | `provisioning`, `running`, `stopped`, `provision_failed`, `deleting`, `deleted` or `released_to_v1`. |

### `ph24 vps media <vps>`

Set the CD drives and boot order. `PUT /projects/{project}/vps/{vps}/media` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--boot` | disk\|cd | required | `disk` (default) or `cd`: boot from the CD drives first. Takes effect at the next start or reboot. |
| `--ide0` | string | required | ISO in the first CD drive (`iso_…`, see `GET …/vps/{vps}/isos`), or null for empty. |
| `--ide1` | string | required | ISO in the second CD drive, or null. |

### `ph24 vps port25 <vps>`

Unblock port 25 for outgoing mail. `POST /projects/{project}/vps/{vps}/port25-request` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--accept-rules` | yes\|on\|1\|1\|true\|true | required | Must be `true`: you confirm the mail rules of the terms (§ 6 (10) no unsolicited traffic, § 14 no spam). |
| `--use` | string |  | Optional, plain text, up to 500 characters: what the server sends mail for. Goes into the ticket when one is opened. |

### `ph24 vps power <vps>`

Start, shut down, reboot, stop or reset a server. `POST /projects/{project}/vps/{vps}/power` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--action` | start\|shutdown\|reboot\|stop\|reset | required | `start` (stopped server), `shutdown` (ACPI, up to 3 minutes), `reboot`, `stop` (hard, like pulling the plug) or `reset` (hard restart). |

### `ph24 vps rdns get <vps>`

Reverse DNS of the server. `GET /projects/{project}/vps/{vps}/rdns` · ability `services.view` · beta

### `ph24 vps rdns set <vps>`

Set reverse DNS. `PUT /projects/{project}/vps/{vps}/rdns` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--address` | string | required | An IPv4 address of the server, or any address inside its IPv6 /64. |
| `--hostname` | string | required | e.g. `mail.example.com`; null removes it (an IPv4 gets our default back). |

### `ph24 vps reinstall <vps>` ⚠

Reinstall a server. `POST /projects/{project}/vps/{vps}/reinstall` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--os-image-id` | string | required | The new operating system (`osi_…`), one offered in the server's location (`/public/vps/os-images`). |
| `--password` | string |  | Root password: 12–128 characters with upper and lower case letters, a digit and a symbol, not the hostname, not known from data breaches. Never stored. |
| `--ssh-key-ids` | string[] |  | SSH keys of your account (`sshk_…`) for root. At least one key or a password. |
| `--wipe-additional-disks` | boolean |  | Also wipe the additional disks: they are created again, empty, with the same slots and sizes. Default false: they are kept as they are. |

### `ph24 vps root-password method <vps>`

Check how a password reset works. `GET /projects/{project}/vps/{vps}/root-password` · ability `services.manage` · beta

### `ph24 vps rotate <vps>` ⚠

Change an address. `POST /projects/{project}/vps/{vps}/rotate` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--family` | ipv4\|ipv6 | required | `ipv4` (the primary address) or `ipv6` (the /64). |

### `ph24 vps stats <vps>`

Show the server's history. `GET /projects/{project}/vps/{vps}/stats` · ability `services.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--range` | string |  | `hour`, `day`, `week` or `month`. |

### `ph24 vps traffic <vps>`

Show the server's traffic. `GET /projects/{project}/vps/{vps}/traffic` · ability `services.view` · beta

### `ph24 vps update <vps>`

Change a server's hostname or name. `PATCH /projects/{project}/vps/{vps}` · ability `services.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--hostname` | string |  | e.g. `server1` or `server1.example.com`: letters, digits and dashes, dots between the parts. The server takes it at its next restart; every reinstall uses it. |
| `--label` | string |  | The name shown instead of the hostname (only in the panel and the API, the server itself keeps its hostname); at most 64 characters, empty or null removes it. |

## webhostings

### `ph24 webhostings dns check <webhosting>`

Check public DNS now. `POST /projects/{project}/webhostings/{webhosting}/dns/check` · ability `webhosting.view` · beta

### `ph24 webhostings dns sync <webhosting>`

Sync the DNS records now. `POST /projects/{project}/webhostings/{webhosting}/dns/sync` · ability `webhosting.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--replace` | boolean |  | Your records that stand in the way of a conflict are removed and the hosting's are written. |

### `ph24 webhostings dns sync-setting <webhosting>`

Turn the DNS sync with Plesk on or off. `PUT /projects/{project}/webhostings/{webhosting}/dns/sync-setting` · ability `webhosting.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--enabled` | boolean | required | `true` turns the sync with Plesk on (a sync starts), `false` off (the records in the zone stay as your own). |

### `ph24 webhostings domain <webhosting>` ⚠

Change the main domain. `POST /projects/{project}/webhostings/{webhosting}/domain` · ability `webhosting.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--domain` | string | required | The new main domain, `shop.example.com`. |
| `--mail-system` | plesk\|none\|mailcow |  | `plesk`, `none`, or `mailcow` for a domain registered with us. Default `plesk`; a domain on `mailcow` stays there. |

### `ph24 webhostings domain-facts`

Look at a domain before using it. `GET /projects/{project}/webhostings/domain-facts` · ability `webhosting.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--name` | string | required | The domain with its ending, e.g. `example.com`. |

### `ph24 webhostings get <webhosting>`

Get a webhosting. `GET /projects/{project}/webhostings/{webhosting}` · ability `webhosting.view` · beta

### `ph24 webhostings list`

List the webhostings of a project. `GET /projects/{project}/webhostings` · ability `webhosting.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--q` | string |  | Part of the main domain. |
| `--sort` | string |  | `domain`, `state` or `created`, with `-` in front for descending. |
| `--filter-state` | string |  | `provisioning`, `active`, `suspended`, `held`, `deleting`, `deleted` or `provision_failed`. |

### `ph24 webhostings login <webhosting>`

Log in to Plesk. `POST /projects/{project}/webhostings/{webhosting}/login` · ability `webhosting.login` · beta

### `ph24 webhostings operations get <webhosting> <operation>`

Get something in progress on a webhosting. `GET /projects/{project}/webhostings/{webhosting}/operations/{operation}` · ability `webhosting.view` · beta

### `ph24 webhostings sites detached <webhosting> <site> <record>` ⚠

Give a kept record back to the sync. `DELETE /projects/{project}/webhostings/{webhosting}/sites/{site}/detached/{record}` · ability `webhosting.manage` · beta

### `ph24 webhostings sites list <webhosting>`

List the sites of a webhosting. `GET /projects/{project}/webhostings/{webhosting}/sites` · ability `webhosting.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |

### `ph24 webhostings sites mail <webhosting> <site>`

Change the mail system of a site. `PUT /projects/{project}/webhostings/{webhosting}/sites/{site}/mail` · ability `webhosting.manage` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--mail-system` | plesk\|none\|mailcow | required | `plesk`, `none`, or `mailcow` for a domain registered with us. |

### `ph24 webhostings sites records <webhosting> <site>`

List the records of a site. `GET /projects/{project}/webhostings/{webhosting}/sites/{site}/records` · ability `webhosting.view` · beta

| Flag | Type | | Description |
|---|---|---|---|
| `--limit` | integer |  | Page size, 1–100. |
| `--cursor` | string |  | From `meta.next_cursor` of the previous page. |
| `--q` | string |  | Part of the name or value. |
| `--filter-type` | string |  | A record type, e.g. `MX`. |
| `--filter-state` | string |  | `wanted`, `conflict` or `detached`. |

### `ph24 webhostings sites zone <webhosting> <site>`

Use our nameservers for a site. `POST /projects/{project}/webhostings/{webhosting}/sites/{site}/zone` · ability `webhosting.manage` · beta

### `ph24 webhostings usage get <webhosting>`

Get the usage of a webhosting. `GET /projects/{project}/webhostings/{webhosting}/usage` · ability `webhosting.view` · beta

### `ph24 webhostings usage refresh <webhosting>`

Read the usage again. `POST /projects/{project}/webhostings/{webhosting}/usage/refresh` · ability `webhosting.view` · beta

## Error types

| Type | Status | Meaning |
|---|---|---|
| `validation-failed` | 422 | The request is invalid. |
| `bad-request` | 400 | The request could not be read. |
| `unauthenticated` | 401 | Not logged in. |
| `invalid-credentials` | 401 | The login details are not correct. |
| `email-not-verified` | 403 | The e-mail address is not confirmed yet. |
| `sudo-required` | 403 | Please confirm it's you. |
| `link-invalid` | 410 | This link is invalid or has expired. |
| `session-required` | 403 | This is only possible in the customer area, not with an API token. |
| `two-factor-required` | 403 | This organization requires two-factor authentication. |
| `token-ip-not-allowed` | 403 | This API token may not be used from this IP address. |
| `invitation-email-mismatch` | 403 | This invitation is for a different e-mail address. |
| `impersonation-blocked` | 403 | Not possible while ph24 support is logged in as this customer. |
| `account-locked` | 403 | This account is locked. |
| `forbidden` | 403 | Missing permission for this action. |
| `organization-restricted` | 403 | This is not available for this organization at the moment. |
| `not-found` | 404 | Not found. |
| `method-not-allowed` | 405 | This method is not allowed here. |
| `conflict` | 409 | The request conflicts with the current state. |
| `operation-in-progress` | 409 | Another action is running on this server. |
| `service-suspended` | 409 | This service is suspended. |
| `service-locked` | 409 | This service is locked. |
| `service-suspended-by-staff` | 409 | ph24 support suspended this service. |
| `already-member` | 409 | This person is already a member. |
| `last-owner` | 409 | An organization needs at least one owner. |
| `not-empty` | 409 | This can only be deleted when it is empty. |
| `price-changed` | 409 | The price changed. |
| `limit-reached` | 409 | A limit was reached. |
| `not-orderable` | 422 | This can't be ordered right now. |
| `change-not-allowed` | 409 | This change is not possible. |
| `legacy-plan-change-first` | 422 | This contract from the previous system takes no extras until it changes to a current plan. |
| `fee-not-confirmed` | 409 | This change costs a fee. |
| `insufficient-credit` | 422 | Not enough credit. |
| `billing-profile-incomplete` | 422 | The billing profile is incomplete. |
| `verification-limit-reached` | 422 | No identity verification attempt left. |
| `ssh-key-exists` | 422 | This SSH key was added already. |
| `credit-limit-reached` | 422 | Credit limit reached. |
| `quota-exceeded` | 422 | Usage limit reached. |
| `postpaid-not-possible` | 422 | Payment by invoice not possible. |
| `payment-method-unusable` | 422 | This payment method can't be used. |
| `payment-status-unclear` | 409 | Payment status unclear. |
| `prepayment-not-refundable` | 422 | The prepayment can only end at the end of its period. |
| `code-invalid` | 422 | This code is invalid or was already used. |
| `code-locked` | 422 | Too many wrong tries for this code. |
| `voucher-limit-reached` | 422 | The gift voucher limit for new organizations is reached. |
| `export-limit` | 409 | One data export per day. |
| `account-pending-deletion` | 403 | This account is being deleted. |
| `account-moving` | 403 | This account is being moved. |
| `deletion-blocked` | 422 | The account can't be deleted yet. |
| `payload-too-large` | 413 | The request body is too large. |
| `idempotency-key-required` | 422 | An Idempotency-Key header is required. |
| `idempotency-conflict` | 422 | This Idempotency-Key was already used for a different request. |
| `idempotency-in-progress` | 409 | A request with this Idempotency-Key is still being processed. |
| `rate-limited` | 429 | Too many requests. |
| `in-use` | 409 | This is still in use. |
| `external-network-read-only` | 409 | The public network can't be changed. |
| `no-address-available` | 409 | No address is available. |
| `next-hop-not-connected` | 422 | The next hop is not in an attached subnet. |
| `next-hop-in-use` | 422 | The next hop is an address of the router itself. |
| `external-network-unreachable` | 409 | The public network can't be reached from this subnet. |
| `address-not-held` | 409 | The address isn't on one of the project's resources right now. |
| `already-assigned` | 409 | This already has one. |
| `provider-unavailable` | 503 | An external service is temporarily unavailable. |
| `guest-agent-command-disabled` | 422 | The QEMU guest agent in the server does not allow this command. |
| `guest-agent-unavailable` | 422 | No QEMU guest agent answers in the server. |
| `guest-agent-timeout` | 422 | The QEMU guest agent in the server did not answer in time. |
| `vps-guest-agent-unavailable` | 409 | The server can't be shut down or rebooted cleanly: its QEMU guest agent does not answer. |
| `vps-firewall-unmanaged` | 409 | The firewall of this server is released by ph24. |
| `service-unavailable` | 503 | The service is temporarily unavailable. |
| `affiliate-terms-required` | 422 | The partner terms need to be accepted first. |
| `dpa-version-outdated` | 409 | The data processing agreement has a newer version. |
| `captcha-failed` | 422 | The security check failed. |
| `immediate-start-required` | 422 | Confirm that the service starts at once. |
| `cloud-consent-required` | 422 | Activate the cloud for this project first. |
| `terms-acceptance-required` | 409 | Accept the new terms first. |
| `rule-exists` | 409 | An identical rule exists already. |
| `last-firewall` | 409 | A server needs at least one firewall. |
| `managed-firewall` | 409 | This firewall is managed by a Kubernetes cluster or a load balancer. |
| `managed-by-kubernetes` | 409 | This is managed by a Kubernetes cluster. |
| `cloud-not-set-up` | 409 | The project's cloud isn't set up yet. |
| `certificate-invalid` | 422 | The certificate can't be used. |
| `flavor-not-offered` | 422 | This load balancer size isn't offered. |
| `server-error` | 500 | An internal error occurred. |
| `staff-ability-missing` | 403 | This staff account may not do this. |
| `confirmation-required` | 422 | This change needs a confirmation. |
| `firewall-limit-reached` | 409 | A firewall limit was reached. |
| `handover-email-mismatch` | 403 | This hand-over was sent to a different e-mail address. |
| `handover-not-pending` | 409 | This hand-over is no longer open. |
| `service-handover-pending` | 409 | This service is being handed over to another customer. |
