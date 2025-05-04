# MovieMap

An interactive map that displays filming locations of famous movies and TV shows. Click a pin to see movie data, cast, and a clip.

## Project Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env` file and add your Mapbox token
   - `VITE_MAPBOX_TOKEN=your_mapbox_token_here`

3. Start development server:
   ```
   npm run dev
   ```

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/utils/` - Helper functions and API calls

## Features

- Interactive map showing filming locations
- Click pins to see movie details
- Submit new locations for moderation
- Admin interface for moderators

## Tech Stack

- Frontend: React + Vite
- Map: Mapbox GL JS
- Backend: Node.js + Express
- Database: PostgreSQL + PostGIS
- Auth: Firebase Auth (for moderator access)
