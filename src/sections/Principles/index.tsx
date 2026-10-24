import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import styles from "./Principles.module.css";

const PRINCIPLES = [
  {
    statement: "Your voice stays on your laptop.",
    mechanism:
      "Voice detection, the voiceprint check and transcription all run locally, and a stranger’s speech is never transcribed.",
  },
  {
    statement: "Your notes are never rewritten.",
    mechanism:
      "Writes only add, refuse any file that changed since it was read, and every one is logged so you can undo it.",
  },
  {
    statement: "The console answers only to this machine.",
    mechanism: "It listens on loopback only, rejects foreign hosts and requires a header on every change.",
  },
  {
    statement: "It asks before it acts.",
    mechanism: "Buying, sending, posting, deleting and submitting forms all wait for your yes.",
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
