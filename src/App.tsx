import React, {useState} from 'react';
import axios from 'axios';
import {Button} from 'react-bootstrap';

import logo from './logo.svg';
import './App.css';
import SearchInputField from "./component/search/SearchInputField";
import {Job} from "./client-and-server/lyric-list-service-types";

function App() {
  const [searchTerms, setSearchTerms] = useState<string>('');
  const onSearch = async (query: string) => {
    const result = await axios.post<Job>(`/api/search`, {q: query});
    if (result.status === 202) {
      const job = result.data;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        Parodizer
        {/*<img src={logo} className="App-logo" alt="logo" />*/}
      </header>
      <p>
        Enter a word or words to rhyme in a popular song:
      </p>
      <SearchInputField onSearch={onSearch} value={searchTerms} onChange={event => setSearchTerms(event.target.value)}/>
      <Button variant="primary" onClick={() => onSearch(searchTerms)}>Start Looking</Button>
    </div>
  );
}

export default App;
