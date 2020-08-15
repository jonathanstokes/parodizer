console.log('1');
import bodyParser from 'body-parser';
import express from 'express';
import { checkJob, search } from './routes/search';

const app = express();
const port = process.env.PORT || 5500;

try {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/api/search', search);
  app.get('/api/search/job/:jobId', checkJob);

  app.listen(port, () => console.log(`Listening on port ${port}`));
} catch (err) {
  console.log(`Error starting server on port ${port}:`, err);
  process.exit(1);
  throw err;
}
