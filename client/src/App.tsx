import React, { useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import SearchInputField from "./component/search/SearchInputField";
import { Job } from "./client-and-server/lyric-list-service-types";
import {
  SearchJobStatusResponse,
  SearchSuccessResponse,
} from "./client-and-server/search-types";
import SearchResults from "./component/search/SearchResults";

// import logo from './logo.svg';
import logo from "./logo.png";
import "./style/App.scss";

function App() {
  const [previousSearchTerms, setPreviousSearchTerms] = useState<string>("");
  const [searchTerms, setSearchTerms] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const pollForJobProgress = (statusUrl: string, delayInMs: number) => {
    const markJobAsErrored = (err: Error | string) => {
      if (currentJob)
        setCurrentJob({ ...currentJob, status: "error", error: err });
      setIsSearching(false);
    };
    setTimeout(async () => {
      try {
        const result = await axios.get<SearchJobStatusResponse>(statusUrl, {
          timeout: 10000,
        });
        if (result.status === 200) {
          const newJob = result.data.job;
          setCurrentJob(newJob);
          if (newJob.status === "started" || newJob.status === "running") {
            pollForJobProgress(statusUrl, delayInMs * 1.2);
          } else {
            // The job has completed.
            setIsSearching(false);
          }
        } else {
          const message = `Unexpected response ${result.statusText} (${result.status}) when checking status of ${statusUrl}.`;
          console.error(message);
          markJobAsErrored(message);
        }
      } catch (err) {
        console.error(`Error retrieving job status from ${statusUrl}:`, err);
        markJobAsErrored(err);
      }
    }, delayInMs);
  };

  const onSearch = async (query: string) => {
    const result = await axios.post<SearchSuccessResponse>(`/api/search`, {
      q: query,
    });
    if (result.status === 202) {
      setIsSearching(true);
      setPreviousSearchTerms(searchTerms);
      setCurrentJob(result.data.job);
      pollForJobProgress(result.data.statusUrl, 1000);
    }
  };

  return (
    <div className="parodizer-app">
      <header className="app-header d-flex flex-row">
        Parodizer
        <img src={logo} className="logo" alt="logo" />
      </header>
      <div className="input-section d-flex flex-column align-items-center">
        <div>Enter a word or words to rhyme in a popular song:</div>
        <div className="field-container d-flex flex-wrap justify-content-center">
          <SearchInputField
            onSearch={onSearch}
            value={searchTerms}
            onChange={(event) => setSearchTerms(event.target.value)}
            disabled={isSearching}
          />
          <Button
            className="search-button"
            variant="primary"
            size="sm"
            onClick={() => onSearch(searchTerms)}
            disabled={isSearching || previousSearchTerms === searchTerms}
          >
            {isSearching ? (
              <span>
                <Spinner animation="border" /> Finding…
              </span>
            ) : (
              "Find parody songs"
            )}
          </Button>
        </div>
      </div>
      <div className="output-section">
        {currentJob && <SearchResults job={currentJob} />}
      </div>
    </div>
  );
}

export default App;
