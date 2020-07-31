import { RhymingService } from './RhymingService';
import { Song, Top40Service } from './Top40Service';
import { uuid } from 'uuidv4';
import PQueue from 'p-queue';
import { Job, SearchTerms } from '../../src/client-and-server/lyric-list-service-types';
import { LyricService } from './lyric/LyricService';
import { MusixMatchLyricServiceImpl } from './lyric/impl/MusixMatchLyricServiceImpl';
import { SongResult, SongSummary } from '../../src/client-and-server/lyric-types';

export class LyricListService {
  static queue = new PQueue({ concurrency: 1 });
  static jobsById: { [jobId: string]: Job } = {};

  protected rhymingService: RhymingService;
  protected lyricService: LyricService;
  protected top40Service: Top40Service;

  constructor(apiKeys: { rapidApiKey: string; musixMatchApiKey: string }) {
    this.rhymingService = new RhymingService(apiKeys.rapidApiKey);
    this.lyricService = new MusixMatchLyricServiceImpl(apiKeys.musixMatchApiKey);
    this.top40Service = new Top40Service();
  }

  async getJob(jobId: string): Promise<Job | null> {
    return LyricListService.jobsById[jobId] || null;
  }

  async startJob(primaryTerms: string[], secondaryTerms: string[]): Promise<Job> {
    const created = new Date();
    const job: Job = {
      id: uuid(),
      status: 'running',
      input: { primary: primaryTerms, secondary: secondaryTerms },
      output: {},
      created,
      lastUpdated: created,
    };
    this.queueJob(job);
    LyricListService.jobsById[job.id] = job;
    return job;
  }

  protected queueJob(job: Job) {
    LyricListService.queue.add<Job>(() => this.runJob(job));
  }

  protected runJob(job: Job): Job {
    this.doRunJob(job).catch((err) => {
      console.error(`Error running job ${job.id}:`, err);
      job.error = err.message;
      job.status = 'error';
      job.lastUpdated = new Date();
    });
    return job;
  }

  protected async doRunJob(job: Job): Promise<void> {
    console.log(`Finding rhyming words for '${JSON.stringify(job.input)}'.`);
    job.output.rhymingTerms = await this.findRhymingWords(job.input);
    job.lastUpdated = new Date();

    console.log(`Finding songs.`);
    job.output.songs = await this.findSongs(job.output.rhymingTerms);
    job.lastUpdated = new Date();

    // TODO: find lyrics for each song.

    job.status = 'complete';
    job.lastUpdated = new Date();
  }

  async findRhymingWords(inputWords: SearchTerms): Promise<SearchTerms> {
    const primaryRhymingWords = new Set<string>(inputWords.primary);
    for (const primaryWord of inputWords.primary) {
      for (const rhymingWord of await this.rhymingService.fetchRhymingWords(primaryWord)) {
        primaryRhymingWords.add(rhymingWord);
      }
    }
    const secondaryRhymingWords = new Set<string>(inputWords.secondary);
    for (const secondaryWord of inputWords.secondary) {
      for (const rhymingWord of await this.rhymingService.fetchRhymingWords(secondaryWord)) {
        if (!primaryRhymingWords.has(rhymingWord)) {
          secondaryRhymingWords.add(rhymingWord);
        }
      }
    }
    return {
      primary: Array.from(primaryRhymingWords.values()),
      secondary: Array.from(secondaryRhymingWords.values()),
    };
  }

  async findSongs(terms: SearchTerms): Promise<SongResult[]> {
    const primarySongs = await this.findSongsWithWords(terms.primary);
    const secondarySongs = await this.findSongsWithWords(terms.secondary);

    const mergedSongs = [...primarySongs];
    for (const ss of secondarySongs) {
      const matchedPrimary = mergedSongs.find((ps) => ps.id === ss.id);
      if (matchedPrimary) {
        matchedPrimary.score = matchedPrimary.score + 0.2;
        (ss.containsWords || []).forEach((w) => {
          if (matchedPrimary.containsWords && matchedPrimary.containsWords.indexOf(w) < 0) {
            matchedPrimary.containsWords.push(w);
          }
        });
      } else {
        mergedSongs.push(ss);
      }
    }
    return mergedSongs;
  }

  async findSongsWithWords(rhymingWords: string[]): Promise<SongResult[]> {
    const songMatchesByRhymingWord: { [rhymingWord: string]: SongResult[] } = {};
    for (const rhymingWord of rhymingWords) {
      const filteredSongMatches: SongResult[] = [];
      const songMatches = await this.lyricService.findSongs(rhymingWord);
      for (const songMatch of songMatches) {
        const songRating = await this.getSongMatchRating(songMatch);
        if (songRating > 0) {
          filteredSongMatches.push({
            ...songMatch,
            score: songRating,
          });
        }
      }
      songMatchesByRhymingWord[rhymingWord] = filteredSongMatches;
    }
    const songCountByRhymingWord: { [word: string]: number | undefined } = {};
    Object.keys(songMatchesByRhymingWord).forEach(
      (word) => (songCountByRhymingWord[word] = songMatchesByRhymingWord[word].length || undefined)
    );
    console.log(`Unfiltered song counts by word: ${JSON.stringify(songCountByRhymingWord)}`);

    const wordMatchedSongsById: { [id: string]: SongResult } = {};
    for (const word of Object.keys(songMatchesByRhymingWord)) {
      for (const match of songMatchesByRhymingWord[word]) {
        if (match.score > 0.6) {
          let outputSong = wordMatchedSongsById[match.id];
          if (!outputSong) {
            outputSong = {
              ...match,
              containsWords: [],
            };
            wordMatchedSongsById[outputSong.id] = outputSong;
          }
          outputSong.containsWords && outputSong.containsWords.push(word);
        }
      }
    }
    const output: SongResult[] = Object.values(wordMatchedSongsById);
    output.sort((a, b) => b.score - a.score);
    console.log(
      `Song results for ${JSON.stringify(rhymingWords)}:${output
        .map((wms) => {
          return '\n' + wms.score.toFixed(3) + '\t' + wms.year + '\t' + wms.title + '\tby ' + wms.artist;
        })
        .join('')}`
    );
    return output;
  }

  protected async getSongMatchRating(songMatch: SongSummary): Promise<number> {
    try {
      const variations = this.createSongVariations(songMatch);
      let result: Song | null = null;
      for (const variation of variations.reverse()) {
        result = await this.top40Service.findSongStats(variation.title, variation.artist);
        if (result) {
          if (songMatch !== variation) {
            console.log(
              `Replacing\n\t     ${JSON.stringify(songMatch)}\n\twith ${JSON.stringify(
                variation
              )}\nbecause it was found in billboard.`
            );
            Object.assign(songMatch, variation);
          }
          break;
        }
      }
      if (result) {
        const rating = this.rateSong(result);
        songMatch.year = songMatch.year || result.year;
        return rating;
      } else {
        // console.log(
        //   `Filtered out '${songMatch.title}' ${
        //     songMatch.artist ? "by '" + songMatch.artist + "' " : ''
        //   }because no billboard match could be found.`
        // );
        return 0;
      }
    } catch (err) {
      console.error(`Error filtering song match ${JSON.stringify(songMatch)}.`, err);
      throw err;
    }
  }

  /**
   * Creates variations of the given song that might match the Billboard database better.
   * If no variation is needed, the given SongSummary will be the only item in the output list.
   */
  createSongVariations(lyricSong: SongSummary): SongSummary[] {
    const variations = [lyricSong];

    // Adds a variation to the `variations` array if the title matches the given pattern.
    const findVariation = (pattern: RegExp, titleResultIndex: number, artistResultIndex: number) => {
      const matches = pattern.exec(lyricSong.title);
      if (matches) {
        const newTitle = matches[titleResultIndex].trim();
        const newArtist = matches[artistResultIndex].trim();
        variations.push({ ...lyricSong, title: newTitle, artist: newArtist });
      }
    };

    // 'One Voice (In the Style of Barry Manilow) [Karaoke Version]'
    findVariation(/(.*)(\W+in the style of[\s'"]+)([\w\s]+)(.*)/gi, 1, 3);
    // 'One Voice (No Backing Vocals) [Karaoke Version] [Originally Performed By Barry Manilow]'
    findVariation(/([\w\s]+)(.*originally performed by[\s'"]+)([\w\s]+)(.*)/gi, 1, 3);

    if (variations.length === 1 && (/karaoke/gi.test(lyricSong.title) || /karaoke/gi.test(lyricSong.artist))) {
      console.warn(`Possible missing variant for song '${lyricSong.title}' by '${lyricSong.artist}'.`);
    }
    return variations;
  }

  protected rateSong(song: Song): number {
    const weekCount = song.chartHistory.length;
    const year = this.getSongYear(song);
    song.year = song.year || year;
    // Most promising years: 1982-1995     10 weeks is passing
    // Next tier: 1978-1981, 1995-2000     25 weeks is passing
    // 3rd tier: 1968-1977, 2001-2010      35 weeks is passing
    // 4th tier: <=1967                    45
    // 5th tier: >=2011                    55
    let rating: number;
    if (year >= 1982 && year <= 1995) rating = this.scaleRating(10, weekCount);
    else if ((year >= 1978 && year <= 1981) || (year >= 1995 && year <= 2000)) rating = this.scaleRating(25, weekCount);
    else if ((year >= 1968 && year <= 1977) || (year >= 2001 && year <= 2010)) rating = this.scaleRating(35, weekCount);
    else if (year < 1968) rating = this.scaleRating(45, weekCount);
    else rating = this.scaleRating(55, weekCount); // >=2011
    return rating;
  }

  protected getSongYear(song: Song): number {
    const history = [...song.chartHistory];
    history.sort((a, b) => this.toDate(a.weekOf).getTime() - this.toDate(b.weekOf).getTime());
    return this.toDate(history[0].weekOf).getFullYear();
  }

  protected scaleRating(targetPassing: number, weekCount: number): number {
    if (weekCount < targetPassing) {
      return (weekCount / targetPassing) * 0.7;
    } else {
      return 0.7 + 0.3 * ((weekCount - targetPassing) / 75);
    }
  }

  protected toDate(dateString: string): Date {
    return new Date(Date.parse(dateString));
  }
}
