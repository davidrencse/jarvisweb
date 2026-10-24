import type { ReactNode } from "react";
import { FadeIn } from "./FadeIn";
import { RevealText } from "./RevealText";
import styles from "./SectionHead.module.css";

type SectionHeadProps = {
  /** Heading id, for the section's aria-labelledby. */
  id: string;
  /** Heading text. "\n" forces a line break. */
  title: string;
  lede?: ReactNode;
  /** "stack": lede under the heading. "split": heading left, lede right, bottoms aligned. */
  layout?: "stack" | "split";
  inverse?: boolean;
  className?: string;
};

export function SectionHead({ id, title, lede, layout = "stack", inverse = false, className }: SectionHeadProps) {
  return (
    <header
      className={[styles.head, styles[layout], inverse && styles.inverse, className].filter(Boolean).join(" ")}
    >
      <RevealText id={id} as="h2" text={title} variant="blur" step={0.045} className={styles.title} />
      {lede ? (
        <FadeIn delay={0.25} className={styles.lede}>
          {typeof lede === "string" ? <p>{lede}</p> : lede}
        </FadeIn>
      ) : null}
    </header>
  );
}
