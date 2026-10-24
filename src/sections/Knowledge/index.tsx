import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { ConflictDemo } from "./ConflictDemo";
import { Roles } from "./Roles";
import styles from "./Knowledge.module.css";

export default function Knowledge() {
  return (
    <section id="knowledge" aria-labelledby="knowledge-title" className={styles.section}>
      <div className="container">
        <SectionHead
          id="knowledge-title"
          layout="split"
          title={"A wiki that\nchecks itself."}
          lede="Hand it a PDF, a link or a voice memo. Three plain scripts take it from there, and you have the final word."
        />

        <Roles />

        <FadeIn>
          <ConflictDemo />
        </FadeIn>

        <FadeIn className={styles.wiki}>
          <p className={styles.wikiLabel}>One line from the wiki</p>
          <code className={styles.wikiLine}>
            {"- "}
            <span className={styles.claim}>The review routine runs daily at 02:00.</span>
            {" ^ca8117b — source: [[source-001]] · confirmed: 2026-09-01"}
          </code>
        </FadeIn>
      </div>
    </section>
  );
}
