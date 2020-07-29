import React from 'react';
import { Job } from '../../../client-and-server/lyric-list-service-types';
import { Spinner } from 'react-bootstrap';

const JobProgressIndicator = (props: { job: Job }) => {
  const { job } = props;
  const isRunning = job.status === 'running' || job.status === 'started';
  return <div className="job-progress-indicator">{isRunning && <Spinner animation="border" />}</div>;
};

export default JobProgressIndicator;
