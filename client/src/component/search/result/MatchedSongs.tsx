import React from "react";

import { Job } from "../../../client-and-server/lyric-list-service-types";
import MatchedSong from "./MatchedSong";

import "../../../style/component/search/result/MatchedSongs.scss";

const MatchedSongs = (props: { job: Job }) => {
  const { job } = props;
  const songs = job.output.songs;
  const isRunning = job.status === "running" || job.status === "started";
  const isLoadingSongs =
    isRunning &&
    !songs &&
    !!job.output.rhymingTerms &&
    !!job.output.rhymingTerms.primary &&
    !!job.output.rhymingTerms.primary.length;
  const isErrored = !isRunning && !!job.error;
  return (
    <div className="matched-songs">
      {songs &&
        songs.map((song) => (
          <MatchedSong song={song} job={job} key={song.id} />
        ))}
      {isLoadingSongs && (
        <div className="faux-matched-song-container">
          <div className="faux-matched-song shimmer" />
          <div className="faux-matched-song shimmer" />
          <div className="faux-matched-song shimmer" />
        </div>
      )}
      {!isLoadingSongs &&
        !isRunning &&
        !isErrored &&
        (!songs || !songs.length) && (
          <div className="no-results">No songs found.</div>
        )}
    </div>
  );
};

export default MatchedSongs;
