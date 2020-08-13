import React from 'react';
import Button from 'react-bootstrap/Button';

import { Job } from '../../../client-and-server/lyric-list-service-types';
import SongLyricSet from './SongLyricSet';

import '../../../style/component/search/result/MatchedSong.scss';
import { SongResult } from '../../../client-and-server/lyric-types';

const MatchedSong = (props: { song: SongResult; job: Job }) => {
  const { song, job } = props;
  const title = song.title;
  const artist = song.artist;

  const openSongLyrics = () => {
    window.open(song.lyricsUrl, `parodizer-${song.title}-${song.artist}`);
  };

  return (
    <div className="matched-song">
      <div className="header d-flex flex-column">
        <div className="title-row d-flex justify-content-between">
          <div className="title">{title}</div>
          <div className="song-links d-flex">
            <Button className="song-link lyrics-link" variant="outline-secondary" size="sm" onClick={openSongLyrics}>
              Lyrics ⇗
            </Button>
          </div>
        </div>
        <div className="credit-row d-flex justify-content-between">
          {artist && <div className="artist">{artist}</div>}
          <div className="year" title={JSON.stringify(song.score)}>
            ({song.year})
          </div>
        </div>
      </div>
      <div className="contains-words d-flex flex-row align-items-center">
        <div className="contains-words-label">Contains words:</div>
        {song.containsWords &&
          song.containsWords.map((word) => (
            <div className="contains-word" key={`cw-${word}`}>
              {word}
            </div>
          ))}
      </div>
      <SongLyricSet job={job} song={song} />
    </div>
  );
};

export default MatchedSong;
