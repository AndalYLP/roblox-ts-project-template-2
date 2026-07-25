# CLAUDE.md

An opinionated **roblox-ts** game template built on **Flamework** (DI/lifecycle), **Charm** (state +
server→client sync), **Lapis** (data), **Vide** (UI), and **Centurion** (commands). TypeScript →
Luau, synced with **Rojo**.

## Commands

- `pnpm dev:watch` — compile in watch mode + sync to Studio (everyday dev).
- **`pnpm dev:test`** — the standard verification: compiles, builds the place, and runs Jest via
  `run-in-roblox`. **Always verify with this.** Do NOT manually `rm -rf out` / run raw `rbxtsc` — that
  causes incremental-build flakiness (missing `out/test/*`, rojo "path not found").
- `pnpm dev:cloud_test` — headless tests via Lune/Open Cloud (needs `.env` creds).
- `pnpm dev:compile` — `rbxtsc` only. Use it to read type errors directly: `dev:build`/`dev:test` run
  the compiler quietly, so a compile failure surfaces as a confusing downstream rojo error instead.
- `pnpm lint` — `eslint src` (CI lints `src` only; the perfectionist plugin sorts imports/members, so
  run `eslint --fix`).
- `pnpm assets:upload` — **Asphalt** uploads assets under `assets/**/*` and regenerates the typed
  `assets` module (`src/shared/constants/assets/`). See the `assets` skill.

### Patched dependencies

`patches/` holds pnpm patches registered under `pnpm.patchedDependencies`. **Charm 0.11 and charm-sync
0.4 require their own internals by string** (`require("@self/system")`), which jest-lua rejects
("Require-by-string is not enabled for use inside Jest") — that makes *every* spec importing Charm fail
to load. The patches rewrite those to instance requires (`require(script.system)`). **Re-create them if
you bump Charm.**

`pnpm install` runs `prepare`, which uses `cp` and **fails on Windows**, aborting patch application.
Install with `pnpm install --ignore-scripts`.

### Stale-build recovery

If you hit `attempt to call a table value` (broken Flamework decorators), a rojo "path not found", or
missing `out/test/*.luau`, the incremental build (Flamework/rbxts-build) is stale. Fix with **one**
`pnpm clean` then `pnpm dev:test`. This is rare — don't clean on every run.

If a build still fails at rojo with "path not found" afterwards, it's usually **not** rojo: a failed
`rbxtsc` leaves `out/` empty and rojo then can't resolve its `$path`s. Run `pnpm dev:compile` to see
the real type errors.

A stale build **skips files silently, hiding real type errors** — specs keep "passing" against stale
compiled output. If something compiles but behaves impossibly, clean-compile before believing it.

## Layout

- `src/client` — controllers, UI (Vide), client runtime. **Isolated client container** (StarterPlayerScripts).
- `src/server` — Flamework services (player, data, mtx, analytics, daily-reward, settings…), Centurion commands.
- `src/shared` — Charm atoms/state, network definitions, config (`functions/`), constants, components.
- `src/replicated-first` — ReplicatedFirst (loading-screen bridge cover); **must be self-contained (no imports)**.
- `src/types`, `src/utils` — enums/interfaces, helpers. `test/{server,shared,client}` — Jest specs.

## Key conventions

- **Store-driven, not events**: player state syncs to the client via Charm. Prefer a client
  `subscribe(...)` to an atom over a redundant server→client event (skip the initial emission with
  `!previous`). See `NotificationController` reacting to daily-reward claims.
- **Config-driven values** (`gamePass`, `product`, `badge`) resolve via `getConfigValueForGame`
  (`shared/functions/game-config.ts`) keyed by `GameId`. Pure config/logic lives in
  `shared/functions/`, **not** in store atoms.
- **Player data slice**: add an atom file under `shared/store/atoms/player/` (state accessors only),
  add the field to `PlayerData` (`.../atom.ts`) and to `defaultPlayerData`
  (`server/services/player/data/schema.ts`).
- **Analytics**: inject `AnalyticsService` and use its predefined catalog (`Currency`, `CustomEvent`,
  `Funnels`, `ONBOARDING_STEPS`) — don't scatter raw strings.
- **UI**: use the primitives in `client/ui/components/primitive/` (never raw `<frame>`/`<textlabel>`/
  `<textbutton>`); extra props go through the `native` prop.
- **Extracting subsystems** from a large component/service: pull cohesive logic into a plain class
  that takes a **`Context` interface**. Declare that context's members as `readonly` **function-type
  properties** (`readonly foo: () => T`), **not** method shorthand — roblox-ts then emits self-free
  `.` calls, matching the **arrows capturing `this`** the parent implements them with (a method-shorthand
  member compiles to a `:` call and shifts every argument by one). Keep owned/shared state in the parent;
  the class holds only its own choreography. The subsystem is then unit-testable by stubbing the context
  (see the `testing` skill).

## Skills

- `testing` — writing/running tests, the server-only harness, client-spec gating, stale-build recovery.
- `vide-ui` — building UI with the primitives, reactivity, and UI-Labs stories.
- `server-features` — adding services, data slices, network remotes, and analytics.
- `centurion-commands` — adding dev/admin slash commands, groups, argument types, and guards.
- `assets` — adding/using image assets via Asphalt (`assets/`, `pnpm assets:upload`, the `images` module).
