export type RouteId = "free" | "interpret" | "agent" | "build";

export type Route = {
  id: RouteId;
  name: string;
  when: string;
  runs: string;
  cost: string;
};

export type Example = {
  text: string;
  route: RouteId;
};

export const ROUTES: Route[] = [
  {
    id: "free",
    name: "No model",
    when: "A fixed phrase, or a command it can read exactly one way.",
    runs: "Instant answers and a strict parser that turns the request into a typed command. It works offline.",
    cost: "0 tokens",
  },
  {
    id: "interpret",
    name: "Interpreter",
    when: "Anything the parser isn’t sure about.",
    runs: "One warm call on your ChatGPT plan turns it into checked commands or a conversation. About 1 s.",
    cost: "your plan",
  },
  {
    id: "agent",
    name: "Agent",
    when: "A step needs judgement inside a logged-in app or account.",
    runs: "Handed to a browser agent after a ten-check preflight. When it says it’s done, that’s reported as its claim.",
    cost: "its own plan",
  },
  {
    id: "build",
    name: "Build",
    when: "The job is software work with several parts.",
    runs: "A planner splits it into steps for specialist agents, each on the lowest tier that can do it. Nothing runs until you say so.",
    cost: "your plan",
  },
];

export const EXAMPLES: Example[] = [
  { text: "Open Spotify on the Dell.", route: "free" },
  { text: "What did I decide about the clipboard?", route: "interpret" },
  { text: "Play the song Kevin sent me.", route: "agent" },
  { text: "Build a dashboard for my study hours.", route: "build" },
];
