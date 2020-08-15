# Todo
- Set up a caching layer.
  - Separate client code into a client/ directory
  - Correct node_modules for client and server.
  - Create Dockerfile images for client/ and server/.
  - Create a docker-compose.yml for both images.
  - Add a Redis image to the mix.
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


