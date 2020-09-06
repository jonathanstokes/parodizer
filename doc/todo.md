# Todo
- Update broken server unit tests that isn't anticipating extra rel_rhy query.
- ~Swap out rhyming service for the one behind Rhyme Zone, which is so much awesomer.~
- ~Try passing genre codes to improve current lyric service.~
- Look for a better lyric search service.
- Add trace logging to a bunch of stuff, because we'll probably want that anyway, and then use it to see roughly where all the time is being spent in the integration test. 5 minutes is just so long if no network I/O is being done, so something is wrong.
- Set up a caching layer.
  - ~Separate client code into a client/ directory~
  - ~Correct node_modules for client and server.~
  - Create Dockerfile images for client/ and server/.
  - Create a docker-compose.yml for both images.
  - Add a Redis image to the mix.
- Look into creating our own ElasticSearch index. There are 27,467 unique songs in the range, but many of them get
discounted based on date range and popularity. We _could_ do this part in advance, and not even index the others. Or, we
could index them all and tag the ones in certain date range brackets, e.g. A-1, A-2, A-3, etc. A whole lot of ingestion
and set up work, but with a much more customizable result in the end.
- Learn how to profile nodejs server code to find out why things take so long.
- All words aren't being associated with song matches properly. E.g. "Fast Car" shows up in a search for "blast far", but "fast" is not listed as a matching word and neither is "car". Only "bar" is. 
- Make the rhyming words collapsed when there are too many of them.
- Investigate performance issues.
- ~Create an original logo.~
- ~Bug: UI flashes 'none found' message before showing loading indicator when searching.~
- Have the job status include some percentage complete, especially based on the rhyming words being searched through.
- When opening a lyric page, highlight the matching words. (`#:~:text=`)
- button to open the top youtube search result. 
- Integrate with a better rhyming service.
- Create a real logo.
- Get matches within lyrics working server-side.
- Render matches within lyrics.
- for `save`: `Filtered out 'Addicted to Love' by 'Robert Palmer' because no billboard match could be found.` This is listed as `Addicted To Love`, so with only that case difference it should be found.

# Watchlist

# Done
- ~Remove duplicate songs from search results.~
- ~Convert rating/scores into an object that can return its number but display the history of how it got there, for better tweaking of results.~
- ~Write integration tests to debug rating issues.~
- Edited week `1976-07-10` so that its previous week was `1976-07-04`. It should be `1976-07-03`, but the data for that week was wrong in Billboard.
- Edited `1976-07-04` in `./data/billboard-hot-100.json` to make the previous week `1976-06-26` instead of `1976-06-27`. 
- Edited `1961-12-30`, which should have been correct, to `1961-12-25`, which worked.
- ~Integrate with a better lyric service.~


--- 

