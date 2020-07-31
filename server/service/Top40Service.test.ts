import { expect } from 'chai';
import 'mocha';
import * as Sinon from 'sinon';

import { Top40Service } from './Top40Service';

describe('Top40Service', () => {
  let service: Top40Service;

  beforeEach(() => (service = new Top40Service()));

  // function() syntax needed for this.timeout()
  it('should get specific song results', async function () {
    // @ts-ignore
    this.timeout(6000);

    const songs = await Top40Service.getSongCache();

    const confirmSongRank = (title: string, artist: string, weeksInTop100: number) => {
      const song = songs.find((s) => s.title === title && s.artist === artist);
      if (!song) {
        const artistsThatMatchTitle = songs.filter(s => s.title === title).map(s => s.artist);
        const otherTitlesByArtist = songs.filter(s => s.artist === artist).map(s => s.title);
        console.log(`Song '${title}' by ${artist} not found.\nOther artists that match that title: ${artistsThatMatchTitle.join(', ')}\nOther titles by that artist: ${otherTitlesByArtist.join(', ')}`);
      }
      expect(!!song, `Expected to find ${title} by ${artist} on the Billboard charts.`).to.be.true;
      if (song) {
        // console.log(song.title + ": " + song.chartHistory.map(ch => ch.weekOf).join(', '));
        expect(song.chartHistory.length).to.equal(weeksInTop100);
      }
    }

    confirmSongRank('Money For Nothing', 'Dire Straits', 22); // 1985
    confirmSongRank('Demons', 'Imagine Dragons', 61); // 2013
    confirmSongRank('U Can\'t Touch This', 'M.C. Hammer', 17); // 1990
    confirmSongRank('Addicted To Love', 'Robert Palmer', 22); // 1986
  });
});
