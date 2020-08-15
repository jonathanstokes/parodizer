import React from "react";

import { Job } from "../../../client-and-server/lyric-list-service-types";
import { SongResult } from "../../../client-and-server/lyric-types";

import "../../../style/component/search/result/SongLyricSet.scss";

const SongLyricSet = (props: { job: Job; song: SongResult }) => {
  const { job, song } = props;
  const lyrics =
    job.output.lyricsBySongId && job.output.lyricsBySongId[song.id];
  return (
    <div className="song-lyric-set">
      {lyrics ? (
        <div className="song-lyrics">TODO: show lyrics.</div>
      ) : (
        <div className="not-available">No lyrics available.</div>
      )}
    </div>
  );
};

export default SongLyricSet;
