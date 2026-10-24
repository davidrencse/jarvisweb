import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { NoteDemo } from "./NoteDemo";
import styles from "./Memory.module.css";

const KNOWS = [
  "Courses in progress",
  "Active projects and their next step",
  "Deadlines in the next 14 days",
  "Today’s and tomorrow’s agenda",
  "Today’s priorities",
];

export default function Memory() {
  return (
    <section id="memory" aria-labelledby="memory-title" className={styles.section}>
      <div className="container">
        <SectionHead
          id="memory-title"
          layout="split"
          title={"It remembers\nthrough your notes."}
          lede="JARVIS reads your Obsidian vault the way you wrote it: courses, projects, deadlines, today’s plan. When it writes, it only adds. It never deletes, moves or rewrites a line of yours."
        />

        <div className={styles.layout}>
          <div className={styles.known}>
            <div>
              <FadeIn>
                <h3 className={styles.knownTitle}>What it knows when you start talking</h3>
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
