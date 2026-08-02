# Nflix Frontend

This is the Next.js frontend for the Nflix catalog application, a movie and TV discovery catalog.

## Configuration

Local development uses environment files:

Copy `frontend/.env.example` to `frontend/.env.local`. Set `NEXT_PUBLIC_API_URL` to the browser-reachable API URL.

Never place TMDB credentials in `frontend/.env.local` or prefix them with `NEXT_PUBLIC_`: all such values are included in the browser bundle.

## Deployment

Deploy the frontend and backend as separate services.

- Frontend: set only `NEXT_PUBLIC_API_URL=https://your-api.example/api` in the frontend build environment, then run `npm run build` and `npm run start`.

`NEXT_PUBLIC_API_URL` is evaluated at build time, so rebuild the frontend whenever the API URL changes. Do not rely on a root `.env`: the backend and Next.js frontend load their own environment scopes.

## Playback

Metadata and playback are separate. Set `NEXT_PUBLIC_LICENSED_PLAYBACK_ORIGIN` only if you operate or are licensed to use that HTTPS media origin. The UI does not send users through third-party embed services.
