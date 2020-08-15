import { expect } from 'chai';
import 'mocha';
import axios, { AxiosRequestConfig } from 'axios';
import * as Sinon from 'sinon';
import { LyricListService } from '../../src/service/LyricListService';
import * as path from 'path';
import * as fs from 'fs';
import { SongResult } from '../../../client/src/client-and-server/lyric-types';

describe('LyricListService integration', () => {
  let service: LyricListService;
  let sandbox: Sinon.SinonSandbox;
  let axiosStub: Sinon.SinonStub;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    axiosStub = sandbox.stub(axios, 'get');
    service = new LyricListService({ rapidApiKey: 'fake-rapid-api-key', musixMatchApiKey: 'fake-musix-match-api-key' });
  });

  afterEach(() => sandbox.restore());

  describe('startJob()', () => {
    beforeEach(() => {
      axiosStub.callsFake(async (url: string, config: AxiosRequestConfig) => {
        if (url.startsWith(`https://wordsapiv1.p.rapidapi.com/words/`)) {
          const baseDir = path.join(__dirname, '../../../data/mock/rhyming');
          const filePath = url.substring(`https://wordsapiv1.p.rapidapi.com/`.length);
          const filename = path.join(baseDir, `${filePath}.json`);
          const jsonData = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
          return {
            status: 200,
            data: JSON.parse(jsonData),
          };
        } else if (url.startsWith(`https://api.musixmatch.com/ws/1.1/track.search`)) {
          const word = config.params.q_lyrics;
          const baseDir = path.join(__dirname, '../../../data/mock/musixmatch/track.search/q_lyrics/');
          const filename = path.join(baseDir, `${word}.json`);
          const stringData = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
          try {
            const jsonData = JSON.parse(stringData);
            return {
              status: 200,
              data: jsonData,
            };
          } catch (err) {
            console.error(`Error parsing JSON from file ${filename}:`, err);
            throw err;
          }
        } else {
          throw new Error(`Unknown url '${url}'.`);
        }
      });
    });

    it(`should return results for 'roll'`, async () => {
      const job = await service.startJob(['roll'], []);
      expect(job.status).to.equal('running');
      while (job.status === 'running') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (job.status === 'error') {
        console.error(job.error);
        throw job.error;
      }
      expect(job.status, `Job status=${job.status}, error=${JSON.stringify(job.error)}.`).to.equal('complete');
      expect(job.input).to.deep.equal({ primary: ['roll'], secondary: [] });
      expect(job.output.songs && job.output.songs.length).to.be.greaterThan(1);
      const songs = job.output.songs as SongResult[];
      expect(songs.length).to.be.greaterThan(1);
      for (const song of songs) {
        const dupes = songs.filter(s => s !== song && s.title === song.title && s.artist === song.artist);
        expect(dupes, `${dupes.length} duplicate(s) found for '${song.title}' by ${song.artist}.`).to.have.length(0);
      }
    });
  });
});
