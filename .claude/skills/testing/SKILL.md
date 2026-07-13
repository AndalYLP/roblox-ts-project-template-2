---
name: testing
description: Write, run, and debug Jest tests in this roblox-ts project — the dev:test harness, constructing Flamework services without DI, seeding Charm atoms, the client-spec gating, and stale-build recovery. Use when adding or running tests, or when a build looks stale ("attempt to call a table value", rojo path errors, missing out/test files).
---

# Testing

Tests use `@rbxts/jest`, live next to source as `*.spec.ts` under `test/{server,shared,client}`.

## Running

- **`pnpm dev:test`** — compile + build place + run via `run-in-roblox`. Use this to verify. It also
  exercises the real client runtime (App + UI mount), so client-runtime errors surface here.
- **Do NOT** manually `rm -rf out` / run raw `rbxtsc` to "clean-build" — the first pass after removing
  `out/` often skips top-level `out/test/*.luau`, and `tsbuildinfo` then thinks they're done. This
  self-inflicted flakiness looks like a rojo "path not found" or missing runtime file.
- **Stale build** (`attempt to call a table value` at every `@Service`, or missing `out/test`): run
  `pnpm clean` **once**, then `pnpm dev:test`.
- Cloud: `pnpm dev:cloud_test` (Lune + Open Cloud, needs `.env`). Cloud runs **server-only** in a real
  universe — see gotchas below.

## Harness

`test/runtime.server.ts` runs `runCLI` over three roots: `ServerScriptService.TS.__test__` (test/server),
`ReplicatedStorage.TS.__test__` (test/shared), and — because it adds it — `StarterPlayerScripts.TS.__test__`
(test/client). `run-in-roblox` runs at plugin level where `RunService:IsClient()` is **true**, so client
specs load there.

## Writing service tests (no Flamework)

Construct services directly and pass stubbed deps — do NOT ignite Flamework.

- Helpers: `test/server/support/service-stubs.ts` — `makeLogger()` (records calls per level),
  `fakePlayer(id)`, `makePlayerData(overrides?)`, `makePlayerEntity(id)`, `resetPlayerAtoms()`.
- `beforeEach`: `resetPlayerAtoms()`, then `new SomeService(makeLogger().logger, {} as unknown as Dep, ...)`.
- **Private methods/fields**: cast to an `...Internals` interface. Declare methods with **shorthand
  syntax** (`foo(x: number): void`) so roblox-ts emits self-aware `:` calls against the instance:
  ```ts
  interface FooInternals { bar: Map<...>; doThing(x: number): void; }
  const internals = service as unknown as FooInternals;
  ```
- **Seed atoms** with `setPlayerData(userId, makePlayerData({...}))`; assert via the atom getters.
- If a service's constructor creates a Lapis collection (PlayerDataService), build it **once** at
  module scope — Lapis rejects duplicate collection names across `beforeEach` rebuilds.
- Stub collaborators that hit the network/other services with a cast object
  (`{ logCurrencyGranted: () => {} } as unknown as AnalyticsService`) so tests stay offline.
- Time-based logic (daily reward): `math.floor(t / DAY)` day-index diffs are exact, so seed
  `lastClaimTime = os.time() - N * DAY` relative to `os.time()`.

## Gotchas

- **Config-driven enums** (`types/enums/mtx`, `badge`) call `getConfigValueForGame` at module load,
  which `assert`s on `game.GameId`. It resolves in the dev/test env. In tests, always use the enum
  **values** (`product.Example`, `gamePass.Example`, `badge.Welcome`) — never string literals — so the
  `t.literal` validators built from the same enum accept them.
- **Client-only modules can't run server-side**: `3dSound` hard-errors unless `IsClient()`, and
  `client/constants/player` dereferences `LocalPlayer`. `run-in-roblox` (IsClient true) tolerates them,
  but **Open Cloud is server-only** → `audio.spec` is skipped there via `testPathIgnorePatterns` in
  `test/client/jest.config.ts` (gated on `RunService.IsClient()`). Gate any spec that loads a
  client-only guard the same way.
- **Vide UI is not jest-testable**: Vide requires its internal modules by string, and jest-lua blocks
  require-by-string. Test logic/state, not rendered Vide.
- **Cross-container imports fail to compile**: server/shared specs can't import `client/**` (isolated
  container). Client tests live in `test/client` (the client container).
