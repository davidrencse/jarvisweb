import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { GUARDRAILS } from "./data";
import { RunDemo } from "./RunDemo";
import styles from "./Actions.module.css";

export default function Actions() {
  return (
    <section id="actions" className={styles.section} aria-labelledby="actions-title">
      <div className="container">
        <SectionHead
          id="actions-title"
          layout="split"
          title={"Hands, with\nyour permission."}
          lede="Ask it to open an app, set the volume or get something done on the web, on whichever machine you mean. Every action is checked afterwards, and anything that sends, buys, posts or deletes waits for you."
        />

        <RunDemo />

        <h3 className="sr-only">Guardrails</h3>
        <ul className={styles.guards}>
          {GUARDRAILS.map((rule, i) => (
            <li key={rule} className={styles.guard}>
              <FadeIn delay={(i % 2) * 0.08}>{rule}</FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
