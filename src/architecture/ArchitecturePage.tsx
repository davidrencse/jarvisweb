import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../components/Button";
import { FadeIn } from "../components/FadeIn";
import { RevealText } from "../components/RevealText";
import { SectionHead } from "../components/SectionHead";
import { Wordmark } from "../components/Wordmark";
import { VisionViewer } from "../components/vision/VisionViewer";
import { interceptHashLinks, scrollToId } from "../lib/scroll";
import { ModuleMap } from "./ModuleMap";
import { TOTAL_LINES, TOTAL_MODULES } from "./modules";
import { ProofPanel } from "./ProofPanel";
import { RequestPath } from "./RequestPath";
import { Topology } from "./Topology";
import { SYSTEM_SHOTS } from "./systemShots";
import styles from "./ArchitecturePage.module.css";

const HOME = import.meta.env.BASE_URL;

const LINKS = [
  { href: "#path", label: "Request path" },
  { href: "#cluster", label: "Main and nodes" },
  { href: "#modules", label: "Modules" },
  { href: "#system", label: "System page" },
  { href: "#proof", label: "Proof" },
];

const RULES = [
  {
    title: "Cheapest path first.",
    text: "Instant phrases and a strict parser settle most requests at 0 tokens. A model is asked only when they can’t.",
  },
  {
    title: "Never pay per token.",
    text: "Only the ChatGPT and Claude subscriptions you already have, plus free local models. No billed API keys in the path.",
  },
  {
    title: "Checked actions.",
    text: "Every direct action is gated before it runs and read back from the screen after. What can’t be seen is reported, not claimed.",
  },
];

export default function ArchitecturePage() {
  useEffect(() => interceptHashLinks(), []);
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id, { instant: true })));
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          <a href={HOME} className={styles.brand} aria-label="JARVIS home">
            <Wordmark />
          </a>
          <nav aria-label="On this page" className={styles.links}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href={HOME} className={styles.back}>
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
            Back to the site
          </a>
        </div>
      </header>

      <main id="main">
        <section className={styles.hero} aria-labelledby="arch-title">
          <div className="container">
            <RevealText
              as="h1"
              id="arch-title"
              text={"How a request\nmoves through JARVIS."}
              variant="rise"
              trigger="mount"
              step={0.07}
              className={styles.title}
            />
            <FadeIn delay={0.45} className={styles.lede}>
              <p>
                A personal assistant and OS layer across your computers, in more than{" "}
                {(Math.floor(TOTAL_LINES / 1000) * 1000).toLocaleString("en-US")} lines of Python across {TOTAL_MODULES} modules. Voice, the
                console, the CLI and other machines all feed one path: nine free stations, a model path only for what
                the rules can’t settle, and a confirm queue for anything with consequences.
              </p>
            </FadeIn>
            <ul className={styles.rules}>
              {RULES.map((r, i) => (
                <FadeIn as="li" key={r.title} delay={0.6 + i * 0.08} y={12} className={styles.rule}>
                  <h2 className={styles.ruleTitle}>{r.title}</h2>
                  <p className={styles.ruleText}>{r.text}</p>
                </FadeIn>
              ))}
            </ul>
          </div>
        </section>

        <section id="path" className={styles.section} aria-labelledby="path-title">
          <div className="container">
            <SectionHead
              id="path-title"
              layout="split"
              title={"Trace a\nrequest."}
              lede="Pick an example or type your own and watch the route light up. The parser accepts a request only when it has exactly one reading; anything else goes to the interpreter, which picks a mode: act, agent, converse, build or clarify."
            />
            <FadeIn y={24} amount={0.1} className={styles.stage}>
              <RequestPath />
            </FadeIn>
          </div>
        </section>

        <section id="cluster" className={`${styles.section} ${styles.tint}`} aria-labelledby="cluster-title">
          <div className="container">
            <SectionHead
              id="cluster-title"
              layout="split"
              title={"One main,\nlight nodes."}
              lede="Exactly one machine is the main: it holds the brain, memory, vault and hub. Every other computer is a node that long-polls the hub over an SSH tunnel. No new port is opened, and the hub listens only on loopback."
            />
            <FadeIn y={24} amount={0.1} className={styles.stage}>
              <Topology />
            </FadeIn>
            <FadeIn y={12} className={styles.setup}>
              <p className={styles.setupTitle}>Two commands per machine</p>
              <pre className={styles.setupCode}>
                <code>
                  <span className={styles.dim}># on the main</span>
                  {"\n"}jarvis cluster init{"\n"}jarvis cluster invite dell{"\n\n"}
                  <span className={styles.dim}># on the new computer</span>
                  {"\n"}jarvis cluster join {"<code>"}
                </code>
              </pre>
            </FadeIn>
          </div>
        </section>

        <section id="modules" className={styles.section} aria-labelledby="modules-title">
          <div className="container">
            <SectionHead
              id="modules-title"
              layout="split"
              title={"Every module,\nby station."}
              lede="The console files every module under the station it serves, and a test fails if one is missing. Each bar is a station; each segment is a file, sized by its lines. Open a station to read it."
            />
            <FadeIn y={24} amount={0.1} className={styles.stage}>
              <ModuleMap />
            </FadeIn>
          </div>
        </section>

        <section id="system" className={`inverse ${styles.section} ${styles.dark}`} aria-labelledby="system-title">
          <div className="container">
            <SectionHead
              id="system-title"
              layout="split"
              inverse
              title={"The System page,\nunder the lens."}
              lede="The console draws its own architecture, live. These are real captures of it. Move over one for the lens, or switch to the edge view."
            />
            <FadeIn y={24} amount={0.1} className={styles.stage}>
              <VisionViewer shots={SYSTEM_SHOTS} aspect={1.4} label="System page views" />
            </FadeIn>
          </div>
        </section>

        <section id="proof" className={styles.section} aria-labelledby="proof-title">
          <div className="container">
            <SectionHead
              id="proof-title"
              layout="split"
              title={"Rerun it\nyourself."}
              lede="Each claim on this page comes with the command that checks it. All of them are free: the scorecard makes no model calls unless you pass --brain."
            />
            <FadeIn y={24} amount={0.1} className={styles.stage}>
              <ProofPanel />
            </FadeIn>
          </div>
        </section>

        <section className={`inverse ${styles.close}`} aria-labelledby="close-title">
          <div className="container">
            <RevealText as="h2" id="close-title" text={"Want one\nof your own?"} variant="blur" step={0.05} className={styles.closeTitle} />
            <FadeIn delay={0.2} className={styles.closeActions}>
              <Button href={`${HOME}#access`} size="lg" inverse arrow>
                Request early access
              </Button>
              <Button href={HOME} variant="quiet" inverse>
                Back to the overview
              </Button>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className={`inverse ${styles.footer}`}>
        <div className={`container ${styles.footInner}`}>
          <a href={HOME} aria-label="JARVIS home">
            <Wordmark />
          </a>
          <p>Figures from the JARVIS repo, 7 November 2026. Runs on Windows and Arch Linux.</p>
        </div>
      </footer>
    </>
  );
}
