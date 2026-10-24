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
        question: "Is Markets financial advice? Does it trade for me?",
        answer:
          "Neither. Markets reads market data, explains it and tests strategy ideas on history in practice mode. There is no code in JARVIS that can place an order, move money or touch a wallet.",
      },
      {
        question: "Do I need an OpenAI or Anthropic API key?",
        answer:
          "No. JARVIS signs in through the ChatGPT or Claude apps you already use, so its answers count against your plan's normal limits rather than a per-token bill.",
      },
      {
        question: "Does my voice leave my laptop?",
        answer:
          "Not in everyday use. Listening, the voiceprint check and transcription all run on your machine, and replies are spoken by a local voice. Audio only goes out if you turn on ElevenLabs for live calls.",
      },
      {
        question: "What happens if someone else says “Jarvis”?",
        answer:
          "Nothing. The voiceprint check runs before a single word is transcribed, so a voice that isn't yours is never written down and never answered.",
      },
      {
        question: "Which computers does it run on?",
        answer:
          "Windows and Arch Linux, from the same install. The Alt+1 overlay is Windows-only for now; on Linux you bind a key to open the console instead.",
      },
      {
        question: "Do I have to use Obsidian?",
        answer:
          "No. JARVIS keeps its own searchable memory of every conversation either way. Point it at an Obsidian vault and it also reads your notes, deadlines and tasks.",
      },
      {
        question: "Could it break something on my computer?",
        answer:
          "It opens apps but never closes them, it only ever adds to your notes, and any step that sends, buys, posts, deletes or submits a form waits for your yes.",
      },
      {
        question: "Does it work offline?",
        answer:
          "Partly. Briefings, tasks, searching your notes, transcription and the local voice all work without a connection. Questions that need the model wait until you're back online.",
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
