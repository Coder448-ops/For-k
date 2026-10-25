# KUMUSH — Kumush tajriba (A Silver Experience)

A premium, cinematic single-page website in **obsidian black and metallic silver**,
built for one visitor: **Kumush**. The entire experience is written in **Uzbek**
(uzbek latin, `lang="uz"`).

> Hamma narsani ham tushuntirish shart emas.
> *(Not everything needs an explanation.)*

The experience opens on a near-black screen where silver particles drift in depth.
A light travels across the dark, revealing a metallic **K** — then the journey
begins: a hero dedication (*Faqat Kumushga.*), a sealed silver relic that opens
at a touch to reveal a hidden message, a gallery of three interactive studies in
silver (a metallic sphere, a glass prism, a constellation), and a quiet, elegant
finale.

## Highlights

- **Obsidian Luxury design system** — `#070809` black, metallic silver gradients,
  premium glassmorphism, film grain, vignette, ambient lighting.
- **Cinematic intro** with a travelling light beam, a revealed metal `K`,
  a glass **Kashf etish** button, and a discreet **O‘tkazib yuborish** (skip).
- **Interactive centerpiece** — a floating silver medallion engraved with a split
  `K`. Click / tap / press Enter: it spins, a light sweeps across, the shell
  swings open in real 3D and a glass message panel emerges
  (*Bu yergacha yetib kelding. ✨*). It closes again.
- **The Silver Gallery** — three tilt-reactive glass cards (*Nuqtayi nazar*,
  *Imkoniyat*, *Kichik mo‘jiza*) with pointer-following silver highlights; each
  opens to reveal one neutral sentence.
- **Procedural ambient sound** — a soft silver pad synthesised live with the
  Web Audio API. No audio files exist, so none can break; nothing ever autoplays
  and the control hides itself when Web Audio is unavailable.
- **Motion system** — canvas particle field with projected depth, scroll reveals,
  line-mask typography animations, metallic sheen sweeps, restrained 3D parallax,
  cursor aura, hairline scroll-progress indicator.
- **Uzbek typography done right** — the `o‘`/`g‘` marks use U+2019, verified
  against the actual font files (the official okina U+02BB is missing from
  Manrope and would render as tofu).
- **Accessible** — semantic landmarks, real buttons everywhere, `aria-expanded`
  states, visible focus rings, a skip link, `inert` page-behind-intro, and full
  `prefers-reduced-motion` support (plus an Uzbek `<noscript>` fallback).
- **Private by design** — no tracking, no analytics, no network calls, no data
  collection. Fonts are self-hosted; the site works offline once loaded.
- **Lightweight** — no Three.js, no heavy libraries. ~10 KB gzipped app code +
  ~45 KB gzipped React, one canvas, CSS-driven 3D.

## Stack

React 18 · TypeScript · Vite 6 · organised custom CSS (design tokens) ·
lucide-react (a few icons) · self-hosted variable fonts
(Cormorant Garamond + Manrope via Fontsource).

## Run locally

```bash
npm install     # install dependencies
npm run dev     # start the dev server → http://localhost:5173
```

## Build & preview the production site

```bash
npm run build   # type-checks (tsc) and builds into dist/
npm run preview # serves dist/ → http://localhost:4173
```

## Tests

A jsdom smoke test drives the entire journey (intro → Kashf etish → relic
open/close → all three gallery cards → replay → skip) in both full-motion and
reduced-motion modes, asserting the exact Uzbek copy and zero console errors:

```bash
npm run test:smoke
```

## Deploy (free static hosting)

The build output in `dist/` is fully static with **relative asset paths**, so it
deploys to any host or sub-path with zero configuration.

**Netlify** — connect the repo, or drag & drop the `dist/` folder onto
app.netlify.com/drop. Build command `npm run build`, publish directory `dist`.

**Vercel** — `npm i -g vercel && vercel` (framework preset: Vite; it auto-detects
`dist/`).

**Cloudflare Pages** — connect the repo; build command `npm run build`,
output directory `dist`.

**GitHub Pages** — build, then publish `dist/` from a workflow or `gh-pages`
branch. Relative paths mean project sites (`username.github.io/repo`) work
as-is.

No API keys, no backend, no environment variables required.

## Project structure

```
index.html              # shell (lang="uz"), meta, favicon, <noscript> fallback
src/
  main.tsx              # entry: fonts + global styles + mount
  App.tsx               # phase machine (intro ⇄ main), global ambience
  styles/
    tokens.css          # palette, type scale, motion, elevation tokens
    global.css          # reset, atoms, grain/vignette, reduced-motion
    ui.css              # shared glass button, hairline, chrome animations
  hooks/
    useReducedMotion.ts # live prefers-reduced-motion tracking
    useMedia.ts         # generic media-query hook (pointer: fine …)
    useReveal.ts        # IntersectionObserver scroll reveals
    useAmbientSound.ts  # procedural Web Audio ambient engine
  lib/motion.ts         # reduced-motion-aware scroll helpers
  components/
    ParticleField.tsx   # depth-projected silver particle canvas
    Intro.tsx           # cinematic opening (K reveal, Kashf etish, Skip)
    Hero.tsx            # “Faqat Kumushga.” + parallax stage
    SilverRing.tsx      # rotating 3D conic-metal orbits
    GiftObject.tsx      # the opening silver relic + hidden message
    Gallery.tsx         # three interactive studies in silver
    Closing.tsx         # finale, emblem, replay/back-to-top controls
    CursorGlow.tsx      # desktop cursor aura
    ScrollProgress.tsx  # top hairline progress
    MonogramButton.tsx  # fixed K — back to the beginning
    SoundToggle.tsx     # optional ambient sound control
scripts/smoke.mjs       # jsdom journey test (npm run test:smoke)
```
