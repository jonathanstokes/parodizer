import {RhymingService} from "../RhymingService";
import axios from "axios";


export class DataMuseRhymingService implements RhymingService {

  async fetchRhymingWords(word: string): Promise<string[]> {
    const rhymesResult = await axios.get<DataMuseRhymeResults>(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}`);
    const approximateRhymesResult = await axios.get<DataMuseRhymeResults>(`https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}`);
    const rhymes = rhymesResult.data.map(r => r.word);
    const approximateRhymes = approximateRhymesResult.data.map(r => r.word);
    const output: string[] = [...rhymes];
    for (const approxRhyme of approximateRhymes) {
      if (output.indexOf(approxRhyme) < 0) output.push(approxRhyme);
    }
    return output;
  }
}

interface DataMuseRhymeResult {
  word: string;
  score: number;
  numSyllables: number;
}

interface DataMuseRhymeResults  extends Array<DataMuseRhymeResult> {}
