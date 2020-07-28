export interface LyricMatchedSong {
  id: number;
  score: number;
  fullTitle: string;
  title: string;
  year?: number;
  lyricsUrl: string;
  raw: any;
}

export interface WordMatchedSong extends LyricMatchedSong {
  containsWords: string[];
}

export interface SearchTerms {
  primary: string[];
  secondary: string[];
}

export interface LyricMatch {
  prefixText: string;
  matchedText: string;
  suffixText: string;
}

export interface JobOutput {
  rhymingTerms?: SearchTerms;
  songs?: WordMatchedSong[];
  lyricsBySongId?: { [songId: string]: LyricMatch };
}

export interface Job {
  id: string;
  status: 'started' | 'running' | 'complete' | 'error' | 'timed-out';
  error?: any;
  created: Date;
  lastUpdated: Date;
  input: SearchTerms;
  output: JobOutput;
}
