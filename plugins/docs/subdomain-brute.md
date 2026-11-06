# Native subdomain brute-force monitor

`subdomain_brute` 1.1.1 is a small, self-contained monitor plugin. It delegates
the complete target batch to `Sentinel.Network.bruteForceSubdomains(request)`.
The host uses the shared Rust DNS engine and reads platform dictionaries natively;
the plugin never loads a platform wordlist into JavaScript or sends one DNS
request per dictionary entry.

The catalog declares DNS monitoring over root-domain assets and explicit seeds:

```json
{
  "monitor_type": "dns",
  "input_mode": "hybrid",
  "target_asset_types": ["domain_root"],
  "target_sources": ["surface_asset"],
  "seed_bindings": [
    { "seed_type": "root_domain", "input_key": "targets" },
    { "seed_type": "domain", "input_key": "targets" }
  ]
}
```

## Install and run

Rebuild and restart a Sentinel host that provides the native
`Sentinel.Network.bruteForceSubdomains` bridge. Import the local file
`plugins/bounty/subdomain_brute.ts` through plugin management, or install the
catalog entry after this source and `plugins.json` have been published. The
plugin is registered through the existing monitor plugin registry; the host
does not automatically seed or replace the user's installed plugins.

The source is `source/bounty/subdomain_brute/index.ts`; `build:monitors` generates
the self-contained published bundle under `plugins/bounty/`.

Configure the platform subdomain dictionary and add a DNS monitor using
`subdomain_brute`. The host resolves selected root-domain assets and explicit
root-domain/domain seed bindings into one `targets` list.
Targets and monitor execution context belong to the monitor task, rather than
global plugin defaults. A direct invocation can use:

```json
{
  "targets": ["example.test", "other.test"],
  "dictionary_id": "your-subdomain-dictionary-id",
  "dictionary": ["api", "admin"],
  "resolvers": ["127.0.0.1:5533"],
  "transport": "udp",
  "skip_wildcard": true,
  "bandwidth_limit": "3M",
  "dns_timeout_seconds": 10,
  "max_wait_seconds": 30
}
```

`targets` is the only target input. The plugin forwards it unchanged and rejects
`domain` and `domains`, including when `targets` is also present. The host filters
its generic target descriptors against this schema before execution. The native
monitor still rejects duplicates, omitted roots and foreign roots against its
trusted host batch; this check is never bypassed or relaxed.

`dictionary_id` and inline `dictionary` are forwarded unchanged. The native
engine validates dictionary contents and applies its normal selection
rules, including the configured default when no explicit source is supplied.
Timeouts, resolver errors, missing dictionaries and cancellation propagate as
failures. They are not converted to successful empty snapshots.

The ordinary monitor host currently keeps its existing 300-second execution
budget. `max_wait_seconds` is only the response wait window after the initial
batch has been sent; it does not extend that host budget. Callers choose a batch
size suitable for their dictionary, roots and bandwidth.

UDP is the plugin default for ordinary desktop permissions. Ethernet transport
is an explicit raw-packet choice and may require suitable device/OS permissions.
An unavailable transport is an explicit failure; the plugin never silently
switches transport or falls back to a JavaScript DNS implementation. Missing
native APIs produce an actionable host-update error.

## Optional dedicated DNS gateway (`dns_proxy`)

Large batches can exhaust a home router's NAT/conntrack table long before the
upstream resolvers struggle, which shows up as random timeouts and unstable
result counts. `dns_proxy` moves that traffic to a dedicated gateway whose local
shim carries every query over one long-lived TCP connection, so the home side
only ever holds a single NAT session.

The switch is strictly opt-in — only an explicit `enabled: true` changes the
resolver list, so existing behaviour and every earlier snapshot remain valid:

```json
{
  "targets": ["example.com"],
  "transport": "udp",
  "dns_proxy": { "enabled": true, "host": "127.0.0.1", "port": 5533 }
}
```

* `enabled` omitted or `false` → `resolvers` is left exactly as supplied.
* `enabled: true` → the gateway address is prepended to any explicit
  `resolvers`, and duplicates are removed.
* `host` must be an IPv4 literal because the native resolver API only accepts
  IPv4; `port` accepts 1–65535 and `53` is emitted without a suffix.
* `port` defaults to `5533`, matching the local shim. 5353 is deliberately not
  the default: it is the mDNS port and is normally already bound on macOS.
  When the shim runs on a different port, pass the same value here.
* `transport: "ethernet"` combined with `dns_proxy` is rejected explicitly: the
  raw-packet path always targets resolver port 53 and cannot address the
  gateway port.
* `dns_proxy` is consumed by the plugin and never forwarded to the native
  bridge, so native argument validation is unaffected.

Gateway deployment, macOS launchd autostart, operations commands and rollback
are documented in `tools/sentinel-dns-gateway/docs/README.md`.

## Host and result contracts

The bridge receives native snake_case arguments in one batch. Other supported
settings include `max_retries`, `verify_mode`, `verify_timeout_seconds`,
`verify_concurrency`, `resolve_records`, `query_types`, `raw_records` and `device`.
Their types, ranges and defaults are published by `get_input_schema()`.

The host-injected `__monitorExecution` object is forwarded unchanged. The host
checks its plugin-run identity and owns progress/cancellation context; callers
cannot substitute another monitor task. Compatibility capability declarations
are `network-scan` and `monitor-events`; they do not provide a missing host API.

Results retain native `targets`, `subdomains`, `results`, `change_events`,
`snapshots`, `summary` and `surface_artifacts`. The `changeEvents` compatibility
alias points at the same array as `change_events`. Standard surface persistence
uses `surface_artifacts`, including its `changes` array. Snapshot timestamps
remain `last_checked`. Old injected `previousSnapshots` and `lastChecked` values
are adapted to native names without changing the caller's objects.

## Offline validation

```sh
node --test scripts/subdomain_brute_test.mjs
deno test --allow-read scripts/plugin_manifest_test.ts
deno run --allow-read scripts/check_monitor_contracts.ts
deno run --allow-read scripts/plugin_catalog_smoke.ts
deno run --allow-read scripts/bounty_functional_test.ts
```

The new unit tests and catalog/functional scenarios use a deterministic mocked
native bridge. They cover schema/catalog agreement, one-call multi-target
execution, platform dictionary references, transport failures, legacy snapshots,
host-context pass-through, complete surface results and errors/cancellation.
These tests do not prove live DNS behavior or native OS packet permissions;
those require the host's separate native-engine acceptance.

## Native asset-monitor regression

From the Sentinel host checkout, with this sibling plugin checkout available:

```sh
rtk cargo test --manifest-path src-tauri/Cargo.toml -p sentinel-ai --lib --features db-sqlite --offline subdomain_monitor_tests -- --include-ignored --test-threads=1
```

The asset regressions create real root-domain inventory, resolve the host batch,
inject the complete asset payload, load the published plugin through QuickJS and
execute the Rust engine against a loopback UDP DNS server. They cover batches of
6 and 13 roots, one native call per batch, typed assets/evidence, acknowledged
results and persisted root snapshots. Separate negative requests confirm that
duplicate, omitted and foreign roots still fail the original native guard without
issuing DNS requests or changing acknowledged snapshots. The seed-mode regression
also exercises native dictionary loading and cancellation.

Native desktop acceptance on 2026-10-30 used independent SQLite state and a local
DNS fixture through the real **Run now** action:

| Asset roots | Saved targets | Imported assets | Subdomain evidence | Root snapshots |
| --- | --- | --- | --- | --- |
| 6 | 6/6 | 13 | 12 | 6 |
| 13 | 13/13 | 27 | 26 | 13 |

Both runs completed with acknowledged sequences fully checkpointed. The 38 DNS
responses produced 38 typed evidence rows; SQLite `quick_check` passed. Imported
asset counts include the discovered domains and one resolved IP per program.
These controlled runs establish the native monitor and persistence path; external
project DNS results depend on that project's resolver and network conditions.
