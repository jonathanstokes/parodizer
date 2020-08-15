import React from 'react';

import { Job } from '../../client-and-server/lyric-list-service-types';
import SearchError from './result/SearchError';
import RhymingTerms from './result/RhymingTerms';
import MatchedSongs from './result/MatchedSongs';

import '../../style/component/search/SearchResults.scss';

interface SearchResultsProps {
  job: Job;
}

const SearchResults = (props: SearchResultsProps) => {
  const { job } = props;
  return (
    <div className="search-results">
      {/*<JobProgressIndicator job={job} />*/}
      <SearchError job={job} />
      <RhymingTerms job={job} />
      <MatchedSongs job={job} />
    </div>
  );
};

export default SearchResults;
