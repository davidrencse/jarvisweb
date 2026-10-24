# Design: JARVIS site

A Braun-white instrument. Pure white paper, ink, three greys and 1px hairlines; nothing on the page carries hue. The one ornament is a single ink stroke (the voice waveform, the pipeline rail, the closing signal line) that runs from the black-on-white hero to the white-on-black close.

## Tokens (`src/styles/tokens.css`)

| Role | Token | Value |
|---|---|---|
| Paper | `--paper` / `--paper-2` / `--paper-3` | `#ffffff` / `#f5f5f4` / `#ececea` |
| Hairlines | `--line` / `--line-strong` | `#e6e6e3` / `#cfcfcb` |
| Ink (text) | `--ink` / `--ink-2` / `--ink-3` | `#0a0a0a` / `#525250` / `#6f6f6c` (lightest allowed text, 5.0:1) |
| Decoration only | `--ink-4` | `#a8a8a4` |
| Inverse band | `--inverse` / `--on-inverse` / `--on-inverse-2` / `--inverse-line` | `#0a0a0a` / `#fafafa` / `#a9a9a5` / `#2a2a29` |
| Radii | `--r-xs` `--r-s` `--r-m` `--r-pill` | 4 / 8 / 14 / 999px. Instruments use 14px; pills only for small controls. |
| Spacing | `--space-1` … `--space-11` | 4px rhythm: 4 8 12 16 24 32 48 64 96 128 176 |
| Sections | `--section-y`, `--gutter`, `--max` | `clamp(96px, 11vw, 176px)`, `clamp(16px, 4vw, 40px)`, 1320px |

## Type

- Display: Funnel Display (variable), weight ~560, tracking -0.035em at display sizes, max 6rem (`--text-5xl`).
- Reading: Funnel Sans (variable), 17px body, 1.55 leading, 52–62ch measure.
- Data: Fragment Mono, only for measurements, commands, file paths, IDs and dates.
- Scale: `--text-xs` 13px → `--text-5xl` `clamp(3rem, …, 6rem)`.

## Motion (`src/lib/motion.ts`)

- Eases: `ease.out` = cubic-bezier(0.16, 1, 0.3, 1) for arrivals; `ease.inOut` for symmetric moves.
- Springs: `soft` (no bounce, 0.6s) for surfaces; `snappy` (0.12 bounce, 0.32s) for state; `layout` for reflow; `press` for taps.
- Entrances: `RevealText` (words rise out of a mask) for headings, `FadeIn` (20px rise + 6px blur) for blocks. Nothing else enters.
- Selection moves on a shared `layoutId` pill or outline; content swaps blur-crossfade with `AnimatePresence mode="wait"`.
- `MotionConfig reducedMotion="user"` at the root; every rAF/canvas loop also checks `useReducedMotion()`, pauses off-screen and on hidden tabs.

## Components

- Own primitives (`src/components`): `SectionHead`, `RevealText`, `FadeIn`, `Button` (primary / secondary / quiet, `inverse`), `Wordmark`, `Nav`.
- Watermelon UI (from `registry.watermelon.sh`, restyled onto these tokens):
  - `ui/announcement-1`: the top bar in the nav.
  - `command-search`: the "Ask JARVIS" ⌘K / `/` palette.
  - `scroll-island`: the floating ink page index after the hero.
  - `ui/faq-5` and `ui/accordion`: the Questions section.
  - `voice-transcribe`: the voice message in the Everywhere → Voice scene.
  - `copy-confirm`: "Copy commands" in the Terminal scene.
  - `shimmer-button`: the nav and island CTA.
- Tailwind v4 is present only for these components. `src/styles/tailwind.css` maps the shadcn variables (`--background`, `--primary`, `--border`, …) onto the tokens, and `.inverse` remaps them for the black band. `base.css` lives in `@layer base`, so Tailwind utilities override it and CSS Modules override both.

## Browser surfaces

Selection is ink on paper (inverted on the black band); caret is ink; scrollbars use `--line-strong`; focus is a 2px ink outline offset 3px; numbers in data are tabular.

## Rules that keep it this world

No hue, no decorative gradients or glass, no glow. No eyebrow labels above headings. No icon-tile card grids. Mono never as costume. Icons are lucide at stroke 1.75. Demo content is synthetic and labelled "Simulated"; product claims come only from `PRODUCT.md`.
