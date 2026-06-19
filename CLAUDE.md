# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # Vite dev server (default: localhost:5173)
pnpm build     # tsc --noEmit + vite build (output to dist/)
pnpm preview   # serve dist/
```

There is **no test runner, no linter, no formatter** in this project. The `build` script runs `tsc` which acts as the type checker — run it before committing to catch type errors.

## State machine

`src/App.tsx` is the only place that orchestrates the user flow. The `Phase` type in `src/types/index.ts` is the canonical state:

```
idle → morphing → typing → revealed → idle
```

`morphing` is subdivided by `morphState: 'shrinking' | 'expanding' | null`, driven by two `setTimeout` refs (`shrinkTimerRef`, `expandTimerRef`). Both timers are cleared on `reset` and on unmount. Adding any new phase or altering timing should happen here and only here — `App.tsx` is the single source of truth for what's currently on screen.

## The GlassCard morph is the most non-obvious code

`.glass-card` morphs from a wide glass panel to a small gradient circle and back. Form and color are driven by **two separate mechanisms** that run in parallel — mixing them up will silently break either the shape or the color arc.

### Form (transition) — `.is-shrinking` / `.is-expanding`

These state classes drive `width / height / min-height / border-radius` via `transition` over 500ms. Three rules:

1. **`.glass-card` must keep `width: 100%`.** The card's natural width is `auto` (inherited from the parent's `w-full max-w-[min(100%,720px)]`), and CSS cannot interpolate from `auto` to a fixed pixel value. Without the explicit `width: 100%`, the width snaps to target while height transitions smoothly — the visual you do not want.
2. **The `transition` declaration lives on the state class (`.is-shrinking` / `.is-expanding`), not on `.glass-card`.** If it lives on the base class, the browser does not guarantee a transition fires when the class adds new values. Both state classes also have to set the full target value set themselves — `.is-expanding` must explicitly spell out the default values (`width: 100%; min-height: 60vh; border-radius: 16px` etc.) or the expand transition silently won't run.
3. **Shrink and expand are exact mirrors.** Same 500ms duration, same start/end values, only the easing curves swap. Shrink uses `cubic-bezier(0.33, 1, 0.68, 1)` (ease-out) for size; expand uses `cubic-bezier(0.7, 0, 0.84, 0)` (ease-in). If you change one curve, change the other to keep the round-trip symmetric. **Neither class declares `background` or `box-shadow` — those are owned by `.is-morphing` keyframes below.**

### Color (keyframes) — `.is-morphing`

Color follows a non-monotonic 5-stop path: cold-white → cyan/sky → indigo → cyan/sky → cold-white. The 0% / 50% / 100% endpoints match the glass defaults, the 50% peak is the saturated indigo circle, and the 25% / 75% midpoints are the cyan/sky build-up and cool-down. Implemented as `@keyframes morph-color` (and `morph-color-dark` for dark mode) running 1000ms `ease-in-out forwards`.

The state class is mounted for the entire 0–1000ms morph window by passing `isMorphing={isMorphing}` from `App.tsx` to `GlassCard`. It composes with `.is-shrinking` / `.is-expanding` (not mutually exclusive). Dark mode is handled by `html.dark .glass-card.is-morphing { animation-name: morph-color-dark; }` — no React-side dark branching needed.

If you want to tweak the color arc (peak intensity, midpoint hue, etc.), edit the keyframes in `src/index.css` — do not put `background` or `box-shadow` back on the form classes, or the transition will fight the keyframes.

The plan file at `C:\Users\raymondzylei\.claude\plans\task-md-buzzing-canyon.md` has the full design + a verified timing trace.

## Theming

Light/dark is controlled by adding/removing the `dark` class on `<html>` (managed by `useTheme`). All color tokens in `tailwind.config.ts` and `index.css` use the `dark:` variant or `html.dark` selector. Never hardcode a color without its dark counterpart. Persisted in `localStorage` under `book-of-answers-theme`; falls back to `prefers-color-scheme`.

## Background gradient

`useRandomBackground(theme)` runs once per mount and writes four CSS custom properties to `<body>`:

- `--bg-angle` — angle 105°–165°, fixed for the mount
- `--bg-stop-1` / `--bg-stop-2` / `--bg-stop-3` — picked at random from one of 4 cool-tone palettes (light or dark, switched by `theme`)
- `--noise-url` — fractal-noise SVG data URI, fixed for the mount

`useTheme` must be called **before** `useRandomBackground` in `App.tsx` so the palette is themed correctly on first render. Reload to re-roll.

The body in `index.css` also runs `bg-drift` — a 120s `ease-in-out infinite` keyframe that animates `background-position: 0% 50% → 100% 50%` against a `background-size: 200% 200%` gradient. This makes the gradient boundaries drift very slowly, so the static backdrop feels alive. Disabled under `prefers-reduced-motion: reduce`.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml` → builds `dist/` → deploys to GitHub Pages. The site is a pure static SPA (no SSR); `vite.config.ts` sets `base: '/'` and the build output is fully self-contained.

## Typewriter

`useTypewriter` is RAF-based, not `setInterval`. It accepts a `rate` (ms/char, default 135) and an `enabled` flag — when `enabled` flips false, the displayed text is preserved, not cleared. Reset only happens when `text` itself changes.
