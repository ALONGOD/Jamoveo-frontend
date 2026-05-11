'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { LiveView } from '@/components/LiveView';
import { AutoScrollToggle } from '@/components/AutoScrollToggle';

export default function LivePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentSong, quitSession } = useSocket();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/auth/login');
  }, [isAuthenticated, isLoading, router]);

  // If the admin quits or no song is set, bounce back to main
  useEffect(() => {
    if (!isLoading && isAuthenticated && !currentSong) {
      router.replace('/');
    }
  }, [currentSong, isAuthenticated, isLoading, router]);

  if (!user || !currentSong) {
    return (
      <main className="flex min-h-screen items-center justify-center text-neutral-500">
        Loading song...
      </main>
    );
  }

  const lyricsOnly = user.instrument === 'vocals';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <LiveView song={currentSong} lyricsOnly={lyricsOnly} />
      <AutoScrollToggle />

      {user.role === 'admin' && (
        <button
          type="button"
          onClick={quitSession}
          className="fixed right-3 top-3 z-30 rounded-md border border-red-500/60 bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-200 backdrop-blur transition hover:bg-red-600/40 sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
        >
          Quit
        </button>
      )}
    </div>
  );
}
