---
name: centurion-commands
description: Add or modify Centurion slash commands in this roblox-ts project — the command class + options-config + group-register split, argument types (built-in and custom), guards, and reaching services from a command. Use when adding a command, a command group, a custom argument type, or a permission guard.
---

# Centurion commands

Dev/admin slash commands use **@rbxts/centurion**. Open the in-game console with **F2**
(`activationKeys` in `client/centurion/runtime.ts`). Server registry, client UI.

## Layout

```
server/centurion/
├── runtime.ts                     Centurion.server() + registry.load(commands) + start()
├── commands/
│   ├── register.config.ts         groupRegisterOptions — group name/description metadata
│   └── <group>/
│       ├── index.ts               the decorated command class
│       └── <group>.config.ts      <group>CommandOptions — per-command arg schemas
└── guards/is-developer.ts         CommandGuard(s)
client/centurion/runtime.ts        Centurion.client() + CenturionUI (F2)
shared/centurion/types/            custom argument types (TypeBuilder), loaded on BOTH sides
```

**Auto-loading**: `server.registry.load(centurion.commands)` loads *every* module under the
`commands` folder. A new decorated class in that tree is picked up automatically — there is **no
central list to edit**. Runtime files (`runtime.ts`) are rarely touched.

## Add a command to an existing group

1. **Options** — add an entry to `<group>/<group>.config.ts`:
   ```ts
   export const moderationCommandOptions = {
       kick: {
           name: "kick",
           arguments: [
               { name: "Player", description: "…", type: CenturionType.Player },
               { name: "Reason", description: "…", optional: true, type: CenturionType.String },
           ],
           description: "Kick a player from the game.",
       },
   } satisfies Record<string, CommandOptions>;
   ```
2. **Handler** — add a method to `<group>/index.ts`, decorated with `@Command(options.kick)`.
   The signature is `(ctx: CommandContext, ...args)` — args map **positionally** to the
   `arguments` array; `optional: true` ⇒ an optional (`reason?`) parameter:
   ```ts
   @Command(moderationCommandOptions.kick)
   public kick(commandContext: CommandContext, player: Player, reason?: string): void {
       player.Kick(reason);
       commandContext.reply(`Player ${player.UserId} kicked.`);
   }
   ```
   `commandContext.reply(msg)` on success, `commandContext.error(msg)` on failure,
   `commandContext.executor` is the calling `Player`.

## Add a new group

Same two files, plus register the group metadata:

3. Add the group to `groupRegisterOptions` in `register.config.ts`
   (`{ groups: [{ name, description }] }`).
4. Decorate the class:
   ```ts
   @Group("moderation")                          // nests commands under the `moderation` prefix
   @Guard(isDeveloper)                            // permission gate for the whole class
   @Register(groupRegisterOptions.moderation)     // the group metadata from step 3
   export class ModerationCommands { … }
   ```

## Reaching services — the key gotcha

Command classes are instantiated by **Centurion's registry, not Flamework** — so **constructor
DI does not work**. Pull services/components inside the method with `Dependency<T>()` from
`@flamework/core`:

```ts
import { Dependency } from "@flamework/core";
import type { Components } from "@flamework/components";

const service = Dependency<SomeService>();
const component = Dependency<Components>().getComponent(instance, SomeComponent);
```

Keep handlers thin: validate/resolve, call the service, `reply`/`error`. Put real logic in the
service (it's Flamework-managed and unit-testable; commands aren't — see the `testing` skill).

## Argument types

- **Built-in**: `CenturionType.Player`, `.Number`, `.String`, … in the arg's `type`.
- **Custom** (e.g. resolve a username → userId): build with `TypeBuilder`, add its name to
  `customCenturionType` (`shared/centurion/types`), and use `customCenturionType.<name>` as the
  arg `type`. Custom types are loaded on **both** server and client registries — **both sides must
  load them** or argument parsing silently fails. See `shared/centurion/types/user-id.ts`:
  ```ts
  export const userId = TypeBuilder.create<number>(customCenturionType.userId)
      .transform((name) => TransformResult.ok(Players.GetUserIdFromNameAsync(name)), true)
      .suggestions(() => Players.GetPlayers().map((p) => p.Name))
      .markForRegistration()
      .build();
  ```

## Guards

A `CommandGuard = (context) => boolean`. Return `false` (after `context.error(...)`) to reject.
Apply per-class with `@Guard(...)`. `isDeveloper` allows Studio or a `DEVELOPERS` allow-list —
gate admin commands with it.

## Conventions

- **"Defaults to the executor"**: for a command that targets a player, make `Player` the last,
  **optional** argument and resolve `const target = player ?? commandContext.executor;`.
- Wrap yielding/marketplace calls (`BanAsync`, `GetUserIdFromNameAsync`) in `try/catch` and report
  via `commandContext.error(...)` — a thrown command surfaces as a raw console error otherwise.
- Extract shared "resolve X or error" steps into a **private helper** on the class (returns
  `undefined` after calling `context.error`), so each handler is a short happy path.
