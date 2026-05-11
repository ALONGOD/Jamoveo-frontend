'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Navbar } from '@/components/Navbar';
import { AdminSearch } from '@/components/AdminSearch';
import { PlayerWaiting } from '@/components/PlayerWaiting';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentSong } = useSocket();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Late join: if a song is already playing, jump straight to /live
  useEffect(() => {
    if (currentSong) router.replace('/live');
  }, [currentSong, router]);

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-neutral-500">
        Loading...
      </main>
    );
  }

  return (
    <>
      <Navbar />
      {user.role === 'admin' ? <AdminSearch /> : <PlayerWaiting />}
    </>
  );
}
