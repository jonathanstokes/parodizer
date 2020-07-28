import {RhymingService} from "./RhymingService";
import {LyricService, RaGeniusSongResult} from "./LyricService";
import {Song, Top40Service} from "./Top40Service";
import { uuid } from 'uuidv4';
import PQueue from 'p-queue';
import {
    Job,
    LyricMatchedSong,
    SearchTerms,
    WordMatchedSong
} from "../../src/client-and-server/lyric-list-service-types";

export class LyricListService {
    static queue = new PQueue({concurrency: 1});
    static jobsById: {[jobId: string]: Job} = {};

    protected rhymingService: RhymingService;
    protected lyricService: LyricService;
    protected top40Service: Top40Service;

    constructor(rapidApiKey: string) {
        this.rhymingService = new RhymingService(rapidApiKey);
        this.lyricService = new LyricService(rapidApiKey);
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
            input: { primary: primaryTerms, secondary: secondaryTerms},
            output: {},
            created,
            lastUpdated: created
        };
        this.queueJob(job);
        LyricListService.jobsById[job.id] = job;
        return job;
    }

    protected queueJob(job: Job) {
        LyricListService.queue.add<Job>(() => this.runJob(job));
    }

    protected runJob(job: Job): Job {
        this.doRunJob(job).catch(err => {
            console.error(`Error running job ${job.id}:`, err);
            job.error = err.message;
            job.status = 'error'
            job.lastUpdated = new Date();
        })
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
        return { primary: Array.from(primaryRhymingWords.values()), secondary: Array.from(secondaryRhymingWords.values())};
    }

    async findSongs(terms: SearchTerms): Promise<WordMatchedSong[]> {
        const primarySongs = await this.findSongsWithWords(terms.primary);
        const secondarySongs = await this.findSongsWithWords(terms.secondary);

        const mergedSongs = [...primarySongs];
        for (const ss of secondarySongs) {
            const matchedPrimary = mergedSongs.find(ps => ps.id === ss.id);
            if (matchedPrimary) {
                matchedPrimary.score = matchedPrimary.score + 0.2;
                ss.containsWords.forEach(w => {
                    if (matchedPrimary.containsWords.indexOf(w) < 0) {
                        matchedPrimary.containsWords.push(w);
                    }
                });
            } else {
                mergedSongs.push(ss);
            }
        }
        return mergedSongs;
    }

    async findSongsWithWords(rhymingWords: string[]): Promise<WordMatchedSong[]> {
        const songMatchesByRhymingWord: { [rhymingWord: string]: LyricMatchedSong[]} = {};
        for (const rhymingWord of rhymingWords) {
            const filteredSongMatches: LyricMatchedSong[] = [];
            const songMatches = await this.lyricService.findSongs(rhymingWord);
            for (const songMatch of songMatches) {
                const songRating = await this.getSongMatchRating(songMatch)
                if (songRating > 0) {
                    filteredSongMatches.push({
                        id: songMatch.id,
                        score: songRating,
                        fullTitle: songMatch.full_title,
                        title: songMatch.title,
                        year: (songMatch as any).year || undefined,
                        lyricsUrl: songMatch.url,
                        raw: {...songMatch}
                    });
                }
            }
            songMatchesByRhymingWord[rhymingWord] = filteredSongMatches;
        }
        const songCountByRhymingWord: {[word: string]: number | undefined} = {};
        Object.keys(songMatchesByRhymingWord).forEach(word => songCountByRhymingWord[word] = songMatchesByRhymingWord[word].length || undefined);
        console.log(`Unfiltered song counts by word: ${JSON.stringify(songCountByRhymingWord)}`);

        const wordMatchedSongsById: {[id: string]: WordMatchedSong} = {};
        for (const word of Object.keys(songMatchesByRhymingWord)) {
            for (const match of songMatchesByRhymingWord[word]) {
                if (match.score > .6) {
                    let outputSong = wordMatchedSongsById[match.id];
                    if (!outputSong) {
                        outputSong = {
                            ...match,
                            containsWords: []
                        };
                        wordMatchedSongsById[outputSong.id] = outputSong;
                    }
                    outputSong.containsWords.push(word);
                }
            }
        }
        const output: WordMatchedSong[] = Object.values(wordMatchedSongsById);
        output.sort((a, b) => b.score - a.score);
        console.log(`Song results for ${JSON.stringify(rhymingWords)}:${output.map(wms => {
            return '\n' + wms.score.toFixed(3) + '\t' + wms.year + '\t' + wms.fullTitle;
        }).join('')}`);
        return output;
    }

    protected async getSongMatchRating(songMatch: RaGeniusSongResult): Promise<number> {
        try {
            let songTitle = songMatch.full_title.replace(/\s/g, ' ');
            let artist = '';
            let byIndex = songTitle.lastIndexOf(' by ');
            // if (byIndex < 0) byIndex = songTitle.lastIndexOf(' by ');  // <-- non-space spaces
            if (byIndex > 0) {
                artist = songTitle.substring(byIndex + 4);
                songTitle = songTitle.substring(0, byIndex);
            }
            const result = await this.top40Service.findSongStats(songTitle, artist);
            if (result) {
                const rating = this.rateSong(result);
                (songMatch as any).year = (result as any).year;
                return rating;
            } else {
                // console.log(`Filtered out '${songTitle}' ${artist ? 'by \'' + artist + '\' ': ''}because no billboard match could be found.`);
                return 0;
            }
        } catch (err) {
            console.error(`Error filtering song match ${JSON.stringify(songMatch)}.`, err);
            throw err;
        }
    }

    protected rateSong(song: Song): number {
        const weekCount = song.chartHistory.length;
        const year = this.getSongYear(song);
        (song as any).year = year;
        // Most promising years: 1982-1995     15 weeks is passing
        // Next tier: 1978-1981, 1995-2000     20 weeks is passing
        // 3rd tier: 1968-1977, 2001-2010      25 weeks is passing
        // Last tier: <=1967, >=2011           30
        if (year >= 1982 && year <= 1995) return this.scaleRating(15, weekCount);
        else if ((year >= 1978 && year <= 1981) || (year >= 1995 && year <= 2000)) return this.scaleRating(20, weekCount);
        else if ((year >= 1968 && year <= 1977) || (year >= 2001 && year <= 2010)) return this.scaleRating(25, weekCount);
        else return this.scaleRating(30, weekCount);
    }

    protected getSongYear(song: Song): number {
        const history = [...song.chartHistory];
        history.sort((a, b) => this.toDate(a.weekOf).getTime() - this.toDate(b.weekOf).getTime())
        return this.toDate(history[0].weekOf).getFullYear();
    }

    protected scaleRating(targetPassing: number, weekCount: number): number {
        if (weekCount < targetPassing) {
            return (weekCount / targetPassing) * .7;
        } else {
            return .7 + .3 * ((weekCount - targetPassing) / 75);
        }
    }

    protected toDate(dateString: string): Date {
        return new Date(Date.parse(dateString));
    }
}
