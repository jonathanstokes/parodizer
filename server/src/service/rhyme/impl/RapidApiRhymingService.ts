import axios from 'axios';
import { RhymingService } from '../RhymingService';

export class RapidApiRhymingService implements RhymingService {
  protected rapidApiKey: string;

  constructor(rapidApiKey: string) {
    this.rapidApiKey = rapidApiKey;
  }

  async fetchRhymingWords(word: string): Promise<string[]> {
    const results = await axios.get<RaRhymeResult>(
      `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(word)}/rhymes`,
      {
        headers: {
          'content-type': 'application/octet-stream',
          'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
          'x-rapidapi-key': this.rapidApiKey,
          useQueryString: true,
        },
      }
    );
    // console.log(`Response from 'https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(word)}/rhymes':`, JSON.stringify(results.data));
    const output: string[] = [];
    if (results.data.rhymes && results.data.rhymes.all) {
      const wordSet = new Set<string>();
      for (const resultPhrase of results.data.rhymes.all) {
        // Only take single words
        if (resultPhrase.indexOf(' ') < 0) wordSet.add(resultPhrase);
      }
      wordSet.forEach(w => output.push(w));
    }
    return output;
  }
}

interface RaRhymeResult {
  rhymes: {
    all: string[];
  };

  word: string;
}
