import { expect } from 'chai';
import 'mocha';
import * as Sinon from 'sinon';

import { LyricListService } from './LyricListService';
import { RhymingService } from './RhymingService';
import { Top40Service } from './Top40Service';
import { SongSummary } from '../../../client/src/client-and-server/lyric-types';
import { LyricService } from './lyric/LyricService';

describe('LyricListService', () => {
  let service: LyricListService;
  let mockRhymingService: RhymingService;
  let mockLyricService: LyricService;
  let mockTop40Service: Top40Service;

  let sandbox: Sinon.SinonSandbox;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  before(() => (sandbox = Sinon.createSandbox()));
  afterEach(() => sandbox.restore());

  beforeEach(() => {
    service = new LyricListService({ rapidApiKey: 'fake-api-key', musixMatchApiKey: 'fake-mm-key' });
    (service as any).rhymingService = mockRhymingService = sandbox.stub() as any;
    (service as any).lyricService = mockLyricService = sandbox.stub() as any;
    (service as any).top40Service = mockTop40Service = sandbox.stub() as any;
  });

  describe('findRhymingWords()', () => {
    it('should query for rhyming words given a single input word', async () => {
      const fetchRhymingWordsStub = sandbox.stub().resolves(['save']);
      mockRhymingService.fetchRhymingWords = fetchRhymingWordsStub;

      const result = await service.findRhymingWords({ primary: ['gave'], secondary: [] });
      expect(result).to.deep.equal({ primary: ['gave', 'save'], secondary: [] });
      expect(fetchRhymingWordsStub.callCount).to.equal(1);
      expect(fetchRhymingWordsStub.getCall(0).args).to.deep.equal(['gave']);
    });
  });

  describe('createSongVariations()', () => {
    type TitleAndArtist = { title: string; artist: string };
    type VariationExpectation = { input: TitleAndArtist; expect: TitleAndArtist };

    const variationsToTest: VariationExpectation[] = [
      {
        input: { title: 'One Voice (In the Style of Barry Manilow) [Karaoke Version]', artist: 'Karaoke All Star' },
        expect: { title: 'One Voice', artist: 'Barry Manilow' },
      },
      {
        input: { title: 'One Voice (In The Style Of Barry Manilow)', artist: 'Ameritz Karaoke Band' },
        expect: { title: 'One Voice', artist: 'Barry Manilow' },
      },
      {
        input: {
          title: 'One Voice (No Backing Vocals) [Karaoke Version] [Originally Performed By Barry Manilow]',
          artist: 'Zoom Karaoke',
        },
        expect: { title: 'One Voice', artist: 'Barry Manilow' },
      },
      {
        input: { title: 'Rave On(Originally Performed By Buddy Holly) [Karaoke Backing Track]', artist: 'Paris Music' },
        expect: { title: 'Rave On', artist: 'Buddy Holly' },
      },
      {
        input: { title: 'Rave On (Originally Performed By Buddy Holly) [Full Vocal Version]', artist: 'Paris Music' },
        expect: { title: 'Rave On', artist: 'Buddy Holly' },
      },
      {
        input: {
          title: 'Primadonna (Originally Performed By Marina and the Diamonds) [Karaoke Audio Version]',
          artist: '2010s Karaoke Band',
        },
        expect: { title: 'Primadonna', artist: 'Marina and the Diamonds' },
      },
      {
        input: {
          title: 'Primadonna (Originally Performed by Marina and the Diamonds) (Vocal Version)',
          artist: "Singer's Edge Karaoke",
        },
        expect: { title: 'Primadonna', artist: 'Marina and the Diamonds' },
      },
      {
        input: {
          title: "Let's Misbehave (In the Style of Irving Aaronson and His Commanders) [Karaoke Version]",
          artist: 'Karaoke Cloud',
        },
        expect: { title: "Let's Misbehave", artist: 'Irving Aaronson and His Commanders' },
      },
      {
        input: { title: 'A Paz (Karaoke Version) [Originally Performed By Roupa Nova]', artist: 'Xexe Band' },
        expect: { title: 'A Paz', artist: 'Roupa Nova' },
      },
      {
        input: { title: 'My Wave (Karaoke Version) [Originally Performed By Soundgarden]', artist: 'Albert 2 Stone' },
        expect: { title: 'My Wave', artist: 'Soundgarden' },
      },
      {
        input: {
          title: 'God Gave Me You (Originally Performed by Blake Shelton) (Vocal Version)',
          artist: "Singer's Edge Karaoke",
        },
        expect: { title: 'God Gave Me You', artist: 'Blake Shelton' },
      },
      {
        input: {
          title: 'God Gave Me You (In the Style of Blake Shelton) [Karaoke Version]',
          artist: 'Ameritz Audio Karaoke',
        },
        expect: { title: 'God Gave Me You', artist: 'Blake Shelton' },
      },
      {
        input: {
          title: 'La Nuit je mens [In the Style of "Alain Bashung"] {Karaoke Version}',
          artist: 'The Karaoke Channel',
        },
        expect: { title: 'La Nuit je mens', artist: 'Alain Bashung' },
      },
      {
        input: { title: "Money for Nothing (In the Style of 'Dire Straits')", artist: 'Zoom Karaoke' },
        expect: { title: 'Money for Nothing', artist: 'Dire Straits' },
      },

      // {
      //   input: { title: '', artist: '' },
      //   expect: { title: '', artist: '' },
      // },
    ];

    for (const variationToTest of variationsToTest) {
      it(`should generate variations for karaoke songs: ${variationToTest.input.title}`, () => {
        const song: SongSummary = {
          id: 'song-1',
          title: variationToTest.input.title,
          artist: variationToTest.input.artist,
          lyricsUrl: 'http://lyrics/song-1',
        };
        expect(service.createSongVariations(song)).to.deep.equal([
          // original
          song,
          // variation
          {
            id: 'song-1',
            title: variationToTest.expect.title,
            artist: variationToTest.expect.artist,
            lyricsUrl: 'http://lyrics/song-1',
          },
        ]);
      });
    }
  });
});
