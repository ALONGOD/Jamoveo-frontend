'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
] as const;

const TICK_MS = 30; // base scroll interval — speed multiplier scales pixels per tick

export const AutoScrollToggle = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isScrolling) {
      intervalRef.current = setInterval(() => {
        window.scrollBy({ top: speed, behavior: 'auto' });
      }, TICK_MS);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isScrolling, speed]);

  return (
    <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 sm:bottom-6">
      <div className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/95 p-1 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => setIsScrolling((s) => !s)}
          aria-label={isScrolling ? 'Stop auto scroll' : 'Start auto scroll'}
          // whitespace-nowrap prevents the label from wrapping inside the button
          // on narrow screens — without it, "Auto scroll" wraps onto multiple
          // lines, the button becomes near-square, and `rounded-full` then
          // visually turns it into a giant circle.
          className={clsx(
            'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 sm:text-base',
            isScrolling
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-brand text-white hover:bg-brand-dark'
          )}
        >
          {isScrolling ? '⏸ Stop' : '▶ Auto scroll'}
        </button>

        <div className="flex items-center rounded-full bg-neutral-800 p-0.5">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSpeed(opt.value)}
              aria-pressed={speed === opt.value}
              className={clsx(
                'rounded-full px-2.5 py-1 text-xs font-semibold transition sm:px-3 sm:py-1.5 sm:text-sm',
                speed === opt.value
                  ? 'bg-brand-light text-neutral-900'
                  : 'text-neutral-300 hover:text-neutral-100'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
