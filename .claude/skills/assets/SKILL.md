---
name: assets
description: Add and use assets (images, sounds) via Asphalt in this roblox-ts project — the `assets/` folder, `pnpm assets:upload` to upload + generate the typed `assets` module, referencing them by path, world-space icons, and the upload/codegen gotchas. Use when adding an image/icon/sound, wiring an ImageLabel/Decal/BillboardGui/Sound, or when the `assets` module is missing or stale.
---

# Assets (Asphalt)

Assets (images, sounds) are uploaded to Roblox and code-generated into a typed **`assets`** module
by **Asphalt** (`asphalt.toml`). Reference every asset by path — no raw `rbxassetid://` in code.

## Add an asset

1. Drop the file under **`assets/`** (input glob `assets/**/*`, nested folders allowed). The `assets`
   object mirrors this tree: `assets/images/icons/warning.png` → `assets.images.icons.warning`.
   Ready-made icon packs may sit at the repo root (e.g. `vector-icon-pack/`) — copy the one you want
   into `assets/`; **only files under `assets/` are uploaded**.
2. Run **`pnpm assets:upload`** — runs `asphalt sync` (uploads each asset, dedup by content hash) and
   regenerates `src/shared/constants/assets/` (`init.luau` + `index.d.ts`; the script renames Asphalt's
   `assets.luau`/`assets.d.ts` and `eslint --fix`es the result). Creds come from `.env`
   (`ASPHALT_API_KEY`, `ROBLOSECURITY`).
3. Commit `assets/**` and the generated `src/shared/constants/assets/**`.

## Use it

```ts
import assets from "shared/constants/assets"; // default import — the module uses `export =`

const icon = new Instance("ImageLabel");
icon.Image = assets.images.icons.warning;
```

- **Default import**, not named — `allowSyntheticDefaultImports` is on for exactly this.
- `assets` is a nested object mirroring `assets/`, with the **file extension stripped** from the leaf
  keys (`assets.images.icons.warning`, `assets.sounds.repair.wood.var1`). Always check the generated
  `index.d.ts` for the exact keys.
- World-space icons (floating above a part) go on a `BillboardGui` with an `ImageLabel`; offset the
  billboard with **`ExtentsOffsetWorldSpace`**.

## Gotchas

- **Extensions leaking into keys** (`["warning.png"]` instead of `.warning`): the `asphalt.toml`
  `[codegen]` key is **`strip_extensions`** (plural). A singular `strip_extension` is silently ignored,
  so the extension stays in the key. Fix the key, re-upload.
- **`assets` module missing / a new asset absent from it**: nobody ran `pnpm assets:upload` after adding
  the file. Code referencing it won't compile until you do — run the upload, don't hand-edit the module
  (it's `@generated`).
- **403 `PERMISSION_DENIED` / "User not authenticated"** on upload: the `[creator]` id/type in
  `asphalt.toml` doesn't match the account behind the API key. Fix the creator — it is **not** an
  auth-missing problem.
- **Only `assets/` uploads** — files elsewhere (root icon packs) are ignored until copied in.