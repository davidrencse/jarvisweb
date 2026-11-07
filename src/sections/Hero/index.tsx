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
            text={"One assistant for\nevery computer you own."}
            variant="rise"
            trigger="mount"
            step={0.07}
            className={styles.title}
          />

          <div className={styles.side}>
            <FadeIn delay={0.5} className={styles.lede}>
              <p>
                Say “Jarvis, open Spotify on the Dell” from either laptop. It checks the voice is yours, handles most
                requests without calling a model, acts on the machine you meant, then checks the screen to confirm it worked.
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
