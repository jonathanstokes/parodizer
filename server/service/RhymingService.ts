import axios from 'axios';


export class RhymingService {

    async fetchRhymingWords(word: string): Promise<string[]> {
        const results = await axios.get<RaRhymeResult>(`https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(word)}/rhymes`, {
            headers: {
                'content-type': 'application/octet-stream',
                'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
                'x-rapidapi-key': '59cb9c173fmsh8de1aa962db5e76p1f75dfjsn98465ed6ac90',
                'useQueryString': true
            }
        });
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
    }

    word: string;
}
