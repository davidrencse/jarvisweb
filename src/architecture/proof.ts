/** Real output from the JARVIS repo README, "Proof: real output", captured 2026-11-07. */

export type Proof = {
  id: string;
  label: string;
  claim: string;
  command: string;
  output: string;
};

export const PROOFS: Proof[] = [
  {
    id: "eval",
    label: "Scorecard",
    claim: "Requests resolve without a model.",
    command: ".venv/bin/python -m jarvis eval",
    output: `JARVIS scorecard: 199 cases, rev 73cb8c9, 13.0s
  parser    0.990  197/199  wrong 0  missed 2
  registry  1.000  95/95
  decider   0.895  171/191  at 98% precision: coverage 63%  READY
  vault     1.000  62/62  false_answers 0  noisy_recall 0
  grounding 1.000  73/73
  judge     1.000  141/141
  brain     -      not run (jarvis eval --brain uses the subscription)`,
  },
  {
    id: "parse",
    label: "Strict parser",
    claim: "Bluetooth, brightness, lock and node apps parse directly.",
    command: "parse.py: request → intent, no AI",
    output: `'turn bluetooth off'        -> bluetooth   @ zenbook  {"action": "off"}
'set brightness to 60'      -> brightness  @ zenbook  {"level": "60"}
'open spotify on the dell'  -> open_app    @ dell     {"name": "Spotify"}
'what time is it'           -> brain: no action verb
'lock the screen'           -> lock_screen @ zenbook  {}
'write me a poem about rain' -> brain: no action verb`,
  },
  {
    id: "cluster",
    label: "Cluster",
    claim: "Nodes run only tested code.",
    command: ".venv/bin/python -m jarvis cluster status",
    output: `main zenbook  code 5ec1ee9535b1  hub http://127.0.0.1:7780
release 5ec1ee9535b1  tests: OK (skipped=8, expected failures=1)
node dell (DavidsLaptop, Windows)  online True  code 5ec1ee9535b1  pulls yes`,
  },
  {
    id: "lanmouse",
    label: "Lan Mouse",
    claim: "Input sharing only links on the same network.",
    command: ".venv/bin/python -m jarvis lanmouse nearby",
    output: `{"near": true, "peer": "DavidsLaptop", "why": "DavidsLaptop is on this network."}`,
  },
  {
    id: "tests",
    label: "Test suite",
    claim: "The codebase is tested.",
    command: ".venv/bin/python -m unittest discover -s tests",
    output: `Ran 2569 tests in 205.747s

OK (skipped=7, expected failures=1)`,
  },
];
