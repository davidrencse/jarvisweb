import { Button } from "../../components/Button";
import { FadeIn } from "../../components/FadeIn";
import { RevealText } from "../../components/RevealText";
import { ProductShot } from "./ProductShot";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <div className={styles.head}>
          <RevealText
            as="h1"
            id="hero-title"
            text={"A Bloomberg Terminal\nfor everything."}
            variant="rise"
            trigger="mount"
            step={0.07}
            className={styles.title}
          />

          <div className={styles.side}>
            <FadeIn delay={0.5} className={styles.lede}>
              <p>
                Bloomberg built a terminal for money. JARVIS is one for the rest of your life: your notes, deadlines,
                markets, machines and AI usage on one screen, in plain English. Type a command, or just say “Jarvis.”
              </p>
            </FadeIn>
            <FadeIn delay={0.7} className={styles.actions}>
              <Button href="#access" size="lg" arrow className={styles.cta}>
                Request early access
              </Button>
              <Button href="#terminal" variant="quiet">
                Try the terminal
              </Button>
            </FadeIn>
          </div>
        </div>

        <ProductShot />
      </div>
    </section>
  );
}
