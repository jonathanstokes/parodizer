import { Request, Response, NextFunction } from 'express';
import { LyricListService } from '../service/LyricListService';
import split from 'split-string';
import {
  SearchErrorResponse,
  SearchJobStatusResponse,
  SearchSuccessResponse,
} from '../../src/client-and-server/search-types';
import { Job, SearchTerms } from '../../src/client-and-server/lyric-list-service-types';

const rapidApiKey = process.env.RAPID_API_KEY;
const musixMatchApiKey = process.env.MUSIXMATCH_API_KEY;
if (!rapidApiKey) throw new Error(`A RAPID_API_KEY environment variable is required.`);
if (!musixMatchApiKey) throw new Error(`A MUSIXMATCH_API_KEY environment variable is required.`);
const lyricListService = new LyricListService({ rapidApiKey, musixMatchApiKey });

export const parseSearchTerms = (inputString: string): SearchTerms => {
  if (inputString && inputString.trim()) {
    const tokens: string[] = split(inputString, { quotes: ['"'], separator: ' ' });
    if (tokens.length > 0) {
      const primary = tokens.splice(0, 1);
      if (primary[0].startsWith('"') && primary[0].endsWith('"'))
        primary[0] = primary[0].substring(1, primary[0].length - 1);
      const secondary = tokens.filter((t) => {
        if (t.startsWith('"') && t.endsWith('"')) {
          primary.push(t.substring(1, t.length - 1));
          return false;
        }
        return true;
      });
      return { primary, secondary };
    } else throw new Error(`Parsable input text is required.`);
  } else throw new Error(`Input text is required.`);
};

/** `/search?q=___` route. */
export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerms: string = req.body.q || '';
    const inputTerms = parseSearchTerms(searchTerms);
    try {
      const job = await lyricListService.startJob(inputTerms.primary, inputTerms.secondary);

      const checkJobPath = `/api/search/job/${job.id}`;
      res.setHeader('Location', checkJobPath);
      res.status(202);
      res.send({
        success: true,
        statusUrl: checkJobPath,
        job: { ...job, status: 'started' } as Job,
      } as SearchSuccessResponse);
    } catch (err) {
      console.error(`Could not find lyrics:`, err);
      res.status(500).send({ success: false, message: err.message } as SearchErrorResponse);
    }
  } catch (err) {
    console.error(`Could not parse search input:`, err);
    res.status(400).send({ success: false, message: err.message } as SearchErrorResponse);
  }
};

/** `/search/job/:jobId:` route. */
export const checkJob = async (req: Request, res: Response, next: NextFunction) => {
  const jobId = req.params.jobId;
  const job = await lyricListService.getJob(jobId);
  if (job) res.send({ success: true, job } as SearchJobStatusResponse);
  else res.status(404).send({ success: false, message: `No search job ${jobId} found.` } as SearchErrorResponse);
};
