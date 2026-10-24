export type Note = {
  path: string;
  title: string;
  terms: Record<string, number>;
  excerpt: [string, string];
};

/** Synthetic vault. Weights are hand-set so the demo scores read like real recall. */
export const NOTES: Note[] = [
  {
    path: "courses/operating-systems.md",
    title: "Operating Systems",
    terms: {
      os: 0.48,
      operating: 0.48,
      system: 0.3,
      systems: 0.3,
      midterm: 0.43,
      exam: 0.36,
      assignment: 0.5,
      scheduling: 0.34,
      paging: 0.3,
      page: 0.28,
      belady: 0.4,
      fifo: 0.3,
      deadlock: 0.3,
      lecture: 0.3,
      course: 0.3,
    },
    excerpt: ["Midterm covers scheduling, paging and deadlocks.", "Assignment 3 is due Thursday at 5 pm."],
  },
  {
    path: "calendar.md",
    title: "Calendar",
    terms: {
      calendar: 0.6,
      schedule: 0.45,
      os: 0.38,
      midterm: 0.39,
      week: 0.4,
      today: 0.4,
      tomorrow: 0.4,
      thursday: 0.4,
      friday: 0.4,
      due: 0.4,
      deadline: 0.4,
      meeting: 0.4,
      exam: 0.35,
    },
    excerpt: ["Thu 17:00, OS assignment due. Fri morning is blocked for the drone build.", "Midterm week starts Monday."],
  },
  {
    path: "projects/drone-blueprint.md",
    title: "Drone Blueprint",
    terms: {
      drone: 0.6,
      blueprint: 0.55,
      motor: 0.5,
      motors: 0.5,
      frame: 0.45,
      flight: 0.45,
      controller: 0.45,
      build: 0.4,
      parts: 0.4,
      project: 0.35,
      order: 0.3,
      os: 0.26,
      midterm: 0.26,
    },
    excerpt: ["Next step: pick a flight controller.", "Then order the frame."],
  },
  {
    path: "courses/algorithms.md",
    title: "Algorithms",
    terms: {
      algorithm: 0.55,
      algorithms: 0.55,
      sorting: 0.5,
      graph: 0.45,
      complexity: 0.45,
      midterm: 0.3,
      exam: 0.3,
      lecture: 0.3,
      course: 0.3,
    },
    excerpt: ["Graph search, shortest paths and dynamic programming.", "Problem set 4 is open."],
  },
  {
    path: "people/study-group.md",
    title: "Study Group",
    terms: { study: 0.55, group: 0.55, draft: 0.45, meeting: 0.4, send: 0.3, library: 0.4 },
    excerpt: ["Meets Saturday at the library.", "The OS project draft goes out before then."],
  },
  {
    path: "inbox.md",
    title: "Inbox",
    terms: { inbox: 0.6, printer: 0.55, paper: 0.4, buy: 0.45, errands: 0.45, groceries: 0.5, tasks: 0.35, todo: 0.3 },
    excerpt: ["Buy printer paper, due Friday.", "Renew library card."],
  },
];

export const SOURCES = [
  { id: "source-001", label: "Review routine, daily" },
  { id: "source-014", label: "Review routine, weekly" },
  { id: "source-003", label: "Belady’s anomaly" },
  { id: "source-007", label: "Drone motors" },
];

export const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
