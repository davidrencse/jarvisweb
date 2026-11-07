const PLAIN = ["HELP", "BRIEF", "DUE", "HIST", "CRED", "DEV"] as const;
type Plain = (typeof PLAIN)[number];

export type Command =
  | { fn: Plain; echo: string }
  | { fn: "TASK"; echo: string; text: string; due: string | null }
  | { fn: "DO"; echo: string; request: string }
  | { fn: "MEM"; echo: string; query: string }
  | { fn: "KB"; echo: string; question: string }
  | { fn: "ASK"; echo: string; text: string }
  | { fn: "ERROR"; echo: string; message: string; plain: string; tries: string[] };

const isPlain = (s: string): s is Plain => (PLAIN as readonly string[]).includes(s);

const error = (echo: string, message: string, plain: string, tries: string[] = ["HELP"]): Command => ({
  fn: "ERROR",
  echo,
  message,
  plain,
  tries,
});

const titleCase = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

const unquote = (s: string) => s.replace(/^(["“'])(.*)(["”'])$/, "$2").trim();

/** Turns what was typed into a command. Case-insensitive, tolerant of extra spaces, never throws. */
export function parse(input: string): Command | null {
  const text = input.trim().replace(/^\/\s*/, "").replace(/\s+/g, " ");
  if (!text) return null;

  const [head, ...rest] = text.split(" ");
  const code = head.toUpperCase();
  const args = rest.join(" ");

  if (isPlain(code)) {
    if (args) {
      return error(
        code,
        `${code} doesn’t take anything after it. Type ${code} on its own.`,
        `${code} works by itself, so nothing ran. Type just ${code} and press Enter.`,
        [code],
      );
    }
    return { fn: code, echo: code };
  }

  if (code === "TASK") {
    const m = args.match(/^add(?:\s+(.*))?$/i);
    let body = m?.[1] ?? "";
    let due: string | null = null;
    const d = body.match(/(?:^|\s)--due\s+(.+)$/i);
    if (d) {
      due = titleCase(d[1].trim());
      body = body.slice(0, d.index).trim();
    }
    body = unquote(body);
    if (!m || !body) {
      return error(
        `TASK ${args}`.trim(),
        "TASK ADD needs the task, then optionally --due and a day. Try TASK ADD buy printer paper --due friday.",
        "To add a task, type TASK ADD and then what you need to do. Add --due and a day if it has a deadline.",
        ["TASK ADD buy printer paper --due friday"],
      );
    }
    return { fn: "TASK", echo: `TASK ADD ${body}${due ? ` --due ${due.toLowerCase()}` : ""}`, text: body, due };
  }

  if (code === "DO") {
    const request = unquote(args);
    if (!request) {
      return error(
        "DO",
        "DO needs something to do. Try DO open spotify on the dell.",
        "DO runs an action on one of your machines, so say what to do after it.",
        ["DO open spotify on the dell", "DO volume 30"],
      );
    }
    return { fn: "DO", echo: `DO ${request}`, request };
  }

  if (code === "MEM") {
    if (!args) {
      return error(
        "MEM",
        "MEM needs a few words to look for. Try MEM lan mouse.",
        "MEM searches what JARVIS remembers, so give it a few words to look for.",
        ["MEM lan mouse"],
      );
    }
    return { fn: "MEM", echo: `MEM ${args}`, query: args };
  }

  if (code === "KB") {
    if (!args) {
      return error(
        "KB",
        "KB needs a question. Try KB how often does the review routine run?",
        "KB asks your wiki a question, so type the question after it.",
        ["KB how often does the review routine run?"],
      );
    }
    return { fn: "KB", echo: `KB ${args}`, question: args };
  }

  if (code === "ASK") {
    if (!args) {
      return error(
        "ASK",
        "ASK needs something to ask. Try ASK what did I decide about the clipboard?",
        "ASK shows where a request would go and what it would cost, so type it after the word ASK.",
        ["ASK what did I decide about the clipboard?"],
      );
    }
    return { fn: "ASK", echo: `ASK ${args}`, text: args };
  }

  return error(
    head,
    `No function called ${head.toUpperCase()}. Type HELP to see them all.`,
    "That isn’t one of the shortcuts, so nothing ran. HELP lists them all. To run an action in your own words, start with DO, or just say “Jarvis.”",
  );
}
