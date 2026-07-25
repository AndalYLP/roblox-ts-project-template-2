---
name: server-features
description: Add server/shared features in this roblox-ts project — Flamework services, Charm atoms + server→client sync, player data slices, network remotes, and analytics. Use when adding a service, a persistent data field, a network event, or a gameplay/monetization/retention feature.
---

# Server & shared features

Stack: **Flamework** (services, DI, lifecycle), **Charm** (atoms + `charm-sync`), **Lapis** (persistence),
**Flamework networking** (typed remotes).

## Services

- `@Service()` classes in `src/server/services/` are auto-loaded (`Flamework.addPaths("src/server/services")`).
  Constructor is DI — inject `Logger` and other services by type.
- Lifecycle: implement `OnStart`/`OnInit`; player lifecycle via `OnPlayerJoin`/`OnPlayerLeave` (fired by
  `PlayerService` with a `PlayerEntity`). Use `playerService.withPlayerEntity(cb)` to turn a
  `Player`-first callback into an entity-first one, e.g. when connecting a remote.
- Never let a background/marketplace/analytics call crash gameplay — wrap in `pcall` and log (see
  `AnalyticsService`, `MtxService`).
- **Log levels** (`setupLogger` in `shared/functions/logger.ts`): the sink routes `Warn`/`Error`/
  `Fatal` through Luau `warn()`/`error()`, which **Roblox surfaces on the dev dashboard** — reserve
  them for *real* problems a developer must act on (misconfig, failed requests, missing instances).
  `Info`/`Debug`/`Verbose` go through `print()`, never the dashboard. So:
  - **`Warn`/`Error`/`Fatal`** — dashboard-worthy problems only.
  - **`Info`** — notable gameplay/lifecycle events (a rope snapping, a penalty, a purchase), however
    dramatic. Ships to output in production.
  - **`Debug`/`Verbose`** — fine-grained diagnostics. The prod min level is `Information` (dev is
    `Debugging`), so these are **dropped in production** — use them freely for noisy dev-only detail.

## Player data (persisted)

Data is a Charm atom, persisted by Lapis and synced to the client. To add a slice:

1. New file `shared/store/atoms/player/<slice>.ts` — the interface + **state accessors only**
   (`getPlayer<Slice>Data`, and updaters via `updatePlayerData(userId, state => ({...}))`).
2. Add the field to `PlayerData` in `shared/store/atoms/player/atom.ts`.
3. Add its default to `defaultPlayerData` in `server/services/player/data/schema.ts`.

Put **config/pure logic** (reward tables, formulas) in `shared/functions/`, **not** in the atom file
(atoms are state only). Example: `shared/functions/daily-reward.ts`.

## Store-driven over events

Player atoms sync to the client via `charm-sync` (see **Sync** below). Prefer having the client
`subscribe(...)` to the atom and react, instead of firing a redundant server→client event — the state
already replicates. Detect a real change by ignoring the initial load:

```ts
subscribe(() => getPlayerDailyRewardData(USER_ID), (current, previous) => {
    if (!current || !previous || current.lastClaimTime === previous.lastClaimTime) return;
    // reacted to an actual change (not the first sync)
});
```

Only add a server→client remote when the client genuinely needs data that isn't in the store.

## Sync (charm-sync)

Three files: `shared/store/sync/atoms.ts` (`atoms` = the signal map, `GlobalAtoms = typeof atoms`),
`server/store/sync.server.ts`, `client/store/sync.client.ts`.

- **Privacy is enforced at the signal source, not on the payload.**
  `shared/store/sync/player-signals.ts` builds a per-client map: it spreads `...atoms` and overrides
  only `playersAtom.datastore` with a `computed` narrowed to that player's own entry. So every payload
  Charm produces is already scoped, and nothing downstream has to filter.
  **Spread, never re-list** — a re-listed map means each new atom must be remembered here or it
  silently stops syncing. Covered by `test/shared/store/player-signals.spec.ts`.
- **Client and server must register the same shape**, or keys won't match and sync dies *silently*
  (no error, the client just never updates). `client.addSignals(atoms)` and
  `server.addSignalsToClient<GlobalAtoms>(player, getPlayerSignals(userId))` both use the unwrapped
  map — wrapping either side (`{ atoms }`) prefixes every key. Nothing type-checks this agreement.
- `server.connect` / `client.patch` take an **array** of payloads per flush, not one (batching; see
  `config.preserveHistory`). Pass `<GlobalAtoms>` explicitly or the payload type widens to
  `ServerSignalMap`.

## Network

- Define remotes per domain in `shared/network/remotes/<x>.d.ts` (interfaces of
  `ClientToServer` / `ServerToClient` events), and register them in `shared/network/index.ts`
  (`ClientToServerEvents` / `ServerToClientEvents`).
- Server: `events.<x>.<event>.connect(this.playerService.withPlayerEntity((entity, ...args) => {...}))`.
  Flamework networking auto-guards arg types; still validate/clamp values with `@rbxts/t` +
  `math.clamp` for anything player-supplied.

## Config-driven values

IDs that differ per environment (game passes, products, badges) resolve through `getConfigValueForGame`
(`shared/functions/game-config.ts`) keyed by the `GameId` enum. `GameId.Development` should be the dev/
test universe id. These modules `assert` on `game.GameId`, so they load only in a configured place —
keep that in mind when a new service imports them.

## Analytics

Inject `AnalyticsService` and log through its **predefined catalog** so events aren't scattered as raw
strings: `Currency`, `CustomEvent`, `Funnels` (+ `logFunnelStep(player, Funnels.x, "Step")` derives the
index), `ONBOARDING_STEPS`, and the `logCurrencyGranted` / `logCurrencySpent` helpers. Add new funnels/
currencies/events to the catalog in `server/services/analytics.ts`.

## Test it

Server logic is unit-testable without Flamework — see the `testing` skill (construct with `new`, stub
deps, seed atoms). Add a `*.spec.ts` under `test/server` for new service logic.
