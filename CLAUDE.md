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
| Theming | `html.light-mode` class, applied pre-paint by an inline script in `index.html`; `isLight()` reads it, `applyTheme()` swaps `palette` between `COLORS_DARK`/`COLORS_LIGHT` |
| State flags | `paused`, `gameOver`, `animId` (RAF handle) |

### Game flow

`init()` → `spawn()` → `requestAnimationFrame(loop)`. Each frame: accumulate dt → auto-drop or `lockPiece()` → `draw()`. `lockPiece()` = `merge()` + `clearLines()` + `spawn()`. If `spawn()` immediately collides → `endGame()`.

## Tunable constants (top of game.js)

`COLS` (10), `ROWS` (20), `BLOCK` (30 px), `COLORS_DARK` / `COLORS_LIGHT` (arrays indexed 1–8, green→teal brand ramp), `LINE_SCORES`. If you change `COLS`/`ROWS`/`BLOCK`, update the canvas `width`/`height` attributes in `index.html` to match (`COLS×BLOCK` and `ROWS×BLOCK`).
