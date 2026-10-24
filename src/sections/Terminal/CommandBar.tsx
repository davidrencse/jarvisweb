import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from "react";
import { Button } from "../../components/Button";
import { ease, spring } from "../../lib/motion";
import { Clock } from "./Clock";
import { PLACEHOLDER, suggest, type Suggestion } from "./functions";
import styles from "./CommandBar.module.css";

type Props = {
  value: string;
  onValue: (value: string) => void;
  onRun: (raw: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /** The auto-demo is typing into the field. */
  typing: boolean;
};

export function CommandBar({ value, onValue, onRun, inputRef, typing }: Props) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-option-${i}`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const history = useRef<string[]>([]);
  const cursor = useRef(0);
  const draft = useRef("");

  const options = useMemo(() => suggest(value), [value]);
  const expanded = open && !typing && options.length > 0;

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    if (history.current[history.current.length - 1] !== text) history.current.push(text);
    cursor.current = history.current.length;
    setOpen(false);
    setActive(-1);
    onRun(text);
  };

  const pick = (option: Suggestion) => submit(option.text);

  const step = (dir: -1 | 1) => {
    const h = history.current;
    if (!h.length) return false;
    if (cursor.current === h.length) draft.current = value;
    const next = Math.min(h.length, Math.max(0, cursor.current + dir));
    if (next === cursor.current) return true;
    cursor.current = next;
    onValue(next === h.length ? draft.current : h[next]);
    return true;
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    onValue(e.target.value);
    cursor.current = history.current.length;
    setActive(-1);
    setOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown") {
      if (expanded) {
        e.preventDefault();
        setActive((a) => (a + 1) % options.length);
      } else if (cursor.current < history.current.length && step(1)) {
        e.preventDefault();
      } else if (value.trim() && options.length) {
        e.preventDefault();
        setOpen(true);
      }
    } else if (e.key === "ArrowUp") {
      if (expanded) {
        e.preventDefault();
        setActive((a) => (a <= 0 ? options.length - 1 : a - 1));
      } else if (step(-1)) e.preventDefault();
    } else if (e.key === "Enter") {
      if (expanded && active >= 0) {
        e.preventDefault();
        pick(options[active]);
      }
    } else if (e.key === "Tab") {
      if (expanded && active >= 0 && !e.shiftKey) {
        e.preventDefault();
        onValue(options[active].text);
        setOpen(false);
        setActive(-1);
      }
    } else if (e.key === "Escape") {
      if (expanded) {
        e.preventDefault();
        setOpen(false);
        setActive(-1);
      } else if (value) {
        e.preventDefault();
        onValue("");
        cursor.current = history.current.length;
      }
    }
  };

  return (
    <div className={styles.top}>
      <span className={styles.brand}>JARVIS</span>

      <form
        className={styles.field}
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Command
        </label>
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            id={inputId}
            className={styles.input}
            data-typing={typing ? "" : undefined}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={expanded}
            aria-controls={expanded ? listId : undefined}
            aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
            value={value}
            placeholder={PLACEHOLDER}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            readOnly={typing}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(value.trim().length > 0)}
            onBlur={() => {
              setOpen(false);
              setActive(-1);
            }}
          />
          {typing ? (
            <span className={styles.ghost} aria-hidden>
              {value}
              <span className={styles.caret} />
            </span>
          ) : null}
        </div>
        <Button type="submit" size="sm">
          GO
        </Button>

        <AnimatePresence>
          {expanded ? (
            <motion.ul
              id={listId}
              role="listbox"
              aria-label="Suggested commands"
              className={styles.list}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.16, ease: ease.out } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {options.map((option, i) => (
                <li
                  key={option.text}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  className={styles.option}
                  onPointerMove={() => setActive(i)}
                  onClick={() => pick(option)}
                >
                  {i === active ? (
                    <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.snappy} aria-hidden />
                  ) : null}
                  <span className={styles.optionText}>{option.text}</span>
                  <span className={styles.optionHint}>{option.hint}</span>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </form>

      <div className={styles.meta}>
        <span className={styles.chip} title="Markets are recon only: nothing here can place a trade.">
          RECON ONLY
        </span>
        <span className={styles.sim}>Simulated</span>
      </div>
      <Clock />
    </div>
  );
}
