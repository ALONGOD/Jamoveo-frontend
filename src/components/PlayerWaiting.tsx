'use client';

import { Logo } from './Logo';

export const PlayerWaiting = () => {
  return (
    <main className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
      <Logo size={96} className="mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Waiting for next song</h1>
      <p className="mt-4 max-w-md text-sm text-neutral-400 sm:text-base">
        Hang tight — once the admin picks a song, you&apos;ll be moved to the live page automatically.
      </p>
    </main>
  );
};
