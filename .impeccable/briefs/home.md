# Surface brief: JARVIS home page (`src/App.tsx`)

Mode: **Persuade**. Visitor: a technical power user deciding whether they want their own JARVIS. Action: request early access (`#access`). Product truth lives in `/PRODUCT.md`; read it before writing any copy. Never invent customers, prices, dates, user counts or benchmarks. Demo data is synthetic and labelled "Simulated".

## Direction contract

THESIS: The page is one continuous black line, your voice, which JARVIS hears, verifies, remembers, acts on and answers. It refuses the category default: a dark Iron-Man HUD with a glowing orb, and the bento grid of icon-plus-heading feature cards.

OWN-WORLD: Braun-white instrument. Pure white paper, ink #0A0A0A, three greys, 1px hairlines, nothing with hue. Funnel Display set large and tight for headings, Funnel Sans for reading, Fragment Mono only for measurements, commands, file paths and IDs. The single ink stroke (waveform, path, rail) is the only ornament. Frames are hairline instruments with 14px radii; pills only for small controls. One black inverse band closes the page and mirrors the hero: white line on black.

STORY: In the first seconds the visitor watches JARVIS hear a voice, score it against a threshold and answer, then ignore a stranger. Scrolling, they follow one request through seven stations, see it remember through their own notes without overwriting, act only with permission, and run on subscriptions they already pay for. They request early access.

FIRST VIEWPORT: Nav (64px). Headline "It only answers / to you." at 6rem max, left, two lines. Lede and the two actions in the right third, bottoms aligned with the headline. Below, full container width, the Voice Check instrument: waveform line across the whole width, voiceprint scale with the 0.45 threshold tick, transcript, streamed reply. Its top half must be visible at 1440×900. Primary action: "Request early access".

FORM: Instrument panel / signal path (own ranking: 1 of 7; launcher unavailable, no seed key). Signature interactions: the hero Voice Check cycle (you → 0.74 → answered; stranger → 0.09 → not transcribed) and the scroll-scrubbed seven-station path.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Motion grammar (Framer-style, one system)

- Headings: `RevealText` (words rise out of a mask). Body and blocks: `FadeIn` (rise 20px + 6px blur → sharp). Never invent a third entrance style.
- Arrivals use `ease.out` = cubic-bezier(0.16, 1, 0.3, 1) or `spring.soft`; state changes `spring.snappy`; layout moves `spring.layout`; presses `spring.press`. All in `src/lib/motion.ts`.
- Selection indicators (tabs, segmented controls, active rows) move with a shared `layoutId` pill. Content swaps use `AnimatePresence mode="wait"` with a short blur-crossfade (≤ 300ms out, ≤ 450ms in).
- Scroll-linked motion only where scroll position *means* something (the pipeline rail). Use `useScroll({ target, offset })` + `useTransform`.
- Exits faster than entrances. No bounce on anything large. No hover lift on cards. No parallax for its own sake.
- `MotionConfig reducedMotion="user"` is set at the root. Any `requestAnimationFrame`/canvas loop must also check `useReducedMotion()`, stop when off-screen (IntersectionObserver) and when `document.hidden`.
- Any demo that auto-plays longer than 5 seconds needs a visible pause control.

## Shared building blocks (do not edit; import them)

- `src/styles/tokens.css`: colors, type scale (`--text-xs` … `--text-5xl`), spacing (`--space-1` … `--space-11`), radii, shadows, eases. Use tokens only. No new colors, no hue, no gradients for decoration.
- `src/components/SectionHead.tsx`: every section heading. `layout="split"` or `"stack"`, `inverse` on the black band. Pass the heading `id` and put `aria-labelledby` on the `<section>`.
- `src/components/RevealText.tsx`, `FadeIn.tsx`, `Button.tsx` (primary / secondary / quiet, `inverse`, `arrow`), `Wordmark.tsx`.
- `lucide-react` for every icon, stroke width 1.75. No emoji or unicode glyphs as icons.
- Layout: `.container` gives the max width and gutters. Sections use `padding-block: var(--section-y)`.

## Bans (from the craft floor)

No eyebrow/kicker labels above headings. No section numbers except where order is information (the pipeline). No gradient text, glassmorphism, glow, neon, colored anything. No same-size icon+heading+text card grids. No hero-metric templates. No nested cards. No `border-left` accents. Mono is for data, commands and measurements only. Text ≥ 4.5:1 contrast: `--ink-3` is the lightest allowed text color on white; `--ink-4` is for strokes and decoration only.

## Page order and rhythm

| # | Section | id | Field | Owner |
|---|---|---|---|---|
| 1 | Hero / Voice Check | `top` | white | agent A |
| 2 | Pipeline: seven stations | `how` | white | agent B |
| 3 | Memory: vault + tasks | `memory` | white | agent C |
| 4 | Knowledge engine | `knowledge` | `--paper-2` band | agent C |
| 5 | Actions | `actions` | white | agent D |
| 6 | Cost and routing | `cost` | white | agent D |
| 7 | Everywhere: surfaces | `everywhere` | `--paper-2` band | agent E |
| 8 | Principles | `privacy` | white | agent E |
| 9a | Questions (Watermelon faq-5) | `faq` | white | orchestrator |
| 9 | Early access | `access` | black inverse | agent E |
| 10 | Footer | `footer` | black inverse | agent E |

Each section lives in `src/sections/<Name>/index.tsx` (default export) with its own CSS module and any sub-components in the same folder.

## Section specs

### 1. Hero / Voice Check (`Hero`)

- `<section id="top">`, the only `<h1>` on the page: "It only answers\nto you." (`RevealText` variant rise, trigger mount, `--text-5xl`).
- Lede: "JARVIS is a personal assistant that lives on your laptop. It checks the voice is yours before it listens, remembers through your own notes, and thinks on the AI subscriptions you already pay for."
- Actions: primary lg "Request early access" → `#access` (arrow), quiet "See how it works" → `#how`.
- Load choreography: headline words rise (0–0.8s), lede blurs in (0.5s), actions (0.7s), instrument frame reveals with a clip-path wipe (0.9s), then the waveform starts.
- **Voice Check instrument**: hairline frame, `--r-m`, white. Top strip (mono, `--text-xs`, `--ink-3`): status on the left ("Listening", "Checking voice", "Answering", "Ignored") with a small ink dot; on the right "Simulated demo" and a pause/play icon button. A segmented control "Your voice | A stranger" (layoutId pill) lets the visitor choose; otherwise it auto-alternates.
- Waveform: canvas, one 1.5px ink line across the full instrument width, ~160px tall (110px mobile), devicePixelRatio aware. Idle: a low breathing line. Speaking: syllable-shaped amplitude envelopes. The stranger's voice has a visibly different texture (rougher, lower pitch).
- Voiceprint scale: a hairline 0.00–1.00 track with a tick and mono label "threshold 0.45". A marker springs to the score while a tabular-nums counter counts up. You: 0.74 → "0.74 · it's you". Stranger: 0.09 → "0.09 · not you".
- You: after the match, the transcript appears word by word ("Jarvis, what's due this week?") then the reply streams sentence by sentence with the blur-in (Funnel Display, `--text-2xl`): "Two things. Your OS assignment is due Thursday at 5 pm, and Friday morning is blocked for the drone build." Under it, mono timings: "verified 0.5 s · heard 0.3 s · answered 1.1 s".
- Stranger: no transcript ever appears. Show "Speech detected. Not transcribed, not answered." in `--ink-3`. This is the product truth: the voiceprint check runs before transcription.
- Cycle ~9s you / ~6s stranger, holding the result ~2.5s. Pauses when off-screen. Reduced motion: no waveform animation (draw a static line per state), states still change on a slower timer and the pause control still works.
- Accessibility: the instrument is a `figure` with a `figcaption` describing the demo in one sentence; animated text regions are `aria-hidden`, and a visually hidden live region announces only the final verdict of each cycle (polite).
- Layout: desktop grid 12 cols: h1 cols 1–8; lede+actions cols 9–12 aligned to the h1's last line. Instrument below, full width, margin-top `--space-8`. Top padding `calc(var(--nav-h) + clamp(48px, 8vw, 112px))`. Mobile: stack; instrument still visible after a short scroll.

### 2. Pipeline: seven stations (`Pipeline`)

- `<section id="how">`. SectionHead stack: title "What happens when\nyou say “Jarvis”". Lede: "One request passes through seven stations. Everything except the thinking can run on your laptop."
- Desktop: two columns. Left (≈4/12, `position: sticky; top: calc(var(--nav-h) + 48px)`): the **rail**, a vertical hairline in `--line` with an ink line that fills with scroll progress (`scaleY`, origin top), and seven station labels on it. Each label: a 9px node on the rail, the name in Funnel Display `--text-xl`, and a mono `--text-xs` tag: "on device" or "your subscription" (Think) or "your apps" (Act). The active station's node fills ink and its label goes from `--ink-3` to `--ink`; inactive nodes are hollow. Order numbers "1/7" in mono are allowed here because order is information.
- Right (≈7/12): seven panels, each `min-height: 72vh`, content vertically centered. Each: h3 station name (`--text-3xl`), one plain sentence (`--text-lg`, `--ink-2`, ≤ 48ch), and a small mono **readout** artifact in a hairline frame that animates when the panel becomes active (rows type or fade in, values count).
  1. Hear: "It listens in 30 ms frames. Before a single word is transcribed, a voiceprint check asks whether it's you." Readout: a row of tiny frame bars, then `voiceprint 0.74 ≥ 0.45 → transcribe`.
  2. Decide: "A router picks the lightest path with plain rules instead of a model call, so deciding costs nothing." Readout: request "what's due this week?" and rows `local · simple · medium · complex` with `local` selected.
  3. Remember: "It pulls up to four relevant notes from your vault, and says nothing when nothing matches well." Readout: `courses/operating-systems.md 0.91`, `calendar.md 0.77`, `projects/drone-blueprint.md 0.52`, then `abstains under 45% of the best match`.
  4. Think: "The answer comes from the ChatGPT or Claude plan you already have, through its own app, so no API meter is running." Readout: `brain · warm process · low effort`, `reply 1.1 s`.
  5. Act: "Asked to do something, it opens apps or drives a real browser, and asks you before any step that changes things." Readout: `open_app spotify` (check), `browser_click "Send"` → `waiting for you`.
  6. Speak: "A voice model on your laptop speaks the reply sentence by sentence, so it starts talking before it has finished thinking." Readout: three sentence chips appearing in sequence, `local voice · ~0.7 s per sentence`.
  7. Log: "Every turn lands in a searchable memory on your disk, so next time it already knows." Readout: `reply:20261024:858794`, `search 3–25 ms`.
- Active station = the panel nearest the viewport center (`useScroll` per panel or one `useScroll` on the section mapped to 7 bands). Clicking a rail label scrolls to its panel.
- Mobile (< 900px): no sticky rail. Panels stack with a thin sticky progress bar under the nav showing the active station name and "n/7". Panels lose the 72vh min-height.

### 3. Memory: vault and tasks (`Memory`)

- `<section id="memory">`. SectionHead split: title "It remembers\nthrough your notes." Lede: "JARVIS reads your Obsidian vault the way you wrote it: courses, projects, deadlines, today's plan. When it writes, it only adds. It never deletes, moves or rewrites a line of yours."
- Composition: left 5/12 is a short list "What it knows when you start talking" (courses in progress, active projects and their next step, deadlines in the next 14 days, today's and tomorrow's agenda, today's priorities), each a hairline-separated row, plus one sentence with the real figure: "Briefings like “what's due?” come straight from your notes in about 20 ms, even offline."
- Right 7/12: the **note demo**: a hairline document frame titled with a mono path `projects/drone-blueprint.md`, mono frontmatter lines (`type: project`, `status: active`, `updated: 2026-10-24`), an h4 "Next step", and three task rows (custom checkbox, task text, mono meta like `due Oct 28 · high`). Tasks: "Pick motors", "Pick a flight controller", "Order the frame". Do not render emoji; translate the Tasks fields into mono text.
- Interaction: a quote chip above the note, "“Jarvis, I finished picking the motors.”", with a quiet button "Say it" (and auto-play once on first view). Then: the "Pick motors" checkbox fills and a check draws (`pathLength`), a strike line draws through the text, a mono token `done 2026-10-24` slides in with layout animation, `updated:` ticks, and below the frame an audit line appears: `.jarvis/vault-writes.jsonl  +1  task_update done`. Also a "Today" daily-note line appends: `14:02 Finished picking the motors`. A "Reset" quiet button returns to the start.
- Label "Simulated" on the demo.

### 4. Knowledge engine (`Knowledge`)

- `<section id="knowledge">` on a `--paper-2` full-bleed band. SectionHead split: title "A wiki that\nchecks itself." Lede: "Hand it a PDF, a link or a voice memo. Three plain scripts take it from there, and you have the final word."
- The four roles as one horizontal sequence joined by a hairline (not cards): Reader "keeps every source exactly as it arrived, hashed and read-only"; Librarian "files each claim into the page it belongs to, with its source and date"; Checker "re-reads everything nightly and flags claims that disagree"; You "decide which claim stands". Name in Funnel Display `--text-xl`, sentence in `--ink-2`. On mobile it becomes a vertical sequence.
- **Conflict demo** (white instrument frame): header mono `review-routine.md · conflict: how often (daily ≠ weekly)`. Two claims side by side:
  - A: "The review routine runs daily at 02:00." mono `source-001 · confirmed 2026-09-01`
  - B: "The review routine runs weekly on Sundays." mono `source-014 · confirmed 2026-10-19`
  - Buttons: "Keep A", "Keep B", "Both true". On a choice the loser stays visible but turns `--ink-3` with a drawn strike and a mono tag `superseded`, the winner gains `confirmed`, the status changes `review → settled` with a layout animation, and a line appears: "The checker remembers your ruling and won't raise this pair again." "Both true" keeps both and tags them `both hold`. A quiet "Reset".
- Close with one mono example line from the wiki: `- The review routine runs daily at 02:00. ^ca8117b — source: [[source-001]] · confirmed: 2026-09-01`.

### 5. Actions (`Actions`)

- `<section id="actions">`. SectionHead split: title "Hands, with\nyour permission." Lede: "Ask it to open an app or get something done on the web. It drives a real browser in its own profile, and stops to ask before anything that sends, buys, posts or deletes."
- **Run demo**: a segmented control with three requests (layoutId pill): "Open an app" ("Jarvis, open Spotify."), "Read a page" ("Go to the course page and read me the next deadline."), "Something risky" ("Send my draft to the study group."). Below, a run log in a hairline frame: each step a row with a mono tool name, a plain description and a state (spinner → check icon). Steps appear in sequence with the snappy spring.
  - App: `list_apps` → `open_app Spotify` → spoken "Spotify's open."
  - Page: `browser_navigate` → `browser_snapshot` → `read` → spoken "The next deadline is the OS assignment, Thursday at 5 pm."
  - Risky: `browser_navigate` → `browser_type` (draft) → `browser_click "Send"` stops at **Waiting for you**: a row with a breathing ink ring, the text "This sends a message to 6 people." and two buttons "Approve" / "Not now". Clicking either resolves the row ("Sent" / "Cancelled. Nothing was sent.").
- Guardrails as a quiet two-column list under the demo (hairline rows, no cards): "It launches apps but never closes or kills them." · "It never types your passwords. You sign in yourself." · "Page content is treated as untrusted, never as instructions." · "Every step that changes something waits for your approval."
- Label the demo "Simulated".

### 6. Cost and routing (`Cost`)

- `<section id="cost">`. SectionHead stack: title "It thinks on what\nyou already pay for." Lede: "JARVIS signs in with the ChatGPT or Claude plan you already have and works within its normal limits. There's no API key to fund and no per-token bill."
- **Router demo**: a row of four example request chips; selecting one (auto-cycles until touched) highlights the row it routes to in a real `<table>` of routes. The highlight is a layoutId ink-outlined band; the chip shows a check.
  - "What's due this week?" → Local: answered from your notes, no model at all, about 20 ms, works offline.
  - "Explain Belady's anomaly." → Simple: one fast run on your plan's lightest model.
  - "Check the course page for new grades." → Medium: a named site, so a browser agent or your own site API.
  - "Build a dashboard for my study hours." → Complex: a planner splits it into steps for specialist agents, each on the lowest power that can do the job.
  - Table columns: Route, Sent when, What runs, Cost (`free` / `your plan`).
- Close with one sentence: "Routing is a handful of plain rules, so deciding where a request goes never costs a thing."

### 7. Everywhere: surfaces (`Everywhere`)

- `<section id="everywhere">` on a `--paper-2` band. SectionHead split: title "On every machine\nyou use." Lede: "Windows and Arch Linux, from the same install. Talk to it, type to it in a terminal, or call it over any app with Alt+1."
- A tabbed showcase (layoutId pill tabs): Voice, Terminal, Console, Overlay. One large hairline stage (aspect ~16/9 desktop, taller on mobile), content swapped with the blur-crossfade:
  - Voice: "“Jarvis, brief me.”" then a 3-line spoken brief and a small static waveform line.
  - Terminal: mono session with real commands and short synthetic output: `jarvis ask "open spotify"`, `jarvis vault brief`, `jarvis task add "Buy printer paper" --due friday`, `jarvis kb ask "how often does the review routine run?"`. Lines type in.
  - Console: a monochrome mock of the local console: prompt bar with tier choice, a session thread with two turns, a `LIVE` chip, push-to-talk hint "Hold Space to talk".
  - Overlay: a desktop silhouette with a translucent white sheet sliding down over it and two keycaps `Alt` `1`.
- Under the stage, two plain facts in a row: "Clipboard and one mouse shared across both laptops." · "Starts with your computer and listens from login."

### 8. Principles (`Principles`)

- `<section id="privacy">`. SectionHead stack: title "Built to\nstay yours."
- Five rows, full width, hairline separators, each: a statement in Funnel Display `--text-2xl` (left 6/12) and one sentence of mechanism in `--ink-2` (right 5/12). Rows reveal in sequence.
  1. "Your voice stays on your laptop." Voice detection, the voiceprint check and transcription all run locally, and a stranger's speech is never transcribed.
  2. "Your notes are never rewritten." Writes only add, refuse any file that changed since it was read, and every one is logged so you can undo it.
  3. "The console answers only to this machine." It listens on loopback only, rejects foreign hosts and requires a header on every change.
  4. "It asks before it acts." Buying, sending, posting, deleting and submitting forms all wait for your yes.
  5. "A cloud voice is your choice." Replies are spoken by a local voice model unless you turn on ElevenLabs.

### 9. Early access (`EarlyAccess`)

- `<section id="access" class="inverse">`, full-bleed `--inverse` band. The motif returns: a single white line across the band (lightweight animated SVG path or canvas, idle breathing; static under reduced motion).
- SectionHead stack inverse: title "Want your own\nJARVIS?" Lede: "Early access is opening a few people at a time. Leave your email and you'll hear from us when there's a place for you."
- Form: visible label "Email address", input (inverse styling, 56px tall, pill), submit Button inverse primary lg "Request early access". States: idle, submitting (button shows a spinner, input disabled), success (form swaps with the blur-crossfade to "You're on the list. We'll write to {email}."), error ("That doesn't look like an email address. Check it and try again." or "Something went wrong on our side. Try again in a minute."). Validate on submit, not while typing.
- Submission: if `import.meta.env.VITE_WAITLIST_ENDPOINT` is set, `fetch` POST JSON `{ email, source: "jarvis-site" }`; non-2xx → error state. If it is not set, wait ~700 ms, show success, and `console.info` that the endpoint is not configured.

### 10. Footer (`Footer`)

- `<footer id="footer" class="inverse">` continuing the black band, separated by an `--inverse-line` hairline. Left: `Wordmark` in `--on-inverse`. Middle: links (How it works, Memory, Actions, Privacy, Early access). Right: "Runs on Windows and Arch Linux." and "© 2026 JARVIS".

## Watermelon UI additions

Announcement bar in the nav, "Ask JARVIS" command palette (`/`, ⌘K), floating ink scroll island (appears after the hero, steps aside at `#access`), FAQ section, voice-transcribe in the Voice scene, copy-confirm in the Terminal scene, shimmer CTA. All restyled onto the tokens; see DESIGN.md.

## Unresolved decisions (owner)

- Waitlist backend (`VITE_WAITLIST_ENDPOINT`).
- Platforms to name publicly beyond Windows and Arch Linux.
- Any public commitments about release timing or pricing (none on the page).
