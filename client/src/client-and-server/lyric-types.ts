export interface SongSummary {
  id: string;
  title: string;
  artist: string;
  year?: number;
  /** The location of a page the end user can navigate to, to view the lyrics for this song. */
  lyricsUrl: string;
}

export interface SongResult extends SongSummary {
  score: Score;
  containsWords?: string[];
}

export class Score {
  private rating: number;

  private readonly debugInfo: any;

  constructor(initialRating: number) {
    this.rating = initialRating;
    this.debugInfo = { initialRating: initialRating };
  }

  /** Called when this score is for a song matching a primary word, and it also matches a secondary word. */
  accumulateSecondaryWordMatch() {
    const ratingBefore = this.rating;
    this.rating += 0.05;
    this.debugInfo.secondaryWordMatch = this.debugInfo.secondaryWordMatch || {};
    this.debugInfo.secondaryWordMatch[0] = {
      previous: ratingBefore,
      next: this.rating,
    };
  }

  /** Determines whether this score is considered a metch. */
  isMinimumScoreMet() {
    return this.rating > 0.5;
  }

  ratingToString() {
    return this.rating.toFixed(3);
  }

  compare(otherScore: Score): number {
    return this.rating - otherScore.rating;
  }

  /** Called when a word is found in the song this score represents. */
  accumulateWordMatch(word: string) {
    const ratingBefore = this.rating;
    this.rating += 0.1;
    this.debugInfo.wordMatch = this.debugInfo.wordMatch || {};
    this.debugInfo.wordMatch[word] = {
      previous: ratingBefore,
      next: this.rating,
    };
  }
}
