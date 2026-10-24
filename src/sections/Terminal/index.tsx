import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { Instrument } from "./Instrument";
import styles from "./Terminal.module.css";

export default function Terminal() {
  return (
    <section id="terminal" className={styles.section} aria-labelledby="terminal-title">
      <div className="container">
        <SectionHead
          id="terminal-title"
          layout="stack"
          title={"One command line\nfor your whole life."}
          lede="Bloomberg-style shortcuts for everything JARVIS knows, each answered with a plain-English line, so you never have to learn the codes. Or skip the typing and ask out loud."
        />

        <FadeIn amount={0.15}>
          <Instrument />
        </FadeIn>
      </div>
    </section>
  );
}
