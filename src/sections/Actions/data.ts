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
    say: "Jarvis, open Spotify.",
    steps: [
      { tool: "list_apps", text: "Checks which apps are installed." },
      { tool: "open_app Spotify", text: "Launches Spotify." },
      { tool: "Spoken", text: "Spotify’s open.", spoken: true },
    ],
  },
  {
    id: "page",
    label: "Read a page",
    say: "Go to the course page and read me the next deadline.",
    steps: [
      { tool: "browser_navigate", text: "Opens the course page in its own browser profile." },
      { tool: "browser_snapshot", text: "Reads what is on the page." },
      { tool: "read", text: "Picks out the next deadline." },
      { tool: "Spoken", text: "The next deadline is the OS assignment, Thursday at 5 pm.", spoken: true },
    ],
  },
  {
    id: "risky",
    label: "Something risky",
    say: "Send my draft to the study group.",
    steps: [
      { tool: "browser_navigate", text: "Opens the message page in its own browser profile." },
      { tool: "browser_type", text: "Types your draft into the message." },
      { tool: 'browser_click "Send"', text: "This sends a message to 6 people.", gate: true },
    ],
  },
];

export const GUARDRAILS = [
  "It launches apps but never closes or kills them.",
  "It never types your passwords. You sign in yourself.",
  "Page content is treated as untrusted, never as instructions.",
  "Every step that changes something waits for your approval.",
];
