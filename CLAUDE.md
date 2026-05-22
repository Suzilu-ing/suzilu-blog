# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start dev server (next dev)
pnpm build    # Production build (next build)
pnpm start    # Start production server (next start)
pnpm lint     # Run ESLint
```

## Architecture

- **Next.js 16.1.1** (App Router) with React 19 and TypeScript 5, deployed on Vercel.
- **Single-page portfolio site** — no blog, no CMS, no posts. The only content is the homepage (`/`) with name, social links, and a custom 404 page.
- **`src/app/page.tsx`** — the homepage (server component). Renders the `Water` animation + hero section with social/contact links.
- **`src/app/layout.tsx`** — root layout (server component). Sets metadata (`<title>thvu</title>`), imports `globals.css`, and includes `<Analytics />`.
- **`src/app/water.tsx`** — client component (`"use client"`). Animated ASCII water wave on `<canvas>` using `requestAnimationFrame`. Characters: `" .:-=+*~"`. Full-width, 80vh tall, `pointer-events: none`, `z-index: 2`. Accepts a `speed` prop (default `0.35`).
- **`src/app/not-found.tsx`** — custom 404 page (server component) with text + `back home` link.
- **`src/app/not-found-canvas.tsx`** — client component. Animated ASCII swirl/vortex on `<canvas>` using polar coordinates. Same character set as Water.

## Styling

- **Single plain CSS file** (`src/app/globals.css`). No Tailwind, no CSS-in-JS, no modules.
- **CSS custom properties** define all design tokens on `:root` — colors, type scale, spacing scale, border radii.
- **Font:** "Paper Mono" (loaded from Fontshare via `@import`), falling back to IBM Plex Mono, JetBrains Mono, and system monospace.
- **Color scheme:** Warm paper aesthetic — off-white background (`#fbfaf6`), near-black text (`#1f1c16`), warm amber accent (`#b5743f`). Light mode only.

## Key patterns

- Canvas animations handle high-DPI (`devicePixelRatio`) and responsive resize via `ResizeObserver`. Both are `aria-hidden="true"`.
- The `Water` canvas renders behind page content (lower z-index than text), allowing the hero section to be interactive.
- No tests configured. No state management library.
