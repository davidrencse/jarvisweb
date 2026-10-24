import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MessageSquareText, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  /** Length of the voice message in seconds. */
  duration: number;
  transcription: string;
  waveformHeights?: number[];
  /** Start playing this many ms after mount. */
  autoPlayDelay?: number;
  onEnded?: () => void;
  className?: string;
  bubbleClassName?: string;
}

const DEFAULT_WAVEFORM = [
  8, 12, 16, 12, 10, 18, 24, 16, 14, 20, 12, 16, 22, 18, 14, 10, 16, 24, 18, 14,
  12, 10, 8, 12, 16, 14, 10,
];

const pop = {
  initial: { opacity: 0, scale: 0.4, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.4, filter: 'blur(4px)' },
  transition: { type: 'spring', bounce: 0, visualDuration: 0.22 },
} as const;

export function TranscribeVoiceMessage({
  duration,
  transcription,
  waveformHeights = DEFAULT_WAVEFORM,
  autoPlayDelay,
  onEnded,
  className,
  bubbleClassName,
}: VoiceMessageProps) {
  const reduced = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(reduced ? duration : 0);
  const [showTranscription, setShowTranscription] = useState(true);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;

  useEffect(() => {
    if (reduced) {
      endedRef.current?.();
      return;
    }
    if (autoPlayDelay === undefined) return;
    const t = setTimeout(() => setIsPlaying(true), autoPlayDelay);
    return () => clearTimeout(t);
  }, [autoPlayDelay, reduced]);

  useEffect(() => {
    if (!isPlaying) return;
    let frameId = 0;
    const startTime = performance.now() - currentTime * 1000;
    const tick = (now: number) => {
      const next = (now - startTime) / 1000;
      if (next >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
        endedRef.current?.();
      } else {
        setCurrentTime(next);
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
    // currentTime is read once as the resume point
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, duration]);

  const handlePlayToggle = () => {
    if (currentTime >= duration) setCurrentTime(0);
    setIsPlaying((p) => !p);
  };

  const progress = currentTime / duration;
  const remaining = Math.ceil(duration - currentTime);
  const done = currentTime >= duration;
  const revealed = done ? transcription.length : Math.floor(progress * transcription.length);

  let charIndex = 0;

  return (
    <div className={cn('flex flex-col items-start select-none', className)}>
      <AnimatePresence initial={false}>
        {showTranscription && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.9, y: 8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 8, filter: 'blur(8px)' }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.35 }}
            className="relative mb-9 origin-bottom-left"
          >
            <div
              className={cn(
                'border-line bg-paper-2 rounded-[24px] border px-5 py-4 sm:px-6 sm:py-5',
                bubbleClassName,
              )}
            >
              <p aria-label={transcription} className="flex flex-wrap">
                {transcription.split(' ').map((word, w) => {
                  const node = (
                    <span key={w} aria-hidden className="mr-[0.25em] inline-flex whitespace-nowrap">
                      {word.split('').map((char, c) => {
                        const on = charIndex < revealed;
                        charIndex++;
                        return (
                          <motion.span
                            key={c}
                            initial={false}
                            animate={{ opacity: on ? 1 : 0.12 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                            className="inline-block"
                          >
                            {char}
                          </motion.span>
                        );
                      })}
                    </span>
                  );
                  charIndex++;
                  return node;
                })}
              </p>
            </div>
            <div aria-hidden className="absolute -bottom-8 left-5 flex flex-col items-center gap-1.5">
              <span className="border-line bg-paper-2 ml-3 size-3.5 rounded-full border" />
              <span className="border-line bg-paper-2 size-2 rounded-full border" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-pressed={showTranscription}
          aria-label={showTranscription ? 'Hide transcription' : 'Show transcription'}
          onClick={() => setShowTranscription((s) => !s)}
          className={cn(
            'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-300 sm:size-12',
            showTranscription
              ? 'border-ink bg-ink text-paper'
              : 'border-line bg-paper-2 text-ink hover:border-line-strong',
          )}
        >
          <MessageSquareText size={19} strokeWidth={1.75} />
        </button>

        <div className="border-line bg-paper-2 flex items-center gap-2.5 rounded-full border py-2 pr-4 pl-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
            className="text-paper bg-ink flex size-8 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-90"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {isPlaying ? (
                <motion.span key="pause" {...pop} className="flex">
                  <Pause size={14} strokeWidth={0} fill="currentColor" />
                </motion.span>
              ) : (
                <motion.span key="play" {...pop} className="ml-0.5 flex">
                  <Play size={14} strokeWidth={0} fill="currentColor" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div aria-hidden className="relative flex h-8 items-center gap-[3px]">
            {waveformHeights.map((h, i) => (
              <span key={`bg-${i}`} className="bg-ink-4 w-[3px] rounded-full" style={{ height: h }} />
            ))}
            <div
              className="absolute inset-0 flex items-center gap-[3px]"
              style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}
            >
              {waveformHeights.map((h, i) => (
                <span key={`fg-${i}`} className="bg-ink w-[3px] rounded-full" style={{ height: h }} />
              ))}
            </div>
          </div>

          <div className="text-ink-3 relative flex h-5 w-7 items-center justify-end font-mono text-[13px] tabular-nums">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={remaining}
                initial={{ y: -12, opacity: 0, filter: 'blur(6px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: 12, opacity: 0, filter: 'blur(6px)' }}
                transition={{ type: 'spring', bounce: 0.2, visualDuration: 0.35 }}
                className="inline-block"
              >
                {remaining}
              </motion.span>
            </AnimatePresence>
            <span>s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
