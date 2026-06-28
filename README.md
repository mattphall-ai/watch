# Watch

A mobile-friendly web app for searching films and TV shows, seeing where to stream them, and tracking a personal watch list.

## Features

- Search for movies or TV shows (separate tabs for each)
- See streaming availability (via TMDB watch providers, US region) and a TMDB score for each title
- Add titles to a watch list stored in the browser (localStorage)
- Check off titles as watched

## Setup

1. Get a free TMDB API key: https://www.themoviedb.org/settings/api
2. Copy `.env.example` to `.env` and set `VITE_TMDB_API_KEY`
3. `npm install`
4. `npm run dev`

## Note on scores

TMDB's free API does not expose real Rotten Tomatoes scores, so the app shows TMDB's own user-rating score instead (labeled "TMDB score"). To show actual Rotten Tomatoes scores, an OMDb API key (or another RT-licensed source) would need to be integrated.
