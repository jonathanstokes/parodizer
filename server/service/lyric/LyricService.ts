import { SongSummary } from '../../../src/client-and-server/lyric-types';

export interface LyricService {
  findSongs(searchTerm: string): Promise<SongSummary[]>;
}
