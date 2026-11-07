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
          lede="Cheapest path first. Plain rules settle most requests without a model, and the rest run on the ChatGPT or Claude plan you already have. There’s no API key to fund and no per-token bill."
        />

        <Router />

        <FadeIn>
          <p className={styles.close}>
            If ChatGPT hits its usage limit, Claude answers until the window resets, so a busy day never stops it.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
