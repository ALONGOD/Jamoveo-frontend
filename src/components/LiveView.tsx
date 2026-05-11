'use client';

import { useMemo } from 'react';
import { Song, SongLine } from '@/types';

interface LiveViewProps {
  song: Song;
  /** When true, hide chords (singer mode). */
  lyricsOnly: boolean;
}

const isLineEmpty = (line: SongLine): boolean =>
  line.tokens.every((t) => !t.chord && (t.lyric ?? '').trim().length === 0);

export const LiveView = ({ song, lyricsOnly }: LiveViewProps) => {
  // Filter trailing/empty noise lines for the singer view to keep it cleaner.
  const lines = useMemo(() => {
    if (!lyricsOnly) return song.lines;
    return song.lines.filter((line) => !isLineEmpty(line));
  }, [song.lines, lyricsOnly]);

  return (
    <section className="px-3 pb-32 pt-6 sm:px-6 md:px-8">
      <header className="mx-auto mb-6 max-w-5xl text-center sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-5xl" dir="auto">
          {song.title}
        </h1>
        <p className="mt-1 text-sm text-neutral-400 sm:text-base md:text-xl" dir="auto">
          {song.artist}
        </p>
      </header>

      <div className="mx-auto max-w-5xl">
        {lyricsOnly ? (
          // Singer: proportional font, no chords. Just clean lyrics.
          <div className="space-y-2 text-xl font-semibold leading-relaxed sm:text-2xl md:text-4xl">
            {lines.map((line, i) => {
              const text = line.tokens.map((t) => t.lyric).join('');
              return (
                <p key={i} dir="auto" className="whitespace-pre-wrap break-words">
                  {text.trim().length === 0 ? '\u00A0' : text}
                </p>
              );
            })}
          </div>
        ) : (
          // Players: monospace, chord-above-lyric column-aligned.
          // The base text size is small enough to fit a typical line on mobile;
          // bumps up at sm/md so the rehearsal room view is large and readable.
          <pre className="whitespace-pre-wrap font-mono text-base leading-tight sm:text-xl md:text-3xl">
            {lines.map((line, i) => (
              <div key={i} className="flex flex-wrap">
                {line.tokens.map((token, j) => (
                  <span key={j} className="inline-flex flex-col">
                    <span className="min-h-[1em] font-bold leading-none text-sky-400">
                      {token.chord ?? '\u00A0'}
                    </span>
                    <span className="leading-tight">
                      {token.lyric.length === 0 ? '\u00A0' : token.lyric}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </pre>
        )}
      </div>
    </section>
  );
};
