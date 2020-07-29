import React from 'react';

import { Job } from '../../../client-and-server/lyric-list-service-types';
import MatchedSong from './MatchedSong';

import '../../../style/component/search/result/MatchedSongs.scss';

const MatchedSongs = (props: { job: Job }) => {
  const { job } = props;
  return (
    <div className="matched-songs">
      {job.output.songs && job.output.songs.map((song) => <MatchedSong song={song} job={job} key={song.id} />)}
    </div>
  );
};

export default MatchedSongs;
