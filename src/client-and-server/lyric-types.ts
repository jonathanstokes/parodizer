export interface SongSummary {
  id: string;
  title: string;
  artist: string;
  year?: number;
  /** The location of a page the end user can navigate to, to view the lyrics for this song. */
  lyricsUrl: string;
}

export interface SongResult extends SongSummary {
  score: number;
  containsWords?: string[];
}
