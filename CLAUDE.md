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
- `pnpm lint` — `eslint src` (CI lints `src` only; the perfectionist plugin sorts imports/members, so
  run `eslint --fix`).

### Stale-build recovery

If you hit `attempt to call a table value` (broken Flamework decorators), a rojo "path not found", or
missing `out/test/*.luau`, the incremental build (Flamework/rbxts-build) is stale. Fix with **one**
`pnpm clean` then `pnpm dev:test`. This is rare — don't clean on every run.

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

## Skills

- `testing` — writing/running tests, the server-only harness, client-spec gating, stale-build recovery.
- `vide-ui` — building UI with the primitives, reactivity, and UI-Labs stories.
- `server-features` — adding services, data slices, network remotes, and analytics.
