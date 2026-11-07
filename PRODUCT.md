# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript, Motion (`motion/react`, formerly Framer Motion) for animation, CSS Modules plus global tokens. Chosen by the owner.

## Users

People who would want their own JARVIS: technical power users (developers, students, builders) who already pay for ChatGPT or Claude, keep their notes in Obsidian, often run more than one machine (Windows and Linux), and care where their voice and notes go. They read the site at a desk, evaluating whether to ask for access.

## Product Purpose

JARVIS is a personal assistant and operating layer across the user's own computers. You talk to it ("Jarvis, ...") or type; it checks the voice is yours, settles most requests with plain rules and no model, acts on whichever machine you meant (open, close and focus apps, links, media, volume, files, clipboard), verifies the result on screen, and answers aloud. The site exists to explain that clearly and collect early-access requests.

## Positioning

**One assistant for every computer you own.** One machine is the main (brain, memory, hub); every other computer is a node that picks up signed jobs. Under that promise sit the mechanisms: cheapest path first (rules, then a model only when needed), it only answers to your voice, it never pays per token (ChatGPT and Claude subscriptions plus free local models), and every action is gated before and checked after. The earlier "Bloomberg Terminal for everything" line and the Markets feature were retired on 2026-11-07: Markets is no longer in the JARVIS repo.

## Operating Context

Source of truth: the JARVIS repo (README, docs/architecture-guide.md, docs/handbook/). Figures as of 2026-11-07.

- Request flow: instant phrases → strict parser (0 tokens, accepts only a request with exactly one reading) → intent registry (executor, risk, observer) → gates → history checks → confirm queue for risky steps → `remote.call` (here, or a signed job to a node) → on-screen observe → record. Unparseable requests go to the interpreter (one warm ChatGPT call, about 1.1k tokens, about 1 s), which picks a mode: act, agent, converse, build or clarify.
- Outcome states: observed, unconfirmed, uncertain, agent_claimed, user_confirmed, pre_effect_failure. Unconfirmed and uncertain are reported, never retried.
- Cluster: exactly one main (`cluster.main_device`); nodes long-poll a hub on 127.0.0.1:7780 over an SSH tunnel (forward by default). Setup is `cluster init` + `cluster invite <node>` on the main and `cluster join <code>` on the node. Jobs are signed, delivered at most once; nodes refuse mismatched code; pinned host keys.
- Remote control: drive a node's screen from the main's console (JPEG frames, low/medium/high = 960/1280/1920 px at 6/10/15 fps); dead-man release after 6 s; every key released however a session ends; 4 h cap.
- Input sharing: patched Lan Mouse (UDP 4242), same network only (never Tailscale), stops after 2 readings apart, restarts when together unless stopped by hand. Clipboard sync both ways, text and images; password-manager copies stay put.
- Voice: Silero VAD, ERes2Net speaker check (threshold about 0.36, clamped 0.30–0.36; owner's live scores 0.38–0.45; below 0.08 never transcribed), Parakeet TDT 0.6B v3 then Whisper large-v3-turbo when unsure. Wake recall 93.6% at 1.1% false wakes (fuzzy + Whisper path); speaker EER 0 on 77 positives vs 92 negatives. Kokoro local voice or ElevenLabs.
- Models: ChatGPT lane (Codex app-server on a ChatGPT login) first; Claude CLI failover when ChatGPT hits a usage limit, until the reset time. Grok Bot handles judgement inside logged-in apps after a ten-check preflight. Complex software work goes to a planner plus specialist agents.
- Memory: SQLite memory heap, BM25 plus MiniLM vectors fused; nightly consolidation into fact, preference, lesson and loop items; corrections become lessons; every brain call gets the last 20 min of conversation plus a memory pack.
- Obsidian vault: optional. JARVIS reads it (world brief, bounded recall, Obsidian Tasks, briefings in about 20 ms offline); vault writes are off (System page shows "vault writes: off", README says it never writes). If writing is enabled it is additive-only and logged.
- Knowledge engine: Reader / Librarian / Checker / You rule (unchanged).
- Safety: ask first for buying, paying, posting, sending, deleting, form submits, account changes, closing apps with unsaved work, and terminal commands that change anything; never types passwords; web, vault and agent text is data, not instructions.
- Surfaces: CLI, loopback web console, Alt+1 overlay (Windows), Hyprland key on Linux. Windows 11 and Arch/Hyprland are used daily; macOS, sway and X11 are unit-tested only.
- Tests: 2,569 pass (7 skipped, 1 expected failure), all mocked. Free scorecard (`jarvis eval`): parser 0.990 (197/199, 0 wrong), registry, vault, grounding and judge 1.000.
- Sandbox: brain terminal commands on Linux run in bubblewrap (143 paths hidden, 61 read-only; JARVIS's own code read-only).
- Code size: 91 modules, 40,261 lines, filed by station (Hear, Decide, Remember, Think, Act, Speak, Log, Surfaces, Machines), from the console's Under the hood view.
- Console views: Console, Knowledge (653 records, 11 clusters), System, Credits (live Claude/Codex plan windows), Memory (465 items), Files (both laptops, copies never overwrite), Connections, Remote (live at 9.2 fps), Settings.

## Capabilities and Constraints

- Real today: everything listed above, on the owner's two machines (Zenbook = main, Arch/Hyprland; Dell G15 = node, Windows 11).
- Undecided: pricing, public release date, waitlist backend.
- The early-access form has no backend yet; it posts to `VITE_WAITLIST_ENDPOINT` when set.

## Brand Commitments

- Name: JARVIS (all caps).
- Headline: "One assistant for every computer you own." (Replaced the Bloomberg line on 2026-11-07 when Markets left the product.)
- Visual brief pinned by the owner: white, monochrome, sleek, with Framer-style motion.

## Evidence on Hand

Real console captures from 2026-11-07 (JARVIS repo `docs/images/`) as WebP in `public/screens/console/`: console, knowledge, remote-live, devices, memory, credits, files, settings, and the System page (design-flow, design-health, design-code). The hero and the Console section use these. The older light/dark captures in `public/screens/` (2026-10-24, still showing Markets) are no longer referenced. Measured figures in the JARVIS repo (README "Proof: real output", docs/handbook/voice.md, docs/architecture-guide.md). No customers, testimonials, press, pricing, benchmarks against competitors, or user counts exist; none may be invented. Demo transcripts on the site are synthetic and labelled as simulated.

## Product Principles

1. Yours first: voice, notes and state stay on your machines unless you choose a cloud voice.
2. No new meter: it runs on subscriptions you already pay for.
3. Gated and checked: it asks before anything with consequences, and verifies every action on screen.
4. Cheapest path first: most requests never reach a model.
5. Show the mechanism: real numbers and real behaviour, never vague magic.

## Accessibility & Inclusion

WCAG 2.2 AA. Every animation has a reduced-motion path; demos must be pausable and readable without motion.
