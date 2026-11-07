import { Faq5, type FaqCategory } from "@/components/ui/faq-5";

const CATEGORIES: FaqCategory[] = [
  {
    title: "Questions,\nanswered.",
    description: "Anything else, ask when you request access.",
    items: [
      {
        question: "Do I have to learn terminal commands?",
        answer:
          "No. Every command answers with a plain-English line, the F-keys open the common views, and you can always skip the typing and just ask JARVIS out loud.",
      },
      {
        question: "How does it work across more than one computer?",
        answer:
          "One machine is the main and runs the brain, memory and a small hub. Each other computer joins with a one-time invite and picks up signed jobs over SSH. Say “on the Dell” or “the other one” and the action runs there.",
      },
      {
        question: "Do I need an OpenAI or Anthropic API key?",
        answer:
          "No. Most requests are settled by plain rules without a model. The rest go through the ChatGPT or Claude apps you already use, so they count against your plan’s normal limits rather than a per-token bill.",
      },
      {
        question: "What if my ChatGPT plan runs out?",
        answer:
          "JARVIS reads the reset time from the limit message and lets Claude answer until then, with the same instructions and tools. If Claude isn’t signed in either, it tells you so.",
      },
      {
        question: "Does my voice leave my laptop?",
        answer:
          "Not in everyday use. Listening, the voiceprint check and transcription all run on your machine, and the local voice can read replies. Audio only goes out if you choose ElevenLabs as the voice.",
      },
      {
        question: "What happens if someone else says “Jarvis”?",
        answer:
          "Nothing. The voiceprint check runs alongside transcription, and a voice that isn’t yours is dropped before its words are read or kept.",
      },
      {
        question: "Which computers does it run on?",
        answer:
          "Windows 11 and Arch Linux with Hyprland are used every day. macOS, sway and X11 desktops are supported in the code but so far only tested in unit tests. The Alt+1 overlay is Windows-only; on Linux you bind a key to open the console.",
      },
      {
        question: "Do I have to use Obsidian?",
        answer:
          "No. JARVIS keeps its own memory of every conversation and distils it into facts and lessons either way. Connect an Obsidian vault and it also reads your notes, deadlines and tasks. The vault starts switched off.",
      },
      {
        question: "Could it break something on my computer?",
        answer:
          "Anything that sends, buys, posts, deletes or closes an app with unsaved work waits for your yes, and terminal commands that change things are parked for your OK. Every action is checked on screen afterwards.",
      },
      {
        question: "Can I control the other computer’s screen?",
        answer:
          "Yes, from the main’s console. The Remote view streams a node’s screen at 6, 10 or 15 fps and sends your mouse and keys back over the SSH tunnel the cluster already uses, so no new port opens. However a session ends, every held key is released.",
      },
      {
        question: "How do I know the numbers on this site are real?",
        answer:
          "They come from the JARVIS repo and its own checks, run on 7 November 2026: the free scorecard puts the parser at 0.990 with 0 wrong calls on 199 cases, and 2,569 tests pass. The architecture page shows the raw output and the commands to rerun it.",
      },
      {
        question: "Does it work offline?",
        answer:
          "Partly. Fixed phrases, parsed commands on your own machines, briefings, memory search, transcription and the local voice all work without a connection. Questions that need the model wait until you’re back online.",
      },
    ],
  },
];

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-[var(--section-y)]">
      <div className="container">
        <Faq5 headingId="faq-title" categories={CATEGORIES} />
      </div>
    </section>
  );
}
