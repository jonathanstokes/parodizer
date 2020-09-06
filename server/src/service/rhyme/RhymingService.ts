export interface RhymingService {
  fetchRhymingWords(word: string): Promise<string[]>;
}
