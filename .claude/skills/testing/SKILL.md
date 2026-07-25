---
name: testing
description: Write, run, and debug Jest tests in this roblox-ts project — the dev:test harness, constructing Flamework services without DI, seeding Charm atoms, the client-spec gating, patched require-by-string deps, and stale-build recovery. Use when adding or running tests, or when a build looks stale ("attempt to call a table value", rojo path errors, missing out/test files).
---

# Testing

Tests use `@rbxts/jest`, live next to source as `*.spec.ts` under `test/{server,shared,client}`.

## Running

- **`pnpm dev:test`** — compile + build place + run via `run-in-roblox`. Use this to verify. It also
  exercises the real client runtime (App + UI mount), so client-runtime errors surface here.
- `pnpm dev:cloud_test` — Lune + Open Cloud, headless (needs `.env`). Cloud runs **server-only** in a
  real universe — see gotchas below.
- `pnpm dev:compile` — typecheck only. Reach for it when a build fails downstream: `dev:test` runs the
  compiler quietly, so a type error shows up as a puzzling rojo "path not found" (empty `out/`) rather
  than as the error itself.
- **Do NOT** manually `rm -rf out` / run raw `rbxtsc` to "clean-build" — the first pass after removing
  `out/` often skips top-level `out/test/*.luau`, and `tsbuildinfo` then thinks they're done. This
  self-inflicted flakiness looks like a rojo "path not found" or missing runtime file.
- **Stale build** (`attempt to call a table value` at every `@Service`, or missing `out/test`): run
  `pnpm clean` **once**, then `pnpm dev:test`.
- A stale build **hides type errors** by skipping files, so specs keep "passing" against stale output.
  If something compiles but behaves impossibly, clean-compile before believing it.
- If the runner itself never starts (Studio won't come online, "file not found"), that's environmental,
  not your code — check that `dev:compile` and the rojo build pass, then debug the runner separately.

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
- Stub collaborators that hit the network/other services with a cast object so tests stay offline.
  Declare any stub that inspects its arguments with **method shorthand, not an arrow** — the service
  calls it as a method, so roblox-ts passes `self` first and an arrow silently shifts every argument
  by one. Prefer stubs that **record** calls over no-op stubs, so a missing call fails a test instead
  of passing quietly:
  ```ts
  const analytics = {
      logCurrencyGranted: () => {},                             // ok: ignores its args
      logCustomEvent(_player: Player, event: string) {          // shorthand absorbs `self`
          customEvents.push(event);
      },
  } as unknown as AnalyticsService;
  ```
  A no-op stub also breaks the moment the service starts calling a method it doesn't have
  (`attempt to call missing method '<x>' of table`) — add the method when you add the call.
- **Context-based subsystems** (a class that takes a `FooContext` of callbacks instead of
  Flamework DI — see the "subsystem extraction" convention in CLAUDE.md) test the same way:
  `new Subsystem(stubContext)`, no Flamework. Two stub styles coexist in one context — the
  **class-instance collaborators** it hands in (another subsystem, a service…) are called as methods,
  so stub those with **method shorthand** (absorbs `self`); the context's own **function-type
  properties** (`readonly onX: () => void`) are called with `.`, so stub those with **arrows**.
  Capture a `schedule(secs, cb)`-style property to fire timers synchronously in the test.
  Logic-only paths test cleanly; paths that `task.wait` or touch real `Instance`s aren't
  unit-testable — cover those with `dev:test` / in Studio.
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
- **Require-by-string breaks jest-lua**, with `Require-by-string is not enabled for use inside Jest at
  this time`. Any dependency that requires its own internals by string (`require("@self/x")`,
  `require("./x")`, `require("../x")`) makes **every spec importing it fail to load** — the whole suite
  goes red at once while unrelated specs (ones that don't import it) still pass. That signature —
  near-total failure with one identical error — means a dep, not your code.
  - Charm 0.11 / charm-sync 0.4 do this. `patches/` rewrites them to instance requires
    (`@self/x` → `script.x`, `./x` → `script.Parent.x`, `../X` → `script.Parent.Parent.X`).
    **Re-create the patches on upgrade**, and install with `pnpm install --ignore-scripts` (the
    `prepare` script uses `cp` and fails on Windows, aborting patch application).
  - A `require("...")` guarded by `if not script then` is fine — it's unreachable inside Roblox.
- **Vide UI is not jest-testable**: same root cause (Vide requires its internals by string). Test
  logic/state, not rendered Vide.
- **Cross-container imports fail to compile**: server/shared specs can't import `client/**` (isolated
  container). Client tests live in `test/client` (the client container).
