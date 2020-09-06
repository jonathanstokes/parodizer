import axios from 'axios';

import { LyricService } from '../LyricService';
import { SongSummary } from '../../../../../client/src/client-and-server/lyric-types';

export class MusixMatchLyricServiceImpl implements LyricService {
  protected static GENRE_ID_ROCK = 21;

  constructor(protected apiKey: string) {}

  async findSongs(searchTerm: string): Promise<SongSummary[]> {
    const response = await axios.get<MmTrackSearchResponse>(`https://api.musixmatch.com/ws/1.1/track.search`, {
      params: {
        format: 'json',
        q_lyrics: searchTerm,
        quorum_factor: 1,
        apikey: this.apiKey,
        s_track_rating: 'desc',
        f_music_genre_id: MusixMatchLyricServiceImpl.GENRE_ID_ROCK,
        page_size: 50,
      },
    });
    // console.log(`Result from 'https://api.musixmatch.com/ws/1.1/track.search?q_lyrics=${searchTerm}':`, JSON.stringify(response.data));
    if (response.status === 200) {
      if (!response.data.message.body.track_list) {
        if (response.data.message.header.status_code !== 200) {
          throw new Error(
            `For query '${searchTerm}', got '${response.statusText}' (${response.status}) in response header but ${
              response.data.message.header.status_code
            } in body: ${JSON.stringify(response.data)}`
          );
        }
        throw new Error(`No 'track_list' found in: ${JSON.stringify(response.data)}`);
      }
      return response.data.message.body.track_list.map<SongSummary>(trackContainer => {
        const mmTrack = trackContainer.track;
        return {
          id: `${mmTrack.track_id}`,
          title: mmTrack.track_name,
          artist: mmTrack.artist_name,
          lyricsUrl: mmTrack.track_share_url,
        };
      });
    } else {
      throw new Error(`Error response ${response.statusText} (${response.status}) searching tracks.`);
    }
  }
}

interface MmResponse<T> {
  message: {
    header: MmMessageHeader;
    body: T;
  };
}

interface MmMessageHeader {
  status_code: 200 | number;
  execute_time: number;
  available: number;
}

type MmTrackSearchResponse = MmResponse<MmTrackSearchResults>;

interface MmTrackSearchResults {
  track_list: MmTrackSearchResult[];
}

interface MmTrackSearchResult {
  track: MmTrackSummary;
}

interface MmTrackSummary {
  track_id: number;
  track_name: string;
  track_name_translation_list: any[];
  track_rating: number;
  commontrack_id: number;
  instrumental: 0 | 1;
  explicit: 0 | 1;
  has_lyrics: 0 | 1;
  has_subtitles: 0 | 1;
  has_richsync: 0 | 1;
  num_favourite: 0 | 1;
  album_id: number;
  album_name: string;
  artist_id: number;
  artist_name: string;
  track_share_url: string;
  track_edit_url: string;
  restricted: 0 | 1;
  updated_time: string;
  primary_genres: {
    music_genre_list: {
      musiv_genre: {
        music_genre_id: number;
        music_genre_parent_id: number;
        music_genre_name: string;
        music_genre_name_extended: string;
        music_genre_vanity: string;
      };
    }[];
  };
}
