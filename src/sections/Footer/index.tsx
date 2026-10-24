import { FadeIn } from "../../components/FadeIn";
import { Wordmark } from "../../components/Wordmark";
import styles from "./Footer.module.css";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#memory", label: "Memory" },
  { href: "#actions", label: "Actions" },
  { href: "#privacy", label: "Privacy" },
  { href: "#access", label: "Early access" },
];

export default function Footer() {
  return (
    <footer id="footer" className={`inverse ${styles.footer}`}>
      <div className="container">
        <div className={styles.rule}>
          <FadeIn className={styles.inner} blur={0} y={12}>
            <a href="#top" className={styles.brand} aria-label="JARVIS, back to top">
              <Wordmark />
            </a>

            <nav className={styles.nav} aria-label="Footer">
              <ul className={styles.links}>
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className={styles.link}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.meta}>
              <p>Runs on Windows and Arch Linux.</p>
              <p>© 2026 JARVIS</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </footer>
  );
}
