export type MemoryItem = {
  id: string;
  title: string;
  terms: Record<string, number>;
  excerpt: [string, string];
};

/** Synthetic memory heap. Weights are hand-set so the demo scores read like real recall. */
export const MEMORY: MemoryItem[] = [
  {
    id: "fact:20261103:4be21a",
    title: "Lan Mouse port",
    terms: {
      lan: 0.55,
      mouse: 0.55,
      udp: 0.5,
      port: 0.5,
      "4242": 0.6,
      input: 0.4,
      keyboard: 0.4,
      cursor: 0.4,
      share: 0.3,
      sharing: 0.3,
    },
    excerpt: ["Lan Mouse uses UDP port 4242 on both laptops.", "fact · from 2 messages · seen 3 times"],
  },
  {
    id: "lesson:20261105:c19f07",
    title: "“The other one”",
    terms: {
      dell: 0.55,
      other: 0.5,
      one: 0.2,
      laptop: 0.4,
      pc: 0.4,
      machine: 0.4,
      meant: 0.45,
      correction: 0.45,
      mouse: 0.12,
    },
    excerpt: ["When you say “the other one”, you mean the Dell.", "lesson · saved when you said “no, I meant the Dell”"],
  },
  {
    id: "preference:20261102:77ad30",
    title: "Music on the Zenbook",
    terms: { spotify: 0.6, music: 0.55, play: 0.4, songs: 0.45, song: 0.45, zenbook: 0.45, playlist: 0.4 },
    excerpt: ["You play music on the Zenbook, not the Dell.", "preference · seen 4 times"],
  },
  {
    id: "loop:20261106:0e93b2",
    title: "Flight controller",
    terms: { drone: 0.6, flight: 0.55, controller: 0.55, motors: 0.45, motor: 0.45, build: 0.35, project: 0.35, friday: 0.3 },
    excerpt: ["Still open: you said you’d pick a flight controller by Friday.", "loop · stays in recall until it’s closed"],
  },
  {
    id: "reply:20261104:858794",
    title: "Clipboard decision",
    terms: {
      clipboard: 0.6,
      copy: 0.45,
      paste: 0.45,
      sync: 0.5,
      decide: 0.45,
      decided: 0.45,
      decision: 0.45,
      password: 0.4,
      passwords: 0.4,
    },
    excerpt: ["You decided password-manager copies never sync.", "reply · from a conversation on Nov 4"],
  },
  {
    id: "fact:20261101:a0c4d2",
    title: "OS midterm",
    terms: { os: 0.55, midterm: 0.6, exam: 0.5, operating: 0.45, systems: 0.4, scheduling: 0.4, paging: 0.4, belady: 0.3 },
    excerpt: ["Your OS midterm is on Nov 12 and covers scheduling and paging.", "fact · from 1 message"],
  },
];

export const SOURCES = [
  { id: "source-001", label: "Review routine, daily" },
  { id: "source-014", label: "Review routine, weekly" },
  { id: "source-003", label: "Belady’s anomaly" },
  { id: "source-007", label: "Drone motors" },
];

export type DeviceId = "zenbook" | "dell";

export const DEVICES: Record<DeviceId, { name: string; role: "main" | "node"; os: string }> = {
  zenbook: { name: "Zenbook", role: "main", os: "Arch · Hyprland" },
  dell: { name: "Dell", role: "node", os: "Windows 11" },
};

export const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
