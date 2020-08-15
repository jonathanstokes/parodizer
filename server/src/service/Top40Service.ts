import fs from 'fs';
import * as stringSimilarity from 'string-similarity';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getChart } from 'billboard-top-100';
import * as path from 'path';

export class Top40Service {
  static BILLBOARD_200_CHART = 'billboard-200';
  static HOT_100_CHART = 'hot-100';
  static HOT_100_CACHE_FILENAME = '../data/billboard-hot-100.json';

  static hot100ChartCache: Map<string, Chart> | null = null;
  static hot100SongCache: Song[] | null;

  static TITLE_SIMILARITY_MATCH = 0.9;
  static ARTIST_SIMILARITY_MATCH = 0.9;

  async findSongStats(songTitle: string, artist?: string): Promise<Song | null> {
    const matches: Song[] = [];
    //const start = Date.now();
    for (const song of await Top40Service.getSongCache()) {
      if (
        songTitle === song.title ||
        stringSimilarity.compareTwoStrings(songTitle, song.title) > Top40Service.TITLE_SIMILARITY_MATCH
      ) {
        if (
          !artist ||
          artist === song.artist ||
          stringSimilarity.compareTwoStrings(artist, song.artist) > Top40Service.ARTIST_SIMILARITY_MATCH
        ) {
          if (songTitle !== song.title || artist !== song.artist) {
            console.warn(
              `Matched '${songTitle}' by '${artist}' using similarity to '${song.title}' by '${song.artist}'.`
            );
          }
          // console.log(`Matching ${songTitle} by ${artist} with ${song.chartHistory.length} week(s) on the charts.`);
          matches.push(song);
        }
      }
    }
    matches.sort((a, b) => b.chartHistory.length - a.chartHistory.length);
    if (matches.length > 1) {
      console.log(`Multiple matches for ${songTitle} by ${artist}:`, matches);
    }
    const match = matches[0] || null;
    //const ellapsed = Date.now() - start;
    //console.debug(`Found Billboard match for ${songTitle} by ${artist} in ${ellapsed}ms.`);
    return match;
  }

  static async getSongCache(): Promise<Song[]> {
    if (!this.hot100SongCache) {
      console.log(`Building song cache.`);
      const startTime = Date.now();
      const getSongKey = (title: string, artist: string) => `${artist}:${title}`;
      const songsByArtistTitle: { [k: string]: Song } = {};
      for (const chart of Array.from((await this.getChartCache()).values())) {
        for (const chartSong of chart.songs) {
          const key = getSongKey(chartSong.title, chartSong.artist);
          let song = songsByArtistTitle[key];
          if (!song) {
            song = {
              title: chartSong.title,
              artist: chartSong.artist,
              chartHistory: [],
            };
            songsByArtistTitle[key] = song;
          }
          song.chartHistory.push({
            rank: chartSong.rank,
            weekOf: chart.week,
          });
        }
      }
      this.hot100SongCache = Object.values(songsByArtistTitle);
      console.log(`Song cache built after ${(Date.now() - startTime) / 1000} seconds.`);
    }
    // let maxWeeks = this.hot100SongCache.reduce((prev, song) => Math.max(song.chartHistory.length, prev), 0);
    return this.hot100SongCache;
  }

  static async getChartCache(): Promise<Map<string, Chart>> {
    if (!this.hot100ChartCache) {
      this.hot100ChartCache = await this.readChartCache();
    }
    return this.hot100ChartCache;
  }

  static async readChartCache(): Promise<Map<string, Chart>> {
    const chartsByWeek = new Map<string, Chart>();
    return new Promise((resolve, reject) => {
      console.log(`Reading chart cache.`);
      const startTime = Date.now();
      let filename = path.join(__dirname, Top40Service.HOT_100_CACHE_FILENAME);
      if (!fs.existsSync(filename)) filename = path.join(__dirname, `../${Top40Service.HOT_100_CACHE_FILENAME}`);
      fs.readFile(filename, (err, data) => {
        if (err) reject(err);
        else {
          const json = JSON.parse(data.toString());
          for (const key of Object.keys(json)) {
            chartsByWeek.set(key, json[key]);
          }
          console.log(`Chart cache read after ${(Date.now() - startTime) / 1000} seconds.`);
          resolve(chartsByWeek);
        }
      });
    });
  }

  async writeChartCache(): Promise<void> {
    console.log(`Loading billboard cache.`);
    const chartsByWeek = await Top40Service.readChartCache();
    let nextWeek = (await this.loadChart(Top40Service.HOT_100_CHART)).week;
    try {
      let loadedWeeks = 0;
      do {
        let chart = chartsByWeek.get(nextWeek);
        const wasCached = !!chart;
        if (!chart) {
          chart = await this.loadChart(Top40Service.HOT_100_CHART, nextWeek);
          chartsByWeek.set(chart.week, chart);
          loadedWeeks++;
        }
        nextWeek = chart.previousWeek && chart.previousWeek.date;
        console.log(`${wasCached ? 'Found' : 'Loaded'} ${chart.week}, next is ${nextWeek}.`);
      } while (nextWeek && +nextWeek.substring(0, 4) > 1960 && loadedWeeks < 100);
    } finally {
      console.log(`Writing cache.`);
      const printable = Array.from(chartsByWeek).reduce((obj: any, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
      await new Promise((resolve, reject) => {
        fs.writeFile(Top40Service.HOT_100_CACHE_FILENAME, JSON.stringify(printable, null, 2), err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  protected async loadChart(chartName: string, weekDate?: string): Promise<Chart> {
    let firstError: any;
    for (let i = 0; i < 3; i++) {
      try {
        return await this.doLoadChart(chartName, weekDate);
      } catch (err) {
        if (!firstError) firstError = err;
        console.log(`Retrying to load ${chartName} for ${weekDate}.`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw firstError;
  }

  protected doLoadChart(chartName: string, weekDate?: string): Promise<Chart> {
    return new Promise<Chart>((resolve, reject) => {
      const handler = (err: any, chart: Chart) => {
        if (err) {
          console.error(err);
          reject(err);
        } else resolve(chart);
      };
      if (weekDate) getChart(chartName, weekDate, handler);
      else getChart(chartName, handler);
    });
  }

  // protected getCharts(): Promise<ChartSummary[]> {
  //     return new Promise<ChartSummary[]>((resolve, reject) => {
  //         listCharts((charts: ChartSummary[], err: any) => {
  //             if (err) reject(err);
  //             else resolve(charts);
  //         });
  //     });
  // }

  // protected isMatch(songTitle: string, artist: string | undefined, song: ChartSong): boolean {
  //     const titlesMatch = song.title === songTitle;
  //     if (titlesMatch) {
  //         if (artist) {
  //             if (artist === song.artist) {
  //                 return true;
  //             } else {
  //                 console.log(`Artist '${song.artist}' doesn't match sought after ${artist}' for song '${songTitle}'.`);
  //                 return false;
  //             }
  //         }
  //     }
  //     return titlesMatch;
  // }
  //
  // protected getScore(song: ChartSong): number {
  //     return 1.0 - (song.rank / 100);
  // }
}

// interface ChartSummary {
//     name: string;
//     url: string;
// }

interface Chart {
  songs: ChartSong[];
  /** yyyy-mm-dd */
  week: string;
  previousWeek: {
    date: string;
    url: string;
  };
  nextWeek: {
    date: string;
    url: string;
  };
}

interface ChartSong {
  title: string;
  artist: string;
  rank: number;
  cover: string;
}

export interface Song {
  title: string;
  artist: string;
  year?: number;
  chartHistory: {
    rank: number;
    weekOf: string;
  }[];
}
