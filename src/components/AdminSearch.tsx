'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { createApiClient } from '@/lib/api';
import { Song, SongSearchResult } from '@/types';

const MIN_QUERY_LEN = 2;
const DEBOUNCE_MS = 300;

export const AdminSearch = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { selectSong } = useSocket();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);

  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickingId, setPickingId] = useState<string | null>(null);

  // Fire a quick Tab4U search whenever the debounced query stabilises.
  // Each request is cancellable via the closure flag so a faster newer
  // query can't be overwritten by a slower older one ("stale resolve" bug).
  useEffect(() => {
    if (!token) return;
    if (debouncedQuery.length < MIN_QUERY_LEN) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setError(null);

    createApiClient(token)
      .get<{ success: boolean; results: SongSearchResult[] }>('/songs/search', {
        params: { q: debouncedQuery },
      })
      .then(({ data }) => {
        if (!cancelled) setResults(data.results);
      })
      .catch((e) => {
        if (!cancelled) {
          setResults([]);
          setError(e instanceof Error ? e.message : 'Search failed');
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, token]);

  // Pressing Enter / clicking Search button navigates to the full Results page (per brief)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/results?q=${encodeURIComponent(trimmed)}`);
  };

  // Inline pick — short-circuits the Results page and broadcasts directly
  const handlePick = async (item: SongSearchResult) => {
    if (!token || pickingId) return;
    setPickingId(item.id);
    setError(null);
    try {
      const { data } = await createApiClient(token).get<{ success: boolean; song: Song }>(
        '/songs/fetch',
        { params: { url: item.sourceUrl } }
      );
      selectSong(data.song);
      // SocketContext routes everyone to /live on song:current
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load song');
    } finally {
      setPickingId(null);
    }
  };

  const showResultsPanel = debouncedQuery.length >= MIN_QUERY_LEN;

  return (
    <main
      className={
        showResultsPanel
          ? 'mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 pt-10 sm:px-6 sm:pt-16'
          : 'mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-3xl flex-col items-stretch justify-center px-4 pb-24 sm:px-6'
      }
    >
      <h1 className="mb-6 text-center text-3xl font-bold sm:mb-8 sm:text-4xl md:text-5xl">
        Search any song...
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          dir="auto"
          placeholder="Type a song name or artist..."
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-base outline-none focus:border-brand sm:text-lg"
          autoFocus
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-6 py-3 font-semibold transition hover:bg-brand-dark sm:shrink-0"
        >
          Search
        </button>
      </form>

      {/* Inline live results — appears while user types so they can pick instantly */}
      {showResultsPanel && (
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
            <span>
              {isSearching
                ? 'Searching...'
                : results.length > 0
                  ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
                  : 'No matches'}
            </span>
            <span className="hidden sm:inline">Tip: press Enter for the full list view</span>
          </div>

          {error && (
            <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <ul className="grid gap-2">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handlePick(item)}
                  disabled={pickingId !== null}
                  className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-left transition hover:border-brand hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold" dir="auto">
                      {item.title}
                    </div>
                    <div className="truncate text-xs text-neutral-400" dir="auto">
                      {item.artist}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-brand-light">
                    {pickingId === item.id ? 'Loading...' : 'Pick →'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};
