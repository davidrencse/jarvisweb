import { useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  frameRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  run: (command: string) => void;
  setValue: (value: string) => void;
};

const CHAR_BRIEF = 85;
const CHAR_CHART = 55;

/** Plays once when the terminal first scrolls into view: types BRIEF, runs it, then BTC GP 30D. Any visitor input cancels it. */
export function useDemo({ frameRef, enabled, run, setValue }: Options) {
  const inView = useInView(frameRef, { once: true, amount: 0.4 });
  const [typing, setTyping] = useState(false);
  const over = useRef(false);
  const typingNow = useRef(false);
  const timers = useRef<number[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const setTypingNow = useCallback((on: boolean) => {
    typingNow.current = on;
    setTyping(on);
  }, []);

  const stop = useCallback(() => {
    if (over.current) return;
    over.current = true;
    clear();
    if (typingNow.current) {
      setTypingNow(false);
      setValue("");
    }
  }, [clear, setTypingNow, setValue]);

  useEffect(() => {
    if (!enabled || !inView || over.current) return;

    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };
    const type = (text: string, from: number, per: number) => {
      for (let i = 0; i < text.length; i++) at(from + i * per, () => setValue(text.slice(0, i + 1)));
      return from + text.length * per;
    };

    let t = 350;
    at(t, () => setTypingNow(true));
    t = type("BRIEF", t + 40, CHAR_BRIEF) + 260;
    at(t, () => {
      setTypingNow(false);
      run("BRIEF");
    });
    t += 1900;
    at(t, () => setTypingNow(true));
    t = type("BTC GP 30D", t + 40, CHAR_CHART) + 220;
    at(t, () => {
      setTypingNow(false);
      run("BTC GP 30D");
      over.current = true;
    });

    return () => {
      clear();
      if (typingNow.current) {
        setTypingNow(false);
        setValue("");
      }
    };
  }, [enabled, inView, run, setValue, clear, setTypingNow]);

  return { typing, stop };
}
