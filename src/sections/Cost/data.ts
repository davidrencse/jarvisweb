export type RouteId = "local" | "simple" | "medium" | "complex";

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
    id: "local",
    name: "Local",
    when: "A briefing your notes can answer.",
    runs: "Answered from your notes with no model at all. About 20 ms, and it works offline.",
    cost: "free",
  },
  {
    id: "simple",
    name: "Simple",
    when: "A plain question.",
    runs: "One fast run on your plan’s lightest model.",
    cost: "your plan",
  },
  {
    id: "medium",
    name: "Medium",
    when: "The request names a site.",
    runs: "A browser agent, or your own site API.",
    cost: "your plan",
  },
  {
    id: "complex",
    name: "Complex",
    when: "The job has several parts.",
    runs: "A planner splits it into steps for specialist agents, each on the lowest power that can do the job.",
    cost: "your plan",
  },
];

export const EXAMPLES: Example[] = [
  { text: "What’s due this week?", route: "local" },
  { text: "Explain Belady’s anomaly.", route: "simple" },
  { text: "Check the course page for new grades.", route: "medium" },
  { text: "Build a dashboard for my study hours.", route: "complex" },
];
