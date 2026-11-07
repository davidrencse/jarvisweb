export type Step = {
  tool: string;
  text: string;
  spoken?: boolean;
  gate?: boolean;
};

export type RunRequest = {
  id: string;
  label: string;
  say: string;
  steps: Step[];
};

export const REQUESTS: RunRequest[] = [
  {
    id: "app",
    label: "Open an app",
    say: "Jarvis, open Spotify on the Dell.",
    steps: [
      { tool: "open_app Spotify · dell", text: "Read by the parser. No model needed." },
      { tool: "signed job → dell", text: "Sent to the Dell over the cluster link." },
      { tool: "observe", text: "Watches for a Spotify window. Seen after 2.4 s." },
      { tool: "Spoken", text: "Spotify’s open on the Dell.", spoken: true },
    ],
  },
  {
    id: "page",
    label: "Read a page",
    say: "In the agent browser, go to the course page and read me the next deadline.",
    steps: [
      { tool: "browse course page", text: "Opens the page in JARVIS’s own Chrome, which you can watch in the console." },
      { tool: "agent_browser_read", text: "Reads what is on the page as text." },
      { tool: "read", text: "Picks out the next deadline." },
      { tool: "Spoken", text: "The next deadline is the OS assignment, Thursday at 5 pm.", spoken: true },
    ],
  },
  {
    id: "risky",
    label: "Something risky",
    say: "Send my draft to the study group.",
    steps: [
      { tool: "interpret · agent", text: "Needs a signed-in account, so it goes to the browser." },
      { tool: "browser_type", text: "Types your draft into the message." },
      { tool: 'browser_click "Send"', text: "This sends a message to 6 people.", gate: true },
    ],
  },
];

export const GUARDRAILS = [
  "Every action is checked on screen. If it can’t be seen, it’s reported as unconfirmed and never retried.",
  "It never types passwords, 2FA codes or card numbers. You sign in yourself.",
  "Text from web pages, notes and other agents is treated as data, never as instructions.",
  "Sending, buying, posting, deleting and closing apps with unsaved work all wait for your yes.",
];
