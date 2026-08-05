# AIOS-ALL IN ONE STREAM Frontend

This is the Next.js frontend for the AIOS-ALL IN ONE STREAM catalog application, featuring themes for Netflix, Prime Video, and Hotstar!

## 🚀 Recent Updates & Features
- **UI Polish & Perfection:** Resolved 10+ UI alignment issues (including Search dropdown custom scrollbars, Hotstar carousel bounds, and Hero Canvas extraction). 
- **Performance Fixes:** Drastically improved frontend filtering by pre-processing arrays. Implemented RequestAnimationFrame for heavy canvas paint operations.
- **Player Enhancements:** Fixed HLS component memory leaks. Added local storage persistence for preferred video quality and subtitle selections.
- **Feature Addition:** Integrated native IMDb rating badges across all movie detail modals!

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
