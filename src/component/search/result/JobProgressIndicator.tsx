import React from 'react';
import { Spinner } from 'react-bootstrap';

import { Job } from '../../../client-and-server/lyric-list-service-types';

import '../../../style/component/search/result/JobProgressIndicator.scss';

const JobProgressIndicator = (props: { job: Job }) => {
  const { job } = props;
  const isRunning = job.status === 'running' || job.status === 'started';
  return <div className="job-progress-indicator">{isRunning && <Spinner animation="border" />}</div>;
};

export default JobProgressIndicator;
