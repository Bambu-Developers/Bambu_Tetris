# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step or dependencies. Open directly or serve with any static server:

```bash
open index.html                  # macOS direct open
python3 -m http.server 8000      # then visit http://localhost:8000
```

## Architecture

Three files, no framework, no bundler:

- **`index.html`** — DOM structure: `<canvas id="board">` (300×600px) for the playfield, `<canvas id="next-canvas">` (120×120px) for the preview, sidebar HUD cards (`#score`, `#lines`, `#level`), and a shared overlay `#overlay` for both Pausa and Game over states. An inline `<head>` script applies the saved theme before first paint.
- **`style.css`** — Bambú Tech Services design system (`DESIGN.md` v1.0.0) expressed as CSS variables: dark mode (black + `#00FF00`) on `:root`, light mode overrides on `html.light-mode`, Sansation type stack, 8px brand radius, green glow instead of grey shadows.
- **`game.js`** — All game logic (~305 lines, `'use strict'`, no modules).

### game.js internals

| Concern | Key identifiers |
|---|---|
| Board state | `board` — `ROWS×COLS` matrix; `0` = empty, `1–8` = piece color index |
| Piece representation | `{ type, shape, x, y }` where `shape` is a 2-D matrix |
| Rotation | `rotateCW(shape)` — transpose + reverse; `tryRotate()` applies wall kicks `[0,±1,±2]` |
| Collision | `collide(shape, ox, oy)` — checks bounds and board occupancy |
| Game loop | `loop(ts)` via `requestAnimationFrame`; `dropAccum` tracks elapsed ms against `dropInterval` |
| Line clear | `clearLines()` — iterates board bottom-up, splices full rows, prepends empty row |
| Scoring | `LINE_SCORES = [0,100,300,500,800]` × `level`; hard drop +2/cell, soft drop +1/row |
| Speed | `dropInterval = max(100, 1000 − (level−1) × 90)` ms; level = `floor(lines/10) + 1` |
| Ghost piece | `ghostY()` — projects current piece down until collision; drawn at `globalAlpha = 0.22` |
| Theming | `html.light-mode` class, applied pre-paint by an inline script in `index.html`; `isLight()` reads it, `applyTheme()` toggles the class and calls `syncPalette()` |
| State flags | `paused`, `gameOver`, `animId` (RAF handle) |
| Skins | `SKINS` — `retro` (default, current look) / `neon` / `pastel` / `pixel`; each entry has `label`, a `dark` and a `light` ramp, and its own `drawBlock(context, px, py, s, color, size)` |
| Skin dispatch | `drawBlock()` computes padding/alpha and delegates the pixels to `SKINS[currentSkin].drawBlock`; `currentSkin` + `syncPalette()` pick the ramp for the active theme |
| Skin persistence | `<select id="skin-select">` in the sidebar (options generated from `SKINS`, so the object is the single source of truth); saved under `tetris-skin` in `localStorage` (`loadSkin()`, inside `try/catch`); changing it re-syncs `palette` and calls `draw()` + `drawNext()` — no reload |

### Game flow

`init()` → `spawn()` → `requestAnimationFrame(loop)`. Each frame: accumulate dt → auto-drop or `lockPiece()` → `draw()`. `lockPiece()` = `merge()` + `clearLines()` + `spawn()`. If `spawn()` immediately collides → `endGame()`.

## Tunable constants (top of game.js)

`COLS` (10), `ROWS` (20), `BLOCK` (30 px), `COLORS_DARK` / `COLORS_LIGHT` (arrays indexed 1–8, green→teal brand ramp), `LINE_SCORES`. If you change `COLS`/`ROWS`/`BLOCK`, update the canvas `width`/`height` attributes in `index.html` to match (`COLS×BLOCK` and `ROWS×BLOCK`).

Skins live in the `SKINS` object (right after the two retro ramps): add an entry with `label`, a `dark` ramp, a `light` ramp (both arrays indexed 1–8) and a `drawBlock(context, px, py, s, color, size)` function — the `<option>` in `#skin-select` is generated from it. A skin that sets `shadowBlur`/`shadowColor` must wrap its drawing in `ctx.save()`/`ctx.restore()`; the generic `drawBlock()` owns padding and `globalAlpha` (the ghost is drawn at `0.22`). `draw()` wraps the active piece in a green glow, so a skin that paints detail on top of its base fill (bevels, highlights) should `save()`, zero `shadowBlur` before those passes, and `restore()`.
