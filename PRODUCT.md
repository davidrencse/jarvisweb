# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript, Motion (`motion/react`, formerly Framer Motion) for animation, CSS Modules plus global tokens. Chosen by the owner.

## Users

People who would want their own JARVIS: technical power users (developers, students, builders) who already pay for ChatGPT or Claude, keep their notes in Obsidian, often run more than one machine (Windows and Linux), and care where their voice and notes go. They read the site at a desk, evaluating whether to ask for access.

## Product Purpose

JARVIS is a personal assistant and workflow layer that runs on the user's own laptops. You talk to it ("Jarvis, ...") or type; it checks the voice is yours, recalls from your own notes, thinks on the AI subscriptions you already have, acts on your apps and a real browser with your approval, and answers aloud. The site exists to explain that clearly and collect early-access requests.

## Positioning

**A Bloomberg Terminal for everything, built for regular people.** Bloomberg built a terminal for money; JARVIS is one for the rest of your life: notes, deadlines, tasks, markets, machines and AI usage on one screen, answered in plain English. You can type terse terminal commands (BRIEF, DUE, NOTE, KB, BTC GP 30D, CRED, DEV) or just say "Jarvis". Under that promise sit the original mechanisms: it only answers to your voice (on-device voiceprint check before transcription), it thinks on the AI subscriptions you already pay for, and its writes to your notes are additive only. Markets is recon only: JARVIS contains no order, transfer or wallet code.

## Operating Context

- Voice: on-device voice activity detection, speaker verification (sherpa-onnx ERes2Net, about 0.5 s on CPU), Whisper large-v3-turbo transcription (about 0.3 s per sentence on a laptop GPU), wake word "Jarvis".
- Brain: Codex app-server on a ChatGPT login (about 1 s replies, 0.9 to 1.6 s measured); Claude fast lane as an alternative. Router is regex heuristics (no model call, costs nothing): simple, medium, complex tiers. Complex work goes to a planner plus specialist agents, each at the lowest viable power tier.
- Speech: Kokoro local voice (free, offline, about 0.7 s per sentence, streamed sentence by sentence); ElevenLabs optional, including live calls with barge-in.
- Memory: SQLite FTS5 memory heap of every turn; Obsidian vault recall (up to 4 notes / 900 chars, abstains on weak matches); world brief of courses, projects, deadlines, agenda.
- Tasks: Obsidian Tasks format checkbox lines; "I finished X" ticks the same line with a done date.
- Knowledge engine: Reader collects (hashed, read-only raw sources), Librarian writes claims with sources, Checker doubts nightly (contradictions flagged, never overwritten), You rule (keep / drop / both).
- Actions: open apps, open links, drive a real Chrome via Playwright MCP; each state-changing browser step is approved; never buys, sends, posts, deletes or submits without confirmation; never types passwords.
- Markets (True Markets data, recon only): plain-English market pulse with a mood gauge (fearful to greedy) and market-cap heatmap; strategies as data (`sma(20) crosses_above sma(50)`) backtested long-only with no look-ahead, reported as "$1,000 → $X vs holding", Sharpe, max drawdown, trades, win rate; a Bloomberg-style Pro terminal with a `/` command line (`BTC`, `ETH GP 30D`, `DES SOL`, `TOP`, `NEW`, `BT`, `HELP`) and F1–F5 panes (help, monitor, chart, intel, lab).
- Console dashboard: agent status, Claude and Codex usage windows, machines link (ping, free memory, load), runs, recent memory, assistant; light and dark themes.
- Surfaces: CLI (`jarvis ask`, `jarvis chat`, `jarvis voice`), local web console (loopback only), Alt+1 overlay on Windows, Arch Linux / Hyprland support, clipboard sync between two laptops.
- Briefings ("brief me", "what's due?") answered from local notes in about 20 ms, offline, without the model.

## Capabilities and Constraints

- Real today: everything listed above, on the owner's two machines.
- Undecided: pricing, public release date, platform support beyond Windows and Arch Linux, waitlist backend.
- The early-access form has no backend yet; it posts to `VITE_WAITLIST_ENDPOINT` when set.

## Brand Commitments

- Name: JARVIS (all caps).
- Marketing line chosen by the owner: "a Bloomberg Terminal for everything", for regular people. (Bloomberg is a third-party trademark: used comparatively only, no Bloomberg logos, colors or styling.)
- Visual brief pinned by the owner: white, monochrome, sleek, with Framer-style motion.

## Evidence on Hand

Real console screenshots (light and dark) in `public/screens/`, captured 2026-10-24 from the owner's running console. Measured figures in the JARVIS repo README and docs/architecture.md (latencies above, voiceprint threshold 0.45, owner clips 0.62 to 0.86, impostors 0.12 or lower). No customers, testimonials, press, pricing, benchmarks against competitors, or user counts exist; none may be invented. Demo transcripts on the site are synthetic and labelled as simulated.

## Product Principles

1. Yours first: voice, notes and state stay on your machines unless you choose a cloud voice.
2. No new meter: it runs on subscriptions you already pay for.
3. Additive, audited, approved: it never deletes your notes, and it asks before it acts.
4. Show the mechanism: real numbers and real behaviour, never vague magic.

## Accessibility & Inclusion

WCAG 2.2 AA. Every animation has a reduced-motion path; demos must be pausable and readable without motion.
