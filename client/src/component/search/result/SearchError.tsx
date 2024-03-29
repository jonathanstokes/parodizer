import React from "react";

import { Job } from "../../../client-and-server/lyric-list-service-types";

import "../../../style/component/search/result/SearchError.scss";

const SearchError = (props: { job: Job }) => {
  const { job } = props;
  if (!job.error) return null;
  return (
    <div className="search-error">
      {job.error.message || JSON.stringify(job.error)}
    </div>
  );
};

export default SearchError;
