import React from 'react';

import { Job } from '../../../client-and-server/lyric-list-service-types';

const RhymingTerms = (props: { job: Job }) => {
  const { job } = props;
  return job.output.rhymingTerms ? (
    <div className="rhyming-terms d-flex flex-column">
      <div className="header">Looking for lyrics containing any of:</div>
      <div className="terms d-flex">
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
    <div className="rhyming-terms d-flex">
      <div className="header">Looking for rhyming words for:</div>
      <div className="waiting-terms">
        {job.input.primary.map((term) => (
          <div className="waiting-term primary-term" key={`wp-${term}`}>
            {term}
          </div>
        ))}
        {job.input.secondary.map((term) => (
          <div className="waiting-term secondary-term" key={`ws-${term}`}>
            {term}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RhymingTerms;
