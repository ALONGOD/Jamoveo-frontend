'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Navbar } from '@/components/Navbar';
import { createApiClient } from '@/lib/api';
import { Song, SongSearchResult } from '@/types';

const ResultsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const { user, token, isLoading, isAuthenticated } = useAuth();
  const { selectSong } = useSocket();

  const [results, setResults] = useState<SongSearchResult[] | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickingId, setPickingId] = useState<string | null>(null);

  // Gate: only admins reach this page
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/auth/login');
    else if (user?.role !== 'admin') router.replace('/');
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!token || !q) return;
    let cancelled = false;
    setIsLoadingResults(true);
    setError(null);

    createApiClient(token)
      .get<{ success: boolean; results: SongSearchResult[] }>('/songs/search', { params: { q } })
      .then(({ data }) => {
        if (!cancelled) setResults(data.results);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Search failed');
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingResults(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, token]);

  const handlePick = async (item: SongSearchResult) => {
    if (!token) return;
    setPickingId(item.id);
    setError(null);
    try {
      const { data } = await createApiClient(token).get<{ success: boolean; song: Song }>(
        '/songs/fetch',
        { params: { url: item.sourceUrl } }
      );
      selectSong(data.song);
      // Server will broadcast song:current; SocketContext routes us to /live
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load song');
    } finally {
      setPickingId(null);
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center text-neutral-500">
        Loading...
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              Results for &ldquo;{q}&rdquo;
            </h1>
            <p className="text-sm text-neutral-400">Pick a song to broadcast it to the rehearsal.</p>
          </div>
          <Link
            href="/"
            className="self-start rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:border-brand hover:text-brand-light sm:self-auto"
          >
            New search
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        {isLoadingResults && <p className="text-neutral-400">Searching Tab4U...</p>}

        {!isLoadingResults && results && results.length === 0 && (
          <p className="text-neutral-400">No songs found. Try a different query.</p>
        )}

        <ul className="grid gap-3">
          {results?.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handlePick(item)}
                disabled={pickingId !== null}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 text-left transition hover:border-brand hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-4 sm:p-4"
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 sm:h-14 sm:w-14" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold sm:text-lg" dir="auto">
                    {item.title}
                  </div>
                  <div className="truncate text-xs text-neutral-400 sm:text-sm" dir="auto">
                    {item.artist}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-brand-light sm:text-sm">
                  {pickingId === item.id ? 'Loading...' : 'Pick →'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-neutral-500">Loading...</main>}>
      <ResultsContent />
    </Suspense>
  );
}
