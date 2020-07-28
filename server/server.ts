console.log("1");
import bodyParser from 'body-parser';
import express from 'express';
import {checkJob, search} from './routes/search';

console.log("1");
const app = express();
const port = process.env.PORT || 5500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/search', search);
app.get('/api/search/job/:jobId', checkJob);

app.listen(port, () => console.log(`Listening on port ${port}`));
