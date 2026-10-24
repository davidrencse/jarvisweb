import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import {
  ArrowUpRight,
  AudioLines,
  ChartCandlestick,
  SquareTerminal,
  Coins,
  HelpCircle,
  Laptop,
  Library,
  Menu,
  Mic,
  MousePointerClick,
  NotebookPen,
  ShieldCheck,
  Waypoints,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ease, spring } from "../lib/motion";
import { scrollToId } from "../lib/scroll";
import { Button } from "./Button";
import { Wordmark } from "./Wordmark";
import { CommandSearch, type CommandItem } from "./command-search";
import { ShimmerButton } from "./shimmer-button";
import Announcement1 from "./ui/announcement-1";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#terminal", label: "Terminal" },
  { href: "#markets", label: "Markets" },
  { href: "#how", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
];

const goTo = (id: string) => () => {
  scrollToId(id);
};

const icon = (I: typeof Mic) => <I size={16} strokeWidth={1.75} />;

const COMMANDS: CommandItem[] = [
  { id: "terminal", section: "Jump to", title: "The terminal", icon: icon(SquareTerminal), action: goTo("terminal") },
  { id: "markets", section: "Jump to", title: "Markets in plain English", icon: icon(ChartCandlestick), action: goTo("markets") },
  { id: "voice", section: "Jump to", title: "Voice check", icon: icon(AudioLines), action: goTo("voice") },
  { id: "how", section: "Jump to", title: "How it works", icon: icon(Waypoints), action: goTo("how") },
  { id: "memory", section: "Jump to", title: "Memory and tasks", icon: icon(NotebookPen), action: goTo("memory") },
  { id: "knowledge", section: "Jump to", title: "Knowledge engine", icon: icon(Library), action: goTo("knowledge") },
  { id: "actions", section: "Jump to", title: "Actions and approvals", icon: icon(MousePointerClick), action: goTo("actions") },
  { id: "cost", section: "Jump to", title: "Cost and routing", icon: icon(Coins), action: goTo("cost") },
  { id: "everywhere", section: "Jump to", title: "Every machine", icon: icon(Laptop), action: goTo("everywhere") },
  { id: "privacy", section: "Jump to", title: "Privacy", icon: icon(ShieldCheck), action: goTo("privacy") },
  { id: "faq", section: "Jump to", title: "Questions", icon: icon(HelpCircle), action: goTo("faq") },
  { id: "type-brief", section: "Try typing", title: "BRIEF", icon: icon(SquareTerminal), hint: "morning brief", action: goTo("terminal") },
  { id: "type-gp", section: "Try typing", title: "BTC GP 30D", icon: icon(SquareTerminal), hint: "price chart", action: goTo("terminal") },
  { id: "type-cred", section: "Try typing", title: "CRED", icon: icon(SquareTerminal), hint: "AI usage left", action: goTo("terminal") },
  { id: "say-due", section: "Try saying", title: "“Jarvis, what's due this week?”", icon: icon(Mic), hint: "voice check", action: goTo("voice") },
  { id: "say-done", section: "Try saying", title: "“I finished picking the motors.”", icon: icon(Mic), hint: "tasks", action: goTo("memory") },
  { id: "say-send", section: "Try saying", title: "“Send my draft to the study group.”", icon: icon(Mic), hint: "approval", action: goTo("actions") },
  { id: "say-build", section: "Try saying", title: "“Build a dashboard for my study hours.”", icon: icon(Mic), hint: "routing", action: goTo("cost") },
  { id: "access", section: "Get started", title: "Request early access", icon: icon(ArrowUpRight), action: goTo("access") },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [announce, setAnnounce] = useState(true);
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 8);
    const delta = y - last.current;
    if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 480);
    last.current = y;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const showAnnouncement = announce && !scrolled && !open;

  return (
    <motion.header
      className={styles.header}
      data-scrolled={scrolled || open}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: hidden && !open ? "-110%" : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: ease.out }}
    >
      <AnimatePresence initial={false}>
        {showAnnouncement && (
          <motion.div
            key="announcement"
            className={styles.announcement}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: ease.out }}
          >
            <Announcement1
              message="The terminal for everything is opening to early access on Windows and Arch Linux."
              shortMessage="Early access is opening."
              linkLabel="Request access"
              href="#access"
              onDismiss={() => setAnnounce(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.brand} aria-label="JARVIS, back to top">
          <Wordmark />
        </a>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <CommandSearch items={COMMANDS} className={styles.command} />
          <ShimmerButton href="#access" size="sm" className={styles.cta}>
            Request access
          </ShimmerButton>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-menu"
            key="menu"
            className={styles.sheet}
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.layout}
          >
            <div className={`container ${styles.sheetInner}`}>
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className={styles.sheetLink} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <Button href="#access" size="lg" arrow onClick={() => setOpen(false)}>
                Request early access
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
