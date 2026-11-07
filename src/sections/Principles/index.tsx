import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import styles from "./Principles.module.css";

const PRINCIPLES = [
  {
    statement: "Your voice stays on your laptop.",
    mechanism:
      "Voice detection, the voiceprint check and transcription all run locally, and a stranger’s words are dropped unread.",
  },
  {
    statement: "Most requests never reach a model.",
    mechanism:
      "Fixed phrases and a strict parser settle them on your machine, at 0 tokens. A model is asked only when the rules can’t decide.",
  },
  {
    statement: "Your machines only talk to each other.",
    mechanism:
      "The hub listens on loopback, jobs are signed and travel over SSH with pinned keys, and a node refuses code that doesn’t match the main.",
  },
  {
    statement: "It asks before it acts, and checks after.",
    mechanism:
      "Buying, sending, posting and deleting wait for your yes. Every action is read back from the screen, and what can’t be seen is reported, not claimed.",
  },
  {
    statement: "Your notes are never rewritten.",
    mechanism:
      "JARVIS reads your vault for recall and briefings with writing switched off. Turn writing on and it only adds lines, refuses any file that changed since it was read, and logs each one so you can undo it.",
  },
  {
    statement: "Its shell is boxed in.",
    mechanism:
      "On Linux, terminal commands the brain runs go through bubblewrap: 143 paths hidden, including secrets and browser profiles, 61 read-only, and JARVIS’s own code can’t be edited.",
  },
  {
    statement: "A cloud voice is your choice.",
    mechanism: "Replies are spoken by a local voice model unless you turn on ElevenLabs.",
  },
];

export default function Principles() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className={styles.section}>
      <div className="container">
        <SectionHead id="privacy-title" title={"Built to\nstay yours."} />

        <ul className={styles.list}>
          {PRINCIPLES.map((p, i) => (
            <li key={p.statement} className={styles.row}>
              <FadeIn className={styles.rowInner} delay={i * 0.06}>
                <h3 className={styles.statement}>{p.statement}</h3>
                <p className={styles.mechanism}>{p.mechanism}</p>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
