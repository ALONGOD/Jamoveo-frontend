export type Instrument =
  | 'drums'
  | 'guitar'
  | 'bass'
  | 'saxophone'
  | 'keyboards'
  | 'vocals';

export type Role = 'user' | 'admin';

export interface AppUser {
  id: string;
  username: string;
  role: Role;
  instrument: Instrument;
}

export interface SongToken {
  chord?: string;
  lyric: string;
}

export interface SongLine {
  tokens: SongToken[];
}

export interface SongSearchResult {
  id: string;
  title: string;
  artist: string;
  image?: string;
  sourceUrl: string;
}

export interface Song {
  title: string;
  artist: string;
  sourceUrl: string;
  image?: string;
  lines: SongLine[];
}

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  drums: 'Drums',
  guitar: 'Guitar',
  bass: 'Bass',
  saxophone: 'Saxophone',
  keyboards: 'Keyboards',
  vocals: 'Singer',
};

export const INSTRUMENT_OPTIONS: Instrument[] = [
  'drums',
  'guitar',
  'bass',
  'saxophone',
  'keyboards',
  'vocals',
];
