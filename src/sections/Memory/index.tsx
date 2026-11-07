import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { NoteDemo } from "./NoteDemo";
import styles from "./Memory.module.css";

const KNOWS = [
  "The last 20 minutes of conversation",
  "Loops you left open in the past two weeks",
  "Facts and preferences that match the request",
  "Lessons from the times you corrected it",
  "Your deadlines and agenda, when a vault is connected",
];

export default function Memory() {
  return (
    <section id="memory" aria-labelledby="memory-title" className={styles.section}>
      <div className="container">
        <SectionHead
          id="memory-title"
          layout="split"
          title={"It remembers\nwhat you tell it."}
          lede="Every turn is kept on your disk, searchable by keyword and by meaning. Each night JARVIS distils the day into facts, preferences, open loops and lessons. Connect an Obsidian vault and it reads your notes too, without rewriting them."
        />

        <div className={styles.layout}>
          <div className={styles.known}>
            <div>
              <FadeIn>
                <h3 className={styles.knownTitle}>What it brings to every answer</h3>
              </FadeIn>
              <ul className={styles.knownList} role="list">
                {KNOWS.map((item, i) => (
                  <FadeIn as="li" key={item} y={12} delay={i * 0.06} className={styles.knownRow}>
                    {item}
                  </FadeIn>
                ))}
              </ul>
            </div>
            <FadeIn delay={0.1}>
              <p className={styles.knownNote}>
                Briefings like “what’s due?” come straight from your notes in about{" "}
                <span className={styles.figure}>20 ms</span>, even offline.
              </p>
            </FadeIn>
          </div>

          <NoteDemo />
        </div>
      </div>
    </section>
  );
}
