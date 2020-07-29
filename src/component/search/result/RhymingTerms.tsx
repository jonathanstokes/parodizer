import React from 'react';

import { Job } from '../../../client-and-server/lyric-list-service-types';

import '../../../style/component/search/result/RhymingTerms.scss';

const RhymingTerms = (props: { job: Job }) => {
  const { job } = props;
  const isRunning = job.status === 'running' || job.status === 'started';
  const outputTitle = isRunning ? 'Looking for lyrics containing any of:' : 'Lyrics containing any of:';
  return job.output.rhymingTerms ? (
    <div className="rhyming-terms d-flex flex-column">
      <div className="terms d-flex flex-wrap">
        <div className="header">{outputTitle}</div>
        {job.output.rhymingTerms?.primary.map((term) => (
          <div className="term primary-term" key={`fp-${term}`}>
            {term}
          </div>
        ))}
        {job.output.rhymingTerms?.secondary.map((term) => (
          <div className="term secondary-term" key={`fs-${term}`}>
            {term}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="rhyming-terms d-flex flex-column">
      <div className="waiting-terms d-flex flex-wrap">
        <div className="header">Looking for rhyming words for:</div>
        {job.input.primary.map((term) => (
          <div className="term waiting-term primary-term" key={`wp-${term}`}>
            {term}
          </div>
        ))}
        {job.input.secondary.map((term) => (
          <div className="term waiting-term secondary-term" key={`ws-${term}`}>
            {term}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RhymingTerms;
