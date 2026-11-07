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
          title={"One command line\nfor every machine."}
          lede="Short codes for everything JARVIS can see and do across your computers. Each answer ends in a plain-English line, so you never have to learn the codes. Or skip the typing and say “Jarvis.”"
        />

        <FadeIn amount={0.15}>
          <Instrument />
        </FadeIn>
      </div>
    </section>
  );
}
