# v2: "A Bloomberg Terminal for everything"

Supersedes the hero copy and page order in `home.md`; everything else in `home.md` (direction contract, motion grammar, bans, shared building blocks) still applies.

The owner repositioned JARVIS: **a Bloomberg Terminal for everything, for regular people.** Bloomberg built a terminal for money; JARVIS is one for the rest of your life (notes, deadlines, tasks, markets, machines, AI usage) on one screen, in plain English. The visual world does NOT change: white monochrome Braun instrument, no Bloomberg black/amber, no Bloomberg logo. The terminal is expressed through grammar (command line, mnemonics, F-keys, monitor tables, dense mono data) set in our palette, and every terse output gets a plain-English line.

Motion reference added by the owner: **Linear (linear.app)**. Translate it, don't copy it: a product shot that starts tilted in perspective and flattens as you scroll; headings that blur in; dense UI rows that stagger in; a hairline light that follows the cursor around frames (`src/components/Spotlight.tsx`); selection moving on shared-layout pills; nothing bouncy.

Real UI: `public/screens/console-light.webp` and `console-dark.webp` (2880×1800, the owner's real JARVIS console), plus `-1440` versions. Use them as they are; never redraw them.

WebGL: `three` and `@react-three/fiber` are installed. Every WebGL canvas lives in its own module loaded with `React.lazy`, shows a poster/fallback while loading, falls back to a static non-WebGL rendering when WebGL is unavailable or `useReducedMotion()` is true, uses `frameloop="demand"` (invalidate on scroll/pointer/tween) or pauses when off-screen, and caps `dpr` at 2. Shader guidance: `C:\Users\david\.agents\skills\threejs-shaders\SKILL.md`.

## Page order

| # | Section | id | Field | Owner |
|---|---|---|---|---|
| 1 | Hero + WebGL product shot | `top` | white | agent H |
| 2 | Terminal: one command line for everything | `terminal` | white | agent T |
| 3 | Markets in plain English (WebGL map) | `markets` | `--paper-2` band | agent M |
| 4 | Voice check (moved out of the hero) | `voice` | white | orchestrator |
| 5+ | Pipeline, Memory, Knowledge, Actions, Cost, Everywhere, Principles, FAQ, Early access, Footer | unchanged | | |

## Hero (`src/sections/Hero/`, agent H)

- Only `<h1>`: "A Bloomberg Terminal\nfor everything." (`RevealText` rise, mount, `--text-5xl`).
- Lede: "Bloomberg built a terminal for money. JARVIS is one for the rest of your life: your notes, deadlines, markets, machines and AI usage on one screen, in plain English. Type a command, or just say “Jarvis.”"
- Actions: primary lg "Request early access" → `#access` (arrow); quiet "Try the terminal" → `#terminal`.
- Composition: headline left, lede + actions right (keep the current 12-column head), then the product shot at full container width with `margin-top: var(--space-8)`. Its top 40% must be inside the first viewport at 1440×900.
- **WebGL product shot** (`ProductShot.tsx` + lazy `ProductShotScene.tsx`): the real console screenshot on a plane rendered with a custom `ShaderMaterial`.
  - Linear tilt: starts at rotateX ≈ 24° (top edge away), slightly scaled down and lowered; flattens to 0° and full scale as the hero scrolls (`useScroll({ target, offset: ["start start", "end start"] })`, mapped so it is flat when the shot's centre reaches the viewport centre), smoothed with `useSpring`.
  - Load reveal: the image first appears as a monochrome dot-matrix/halftone of itself (the console's own dotted type is the cue), then a soft horizontal scan band sweeps top→bottom over ~1.6s and resolves it into the full screenshot (`uReveal` 0→1).
  - Hover lens: a ~180px circle that follows the pointer shows the screenshot magnified ~1.8× with a 1px ink ring (`uMouse`, `uLens` eased in and out). Mouse only; off on touch.
  - Theme switch: a small segmented control "Light | Dark" (layoutId pill) above the shot's top-right; switching crossfades the two textures with a diagonal wipe in the shader (`uMix`).
  - The bottom ~16% of the shot fades into `--paper` (Linear-style), and a soft offset shadow sits under the plane.
  - Caption (mono, `--ink-3`): "The real JARVIS console on a laptop. Not a mock-up."
  - Fallback/poster: an `<img>` (srcset 1440/2880, `fetchpriority="high"`, explicit width/height) with a CSS perspective that flattens on scroll via Motion. Used while the chunk loads, without WebGL, and under reduced motion (flat, no tilt).
  - Mobile: tilt ≤ 12°, no lens, the toggle stays, the canvas keeps the 16:10 aspect.

## Terminal (`src/sections/Terminal/`, agent T)

- `<section id="terminal">`. SectionHead stack: title "One command line\nfor your whole life." Lede: "Bloomberg-style shortcuts for everything JARVIS knows, each answered with a plain-English line, so you never have to learn the codes. Or skip the typing and ask out loud."
- A large interactive terminal instrument (white, hairline frame `--r-m`, wrapped in `Spotlight`), modelled on the owner's real Pro terminal layout but monochrome:
  - Top bar: `JARVIS` mono label, the command input (placeholder `BRIEF · DUE · NOTE os midterm · BTC GP 30D · CRED · HELP`), a GO button, a `RECON ONLY` chip, a live clock (tabular numerals).
  - Body: three panes. Left "1 MONITOR": a compact list that changes with the function (agenda for BRIEF/DUE, tickers for markets, machines for DEV). Centre "2 OUTPUT": the main answer (rows, a chart, or a note excerpt). Right "3 PLAIN ENGLISH": one or two calm sentences explaining the output in everyday words, in Funnel Sans `--text-lg`.
  - Bottom F-key bar (real buttons): `F1 HELP`, `F2 BRIEF`, `F3 MARKETS`, `F4 NOTES`, `F5 MACHINES`, `/ COMMAND`. Physical F-keys work only while focus is inside the terminal; never hijack F5 reload outside it.
- Functions (synthetic outputs, "Simulated" label in the top bar), parsed case-insensitively:
  - `HELP`: the function list with one-line descriptions.
  - `BRIEF`: morning brief (today's agenda, due soon, today's priorities); plain English starts "Two things today…"; note "from your notes, no model, about 20 ms".
  - `DUE`: overdue / today / this week table.
  - `TASK ADD <text> [--due <day>]`: echoes the added task line.
  - `NOTE <query>`: top 3 matching notes with scores and a two-line excerpt.
  - `KB <question>`: an answer with claim citations like `[[source-001]]`, or the daily-vs-weekly conflict waiting for a ruling.
  - `<TICKER> GP <window>` (e.g. `BTC GP 30D`, `ETH GP 7D`): a line chart drawn with SVG `pathLength`, window chips 1D 7D 30D 90D 1Y; plain English like "Bitcoin is up 6.2% over 30 days, with one sharp dip on the 14th."
  - `DES <ticker>`: a short description card. `TOP`: top movers table. `BT`: backtest of `sma(20) crosses_above sma(50)` → "$1,000 → $1,184 vs holding $1,090", Sharpe, max drawdown, trades, win rate.
  - `CRED`: AI usage left (Claude window, Codex window "5 h used / week left", ElevenLabs characters) as hairline bars.
  - `DEV`: machines (this laptop and the other laptop: link, ping, free memory, load, clipboard sync).
  - `ASK <anything>`: "Sent to your plan's brain: …" with the routed tier.
  - Unknown: "No function called X. Type HELP to see them all."
- Input UX: a suggestions dropdown while typing (arrow keys + Enter), ↑/↓ history, Esc clears, GO runs. Output rows stagger in (`spring.snappy`), the active pane gets a layoutId focus outline, charts draw in.
- Auto-demo once when first in view: types `BRIEF`, runs it, then `BTC GP 30D`, unless the visitor has already typed or clicked.
- Mobile: panes stack (output, plain English, monitor), the F-key bar scrolls horizontally inside its own row, the input stays usable.
- Accessibility: labelled input; output region `aria-live="polite"` announcing only the plain-English line; F-key buttons are real buttons with `aria-keyshortcuts`.

## Markets (`src/sections/Markets/`, agent M)

- `<section id="markets">` on a full-bleed `--paper-2` band. SectionHead split: title "Markets, in\nplain English." Lede: "A pulse that reads like a sentence, a map of what moved today, and ideas tested on history. It only ever watches: there is no code in JARVIS that can place a trade."
- **WebGL market map** (`MarketMap.tsx` + lazy `MarketMapScene.tsx`): ~24 coins as a 3D tile field seen from a slight isometric angle (treemap-like layout, tile area = market value). Tile height = size of today's move; up moves are solid ink, down moves are pale `--paper-3` with an ink hairline edge (monochrome, no red or green). Gentle idle breathing. Hover lifts a tile (spring) and shows a plain-English tooltip ("Solana is up 4.2% today, more than 19 of 24 coins."). Click selects a coin: a side panel shows its 7-day line (SVG) and a sentence. Pointer drag orbits a few degrees, clamped. All data synthetic, labelled "Simulated · not live prices".
- Beside it: a **mood gauge** (fearful ↔ greedy dial, ink needle springing to a value, mono label), a pulse sentence ("Most coins are up today; Bitcoin is leading and the mood leans greedy."), and a **strategy card**: `sma(20) crosses_above sma(50)` on BTC, "$1,000 → $1,184 vs holding $1,090", Sharpe 1.21, max drawdown −8.4%, 14 trades, 57% win rate, live signal HOLD (all synthetic, labelled).
- Below it, the real signal pipeline as one hairline row: Market data → Strategies → Signals → You decide → Real trading **Off**.
- Fallback: a flat CSS/SVG treemap with the same hover and click behaviour when WebGL is unavailable or under reduced motion.

## Orchestrator-owned changes

Voice section (the moved Voice Check), nav and command-menu entries, scroll-island topics, FAQ additions ("Is it financial advice? Does it trade for me?"), Spotlight on existing frames, section headings switched to the blur-in reveal.
