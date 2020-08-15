import { Job } from "./lyric-list-service-types";

export interface SearchResponse {
  success: boolean;
}

export interface SearchErrorResponse extends SearchResponse {
  message: string;
}

export interface SearchSuccessResponse extends SearchResponse {
  statusUrl: string;
  job: Job;
}

export interface SearchJobStatusResponse {
  success: boolean;
  job: Job;
}
