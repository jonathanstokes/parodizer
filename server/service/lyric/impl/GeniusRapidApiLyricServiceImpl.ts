import axios from 'axios';

export class GeniusRapidApiLyricServiceImpl {
  protected rapidApiKey: string;

  constructor(rapidApiKey: string) {
    this.rapidApiKey = rapidApiKey;
  }

  async findSongs(searchTerm: string): Promise<RaGeniusSongResult[]> {
    const results = await axios.get<RaGeniusLyricResult<RaGeniusSearchResults>>(
      `https://genius.p.rapidapi.com/search`,
      {
        headers: {
          'content-type': 'application/octet-stream',
          'x-rapidapi-host': 'genius.p.rapidapi.com',
          'x-rapidapi-key': this.rapidApiKey,
          useQueryString: true,
        },
        params: {
          q: searchTerm,
        },
      }
    );
    return results.data.response.hits.map((hit) => hit.result);
  }

  async loadSong(songId: number): Promise<RaGeniusSong> {
    const result = await axios.get<RaGeniusSong>(`https://genius.p.rapidapi.com/songs/${songId}`, {
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'genius.p.rapidapi.com',
        'x-rapidapi-key': this.rapidApiKey,
        useQueryString: true,
      },
    });
    return result.data;
  }
}

interface RaGeniusLyricResult<T> {
  meta: {
    status: number;
  };
  response: T;
}

interface RaGeniusSearchResults {
  hits: RaGeniusSearchHit[];
}

interface RaGeniusSearchHit {
  highlights: any[];
  index: 'song';
  type: 'song';
  result: RaGeniusSongResult;
}

export interface RaGeniusSongResult {
  /** An API path like `'/songs/4480279'`. */
  api_path: string;
  /** E.g. `'Crave by Madonna (Ft. Swae Lee)'`. */
  full_title: string;
  /** E.g. `'https://images.genius.com/048e7c9ff92fb6967d3dd6f2d55c6478.300x300x1.jpg'` */
  header_image_thumbnail_url: string;
  /** E.g. `'https://images.genius.com/048e7c9ff92fb6967d3dd6f2d55c6478.1000x1000x1.jpg'`. */
  header_image_url: string;
  id: number;
  lyrics_owner_id: number;
  lyrics_state: 'complete';
  /** E.g. `'/Madonna-crave-lyrics'`. */
  path: string;
  /** E.g. `'Crave'`. */
  title: string;
  /** E.g. `'Crave (Ft. Swae Lee)'`. */
  title_with_featured: string;
  /** E.g. `'https://genius.com/Madonna-crave-lyrics'`. */
  url: string;
}

interface RaGeniusSong {
  /** E.g. `'/songs/4480279'`. */
  api_path: string;

  apple_music_id: string;
  apple_music_player_url: string;
  /** HTML for the "Read X on Genious" link. */
  embed_content: string;
  featured_video: boolean;
  /** E.g. `'Crave by Madonna (Ft. Swae Lee)'`. */
  full_title: string;
  header_image_thumbnail_url: string;
  header_image_url: string;
  id: number;
  lyrics_owner_id: number;
  lyrics_placeholder_reason: string | null;
  lyrics_state: 'complete';
  /** E.g. `'/Madonna-crave-lyrics'`. */
  path: string;
  pyongs_count: number | null;
  recording_location: string | null;
  /** E.g. `'2019-05-10'`. */
  release_date: string;
  /** E.g. `'May 10, 2019'`. */
  release_date_for_display: string;
  song_art_image_thumbnail_url: string;
  song_art_image_url: string;
  /** E.g. `'Crave'`. */
  title: string;
  /** E.g. `'Crave (Ft. Swae Lee)'`. */
  title_with_featured: string;
  /** E.g. `'https://genius.com/Madonna-crave-lyrics'`. */
  url: string;

  primary_artist: Artist;
  stats: SongStats;
}

interface Artist {
  /** E.g. `'/artists/276'`. */
  api_path: string;
  /** E.g. `'https://images.genius.com/14366bd3fc2346dbddc60281ba58a7dc.1000x301x1.png'`. */
  header_image_url: string;
  id: number;
  /** E.g. `'https://images.genius.com/2a065d905467386239ddccc22dd111e0.1000x1000x1.jpg'`. */
  image_url: string;
  is_meme_verified: boolean;
  is_verified: boolean;
  /** E.g. `'Madonna'`. */
  name: string;
  /** E.g. `'https://genius.com/artists/Madonna'`. */
  url: string;
}

interface SongStats {
  accepted_annotations: number;
  contributors: number;
  iq_earners: number;
  transcribers: number;
  unreviewed_annotations: number;
  verified_annotations: number;
  concurrents: number;
  hot: boolean;
  pageviews: number;
}

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
