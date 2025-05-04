# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MovieMap displays filming locations of famous movies/TV shows on an interactive map. Users can explore the map, view filming locations, and see details including trailers and IMDb links.

### Tech Stack
- **Frontend**: React with Vite, Mapbox GL JS
- **Backend**: Node.js, Express
- **Database**: SQLite (previously was PostgreSQL with PostGIS)
- **Authentication**: Firebase Auth for moderator access

## Project Structure
- `/moviemap` - Frontend React application
  - `/src/components` - Reusable React components
  - `/src/pages` - Page-level components
  - `/src/utils` - Helper functions and API utilities
  - `/src/styles` - CSS files including theme variables
- `/server` - Backend Express API
  - `/config` - Configuration files
  - `/db` - Database connection and utilities
  - `/middleware` - Express middleware
  - `/routes` - API route definitions

## Build Commands
### Frontend
- `cd moviemap && npm run dev` - Start Vite dev server
- `cd moviemap && npm run build` - Build for production
- `cd moviemap && npm run lint` - Run ESLint on project files

### Backend
- `cd server && npm start` - Start Express server
- `cd server && npm run dev` - Start server with nodemon for development

## API Endpoints
- `GET /api/locations` - Get all approved filming locations
- `POST /api/submit-location` - Submit a new location for moderation
- `GET /api/admin/submissions` - Get pending submissions (requires auth)
- `PUT /api/admin/moderate/:id` - Approve/reject submission (requires auth)

## Environment Variables
### Frontend (.env in /moviemap)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)
- `VITE_MAPBOX_TOKEN` - Mapbox GL JS access token
- `VITE_FIREBASE_*` - Firebase configuration variables

### Backend (.env in /server)
- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database file path
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON

## Design Guidelines
- Use the Alamo Drafthouse-inspired color palette:
  - Primary (red): #b11f29
  - Secondary (black): #1a1a1a
  - Accent (gold): #f5c518
- Use CSS variables defined in `/moviemap/src/styles/theme.css`
- Follow mobile-first responsive design approach
- Use Montserrat for headings and Open Sans for body text

## Code Style Guidelines
- Follow React functional component patterns with hooks
- Use camelCase for variables/functions, PascalCase for components/classes
- Error handling: Use try/catch blocks with specific error messages
- Frontend naming convention: component props use camelCase (trailerUrl, imdbLink)
- Backend naming convention: database fields use snake_case (trailer_url, imdb_link)
- API responses should convert between these conventions automatically
- Database: Use parameterized queries to prevent SQL injection
- Security: Never commit API keys or secrets (.env files are gitignored)

## Authentication
- Firebase is used for moderator authentication
- In development, use the test token "test-token-moderator"
- Admin routes require a valid Firebase ID token in the Authorization header