'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { INSTRUMENT_LABELS, INSTRUMENT_OPTIONS, Instrument } from '@/types';

interface Props {
  value: Instrument | '';
  onChange: (value: Instrument) => void;
  hasError?: boolean;
  id?: string;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className={clsx('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

export const InstrumentSelect = ({ value, onChange, hasError, id }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const label = value ? INSTRUMENT_LABELS[value] : 'Select instrument...';

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-lg border bg-neutral-800 px-3 py-2 text-left outline-none transition focus:border-brand',
          hasError ? 'border-red-500' : 'border-neutral-700',
          !value && 'text-neutral-400'
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Instrument"
          className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-2xl ring-1 ring-black/40"
        >
          {INSTRUMENT_OPTIONS.map((option) => {
            const isSelected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                    isSelected
                      ? 'bg-brand/20 text-brand-light'
                      : 'text-neutral-200 hover:bg-neutral-800'
                  )}
                >
                  <span>{INSTRUMENT_LABELS[option]}</span>
                  {isSelected && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4 text-brand-light"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L8.5 12.086l6.793-6.79a1 1 0 011.411 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
