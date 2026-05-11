'use client';

import { useAuth } from '@/contexts/AuthContext';
import { INSTRUMENT_LABELS } from '@/types';
import { Logo } from './Logo';

export const Navbar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-900/85 px-4 py-3 backdrop-blur sm:px-6">
      <Logo size={32} withWordmark asLink />

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-col items-end leading-tight">
          <span className="truncate text-sm font-semibold text-neutral-100">
            {user.username}
            {user.role === 'admin' && (
              <span className="ml-1.5 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                admin
              </span>
            )}
          </span>
          <span className="hidden truncate text-xs text-neutral-400 sm:inline">
            {INSTRUMENT_LABELS[user.instrument]}
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="shrink-0 rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 transition hover:border-red-500 hover:text-red-300 sm:px-3 sm:py-1.5 sm:text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
