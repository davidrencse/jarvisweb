import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { SectionHead } from "../../components/SectionHead";
import { ease } from "../../lib/motion";
import { SignalLine } from "./SignalLine";
import styles from "./EarlyAccess.module.css";

type Status = "idle" | "submitting" | "success";
type Problem = "invalid" | "server" | "closed" | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  invalid: "That doesn’t look like an email address. Check it and try again.",
  server: "Something went wrong on our side. Try again in a minute.",
  closed: "Sign-ups aren’t switched on yet, so nothing was saved. Please check back soon.",
};

class NotConnected extends Error {}

async function joinWaitlist(email: string) {
  const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined;
  if (!endpoint) {
    if (import.meta.env.PROD) throw new NotConnected();
    console.info("VITE_WAITLIST_ENDPOINT is not set, so this request was not sent anywhere.");
    await new Promise((resolve) => setTimeout(resolve, 700));
    return;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source: "jarvis-site" }),
  });
  if (!res.ok) throw new Error(`Waitlist endpoint answered ${res.status}`);
}

const swap = {
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.42, ease: ease.out } },
  exit: { opacity: 0, filter: "blur(6px)", transition: { duration: 0.18, ease: ease.out } },
};

export default function EarlyAccess() {
  const uid = useId();
  const inputId = `${uid}-email`;
  const messageId = `${uid}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<Problem>(null);
  const [listening, setListening] = useState(false);

  const focusDone = useCallback((el: HTMLDivElement | null) => {
    el?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (status === "idle" && problem === "server") inputRef.current?.focus();
  }, [status, problem]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (problem === "invalid") setProblem(null);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setProblem("invalid");
      inputRef.current?.focus();
      return;
    }
    setEmail(value);
    setProblem(null);
    setStatus("submitting");
    try {
      await joinWaitlist(value);
      setStatus("success");
    } catch {
      setProblem("server");
      setStatus("idle");
    }
  };

  const submitting = status === "submitting";

  return (
    <section id="access" aria-labelledby="access-title" className={`inverse ${styles.section}`}>
      <div className={`container ${styles.content}`}>
        <SectionHead
          id="access-title"
          inverse
          title={"Want your own\nJARVIS?"}
          lede="Early access is opening a few people at a time. Leave your email and you’ll hear from us when there’s a place for you."
        />

        <div className={styles.swap}>
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <motion.div key="done" ref={focusDone} tabIndex={-1} className={styles.done} {...swap}>
                <span className={styles.doneIcon}>
                  <Check size={20} strokeWidth={1.75} aria-hidden />
                </span>
                <p className={styles.doneTitle}>You’re on the list.</p>
                <p className={styles.doneBody}>
                  We’ll write to <span className={styles.email}>{email}</span>.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className={styles.form}
                noValidate
                onSubmit={onSubmit}
                onFocus={() => setListening(true)}
                onBlur={() => setListening(false)}
                {...swap}
              >
                <label htmlFor={inputId} className={styles.label}>
                  Email address
                </label>
                <div className={styles.row}>
                  <input
                    ref={inputRef}
                    id={inputId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    placeholder="you@example.com"
                    className={styles.input}
                    value={email}
                    onChange={onChange}
                    disabled={submitting}
                    aria-invalid={problem === "invalid" ? true : undefined}
                    aria-describedby={problem === "invalid" ? messageId : undefined}
                  />
                  <Button type="submit" size="lg" inverse disabled={submitting} className={styles.submit}>
                    <span className={styles.submitText} data-busy={submitting || undefined}>
                      Request early access
                    </span>
                    {submitting ? <LoaderCircle className={styles.spinner} size={20} strokeWidth={1.75} aria-hidden /> : null}
                  </Button>
                </div>

                <div className={styles.feedback}>
                  <AnimatePresence initial={false}>
                    {problem ? (
                      <motion.p
                        key={problem}
                        id={messageId}
                        role={problem === "server" ? "alert" : undefined}
                        className={styles.message}
                        initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.4, ease: ease.out }}
                      >
                        <CircleAlert size={16} strokeWidth={1.75} aria-hidden />
                        <span>{MESSAGES[problem]}</span>
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>

                <span className="sr-only" role="status">
                  {submitting ? "Sending your request" : ""}
                </span>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SignalLine listening={listening} />
    </section>
  );
}
