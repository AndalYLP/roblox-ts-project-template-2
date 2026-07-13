# roblox-ts-project-template-2

An opinionated, batteries-included [roblox-ts](https://roblox-ts.com/) project template built around
[Flamework](https://flamework.fireboltofdeath.dev/). It ships with the systems most games need on day
one — player data, monetization, networking, state management, UI, commands and a full testing
pipeline — so you can start building gameplay instead of plumbing.

## Features

- **Dependency injection & lifecycle** — [Flamework](https://flamework.fireboltofdeath.dev/) services,
  controllers, decorators and custom lifecycle events (`OnPlayerJoin`, `OnPlayerLeave`,
  `OnCharacterAdded`, `OnCharacterRemoved`).
- **Player management** — `PlayerService` with a `PlayerEntity` abstraction, janitor-based cleanup,
  character loading/validation, leaderstats, badges and safe player removal.
- **Persistent data** — [Lapis](https://github.com/nezuo/lapis) collections with schema validation,
  a mock DataStore in Studio, and `OrderedDataStore` helpers for leaderboards.
- **State management** — [Charm](https://github.com/littensy/charm) atoms with server → client sync
  (`charm-sync`) and payload filtering.
- **Monetization** — game passes and developer products via decorators, `ProcessReceipt` handling and
  a receipt history log.
- **Networking** — typed [Flamework networking](https://flamework.fireboltofdeath.dev/docs/additional-modules/networking)
  events/functions with throttle middleware.
- **Commands** — [Centurion](https://centurion.paradoxum.dev/) command framework with a moderation
  group (ban/kick/unban) and developer guards.
- **UI** — [Vide](https://centau.github.io/vide/) reactive UI with a set of primitive components,
  a responsive `usePx` scaling hook and [UI-Labs](https://pepeeltoro41.github.io/ui-labs/) storybook support.
- **Components** — Flamework components for interactables (clickable, proximity, touch) and an
  abstract destroyable base.
- **Audio** — `AudioController` with 3D sound and per-group volume bound to player settings.
- **Testing** — [Jest](https://github.com/jsdotlua/jest-lua) unit tests, [Lune](https://lune-org.github.io/docs)
  cloud tests via Open Cloud, TestEZ Companion and `run-in-roblox`.
- **Tooling** — ESLint (perfectionist + prettier), [darklua](https://darklua.com/) minification,
  [Rokit](https://github.com/rojo-rbx/rokit) toolchain management, [Asphalt](https://github.com/jacktabscode/asphalt)
  asset uploading, Renovate and GitHub Actions CI.

## Tech stack

| Concern        | Tool                                                             |
| -------------- | --------------------------------------------------------------- |
| Language       | TypeScript → Luau via [roblox-ts](https://roblox-ts.com/)       |
| Framework      | [Flamework](https://flamework.fireboltofdeath.dev/)             |
| Sync tool      | [Rojo](https://rojo.space/)                                     |
| Toolchain      | [Rokit](https://github.com/rojo-rbx/rokit)                      |
| Package manager| [pnpm](https://pnpm.io/)                                        |
| Data           | [Lapis](https://github.com/nezuo/lapis)                         |
| State          | [Charm](https://github.com/littensy/charm)                      |
| UI             | [Vide](https://centau.github.io/vide/)                          |
| Commands       | [Centurion](https://centurion.paradoxum.dev/)                   |
| Testing        | [Jest](https://github.com/jsdotlua/jest-lua) + [Lune](https://lune-org.github.io/docs) |

## Prerequisites

- [Node.js](https://nodejs.org/) 22.x
- [pnpm](https://pnpm.io/installation) 10.x (`corepack enable` will pick up the pinned version)
- [Rokit](https://github.com/rojo-rbx/rokit#installation) (manages Rojo, Asphalt, darklua, Lune and
  run-in-roblox — see [`rokit.toml`](rokit.toml))
- [Roblox Studio](https://create.roblox.com/) with the [Rojo plugin](https://rojo.space/docs/v7/getting-started/installation/#installing-the-roblox-studio-plugin)

## Getting started

```sh
# 1. Install the Roblox toolchain (Rojo, Asphalt, darklua, Lune, run-in-roblox)
rokit install

# 2. Install Node dependencies (also installs the TestEZ Companion Studio plugin)
pnpm install

# 3. Compile TypeScript and start syncing to Studio
pnpm dev:watch
```

Then open Studio, connect the Rojo plugin, and press play.

## Development

The template drives most workflows through [`rbxts-build`](https://github.com/AndalYLP/rbxts-build),
wrapped in `pnpm` scripts:

| Script                | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `pnpm dev:watch`      | Compile in watch mode and sync to Studio (the everyday command).   |
| `pnpm dev:compile`    | One-off TypeScript → Luau compile.                                 |
| `pnpm dev:build`      | Build a `.rbxl` place file.                                        |
| `pnpm dev:start`      | Start the Rojo dev server.                                         |
| `pnpm dev:open`       | Open the place in Studio.                                          |
| `pnpm dev:sync`       | Sync service definitions into `src/types/interfaces/services.d.ts`.|
| `pnpm lint`           | Run ESLint over `src`.                                             |

### Networking

Remotes are declared in [`src/shared/network`](src/shared/network) and split by domain under
`remotes/`. Register new events/functions on the `ClientToServerEvents` / `ServerToClientEvents`
interfaces in [`index.ts`](src/shared/network/index.ts), then consume them through
`server/network` and `client/network`.

### Player data

The persisted shape lives in [`shared/store/atoms/player`](src/shared/store/atoms/player) and its
default value in [`server/services/player/data/schema.ts`](src/server/services/player/data/schema.ts).
Add a field to the atom, extend `defaultPlayerData`, and the Charm → Lapis effect persists it
automatically. To surface a value on the leaderboard or an `OrderedDataStore`, register it in
[`leaderstats.ts`](src/server/services/player/leaderstats.ts) /
[`data/index.ts`](src/server/services/player/data/index.ts).

### Monetization

Add IDs to [`types/enums/mtx.ts`](src/types/enums/mtx.ts) and handle them with the `@RegisterProductHandler`
and `@gamePassStatusChanged` decorators — see the docblock in
[`server/services/mtx/index.ts`](src/server/services/mtx/index.ts) for an example.

## Testing

Unit tests use Jest and live next to the runtime as `*.spec.ts` under [`test/`](test), split by the
context they run in:

- [`test/server`](test/server) and [`test/shared`](test/shared) run on the server.
- [`test/client`](test/client) runs on the client — controllers, hooks and other code from the
  isolated client container.

```sh
# Run tests inside Studio via run-in-roblox
pnpm dev:test

# Run tests headless through Lune / Open Cloud
pnpm dev:cloud_test
```

Cloud testing requires Open Cloud credentials (see [`test.yaml`](.github/workflows/test.yaml) for the
expected variables): `ROBLOX_OC_API_KEY`, `ROBLOX_UNIVERSE_ID`, `ROBLOX_PLACE_ID` and
`TEST_TASK_FILE`.

### Server vs. client context

The runner in [`test/runtime.server.ts`](test/runtime.server.ts) drives all three roots. `run-in-roblox`
executes at plugin level where `RunService:IsClient()` is `true`, so the client specs load and run
alongside the server ones. Open Cloud, however, is **server-only** (`IsClient()` is `false`), so any
client spec that loads a client-only module fails there.

Most client code is fine on both, but `test/client/controllers/audio.spec` pulls in the 3D-sound
module, which hard-errors off the client. It is therefore skipped when `IsClient()` is false, via
`testPathIgnorePatterns` in [`test/client/jest.config.ts`](test/client/jest.config.ts). Anything else
that transitively imports a client-only guard should be gated the same way.

> Note: Vide-based UI cannot be unit-tested here — Vide requires its modules by string, which
> jest-lua does not support (`Require-by-string is not enabled`).

## Assets

Images placed under `assets/` are uploaded and codegen'd into
[`src/shared/constants/images`](src/shared/constants) with:

```sh
pnpm assets:upload
```

Configure the target creator in [`asphalt.toml`](asphalt.toml).

## Production build

```sh
# Clean, compile with NODE_ENV=production, and minify with darklua
pnpm prod:build

# Serve the production project for a final Rojo build
pnpm prod:sync
```

CI ([`ci.yaml`](.github/workflows/ci.yaml)) runs lint, a production build and a Rojo build on every
pull request against `main`/`develop`.

## Project structure

```
src/
├── client/       # Controllers, UI (Vide), client network & runtime
├── server/       # Services (player, data, mtx, character…), Centurion commands
├── shared/       # Atoms/state, network definitions, components, constants, modules
├── types/        # Enums, interfaces and utility types
└── utils/        # Flamework, player, physics and Luau helpers
test/             # Jest configs and specs
.lune/            # Lune cloud-test runner
```

## License

[MIT](LICENSE) © AndalYLP
