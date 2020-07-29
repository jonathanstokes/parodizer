import React from 'react';
import Button from 'react-bootstrap/Button';

import { Job, WordMatchedSong } from '../../../client-and-server/lyric-list-service-types';
import SongLyricSet from './SongLyricSet';

const MatchedSong = (props: { song: WordMatchedSong; job: Job }) => {
  const { song, job } = props;
  const title = song.title;
  const artist = song.fullTitle.indexOf(title) === 0 ? song.fullTitle.substring(title.length).trim() : null;

  const openSongLyrics = () => {
    window.open(song.lyricsUrl, `parodizer-${song.fullTitle}`);
  };

  return (
    <div className="matched-song">
      <div className="header d-flex flex-row">
        <Button className="title" variant="link" size="sm" onClick={openSongLyrics}>
          {title}
        </Button>
        {artist && <div className="artist">{artist}</div>}
        <div className="year">{song.year}</div>
      </div>
      <div className="contains-words d-flex flex-row">
        <div className="contains-words-label">Contains words:</div>
        {song.containsWords.map((word) => (
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
