import { CheckIcon, CopyIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CopyConfirmProps {
  valueToCopy: string;
  copyText?: string;
  copiedText?: string;
  /** Accessible name, e.g. "Copy the commands". */
  label?: string;
  className?: string;
}

export default function CopyConfirm({
  valueToCopy,
  copyText = 'Copy',
  copiedText = 'Copied',
  label,
  className,
}: CopyConfirmProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(valueToCopy);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={handleCopy}
      aria-label={label}
      className={cn(
        'relative flex h-8 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 transition-colors duration-300',
        copied ? 'bg-ink text-paper' : 'border-line text-ink-2 hover:text-ink hover:border-line-strong border bg-paper',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? 'check' : 'copy'}
          initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className="flex"
        >
          {copied ? <CheckIcon size={14} strokeWidth={2} /> : <CopyIcon size={14} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
      <AnimatedText from={copyText} to={copiedText} isCopied={copied} />
      <span className="sr-only" aria-live="polite">
        {copied ? copiedText : ''}
      </span>
    </motion.button>
  );
}

const AnimatedText = ({ from, to, isCopied }: { from: string; to: string; isCopied: boolean }) => {
  const activeText = isCopied ? to : from;
  return (
    <span aria-hidden className="flex text-[13px] font-medium">
      <AnimatePresence mode="popLayout" initial={false}>
        {activeText.split('').map((char, index) => (
          <motion.span
            key={char + index}
            layout
            initial={{ opacity: 0, y: 5, scale: 0.7 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring', stiffness: 260, damping: 22, delay: 0.025 * index },
            }}
            exit={{ opacity: 0, y: -5, scale: 0.7, transition: { duration: 0.12 } }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
};
