import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { Router } from "./Router";
import styles from "./Cost.module.css";

export default function Cost() {
  return (
    <section id="cost" className={styles.section} aria-labelledby="cost-title">
      <div className="container">
        <SectionHead
          id="cost-title"
          layout="stack"
          title={"It thinks on what\nyou already pay for."}
          lede="JARVIS signs in with the ChatGPT or Claude plan you already have and works within its normal limits. There’s no API key to fund and no per-token bill."
        />

        <Router />

        <FadeIn>
          <p className={styles.close}>
            Routing is a handful of plain rules, so deciding where a request goes never costs a thing.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
