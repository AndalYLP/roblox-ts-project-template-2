---
name: vide-ui
description: Build or edit client UI with Vide in this project — use the project's primitive components (not raw Roblox instances), the native escape hatch, px scaling, Vide reactivity, and UI-Labs stories. Use when creating or editing any client UI, component, screen, or story.
---

# Vide UI

UI is **Vide** (JSX configured in tsconfig: `Vide.jsx`). Client UI lives in `src/client/ui/`:
`components/primitive/` (building blocks), `components/` (reusable composed), `<feature>/` (screens),
`hooks/`, and mounts via `client/ui/app/mount.tsx`.

## Use the primitives, not raw instances

Never write raw `<frame>` / `<textlabel>` / `<textbutton>` / `<imagelabel>` / `<scrollingframe>`. Use
`client/ui/components/primitive/`:

| Primitive | Replaces | Own props (besides `native`) |
| --- | --- | --- |
| `Frame` | `<frame>` | anchor, backgroundColor, backgroundTransparency, cornerRadius, position, size, visible |
| `Text` | `<textlabel>` | + font, text, textColor, textSize |
| `Button` | `<textbutton>` | + activated, mouseEnter/Leave, mouseButton1… |
| `Group` | full-size transparent `<frame>` | native |
| `Image` | `<imagelabel>` | + image, scaleType, tileSize |
| `PaddingComponent` | uniform `<uipadding>` | padding |
| `Outline` | border (inner/outer `uistroke`) | cornerRadius, inner/outer color/thickness/transparency |
| `ScrollingFrame` | `<scrollingframe>` | canvasSize, srollBarThickness |

- **`native`**: any Roblox property a primitive doesn't expose goes here, e.g.
  `native={{ AutomaticSize: Enum.AutomaticSize.Y, TextTransparency: t, TextXAlignment: ..., LayoutOrder: 2 }}`.
  For a `Button` with a label, put `Text`/`Font`/`TextColor3`/`TextSize` in `native`.
- Replace `<uicorner>` with the `cornerRadius` prop; uniform `<uipadding>` with `PaddingComponent`.
- **No primitive** for `<uilistlayout>`, `<uigradient>`, `<uistroke>`, `<screengui>` — use them raw.
- **Borders on padded frames**: `Outline` is frame-based, so a parent `<uipadding>` pushes it inward.
  A raw `<uistroke>` strokes the object border directly (padding doesn't affect it) — prefer `uistroke`
  for a border on a padded frame; `Outline` for a non-padded one.
- Primitives default `AnchorPoint`/`Position` to centered; inside a `<uilistlayout>` the layout
  overrides Position, so this is usually fine — but verify visually.

## Scaling & reactivity

- Call `usePx()` once at each screen root; size with `px(n)` from `client/ui/hooks/use-px`. Use
  **`() => px(n)`** for props so they rescale reactively.
- Props are `Vide.Derivable<T>` (`T | (() => T)`). Bind reactive values as functions; read a derivable
  inside a binding with `read()` (`Color={() => TABLE[read(kind)]}`).
- Prefer `Vide.Source`/`derive` for local state; for shared/synced Charm state, bridge with charm
  `subscribe` into a `source` and `cleanup(...)` the unsubscribe.

## Stories (UI-Labs)

- File `*.story.tsx` (excluded from prod build; present in dev, discovered by the UI-Labs plugin in
  Studio). Snippet in `.vscode/vide.code-snippets`.
- `export = CreateVideStory({ vide: Vide, controls: {...} }, ({ controls }) => { usePx(); return <Comp/>; })`.
- Controls: `String`, `Number`, `Boolean`, `Choose<T>([...])`, `Slider` from `@rbxts/ui-labs`. They
  arrive as **`Vide.Source`**, so bind reactively: `<Comp value={() => controls.value()} />`. For the
  component to react, it must accept `Derivable` props (not a static object).

## Limitations

Vide can't be jest-tested (require-by-string). Verify visually in **Studio Play** (headless
`run-in-roblox`/Open Cloud can't render). Loading UI in **ReplicatedFirst must be self-contained** (no
imports → no runtime-library require that early); use a plain cover there and mount the real Vide UI
from the client.
