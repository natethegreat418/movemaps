# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MovieMap displays filming locations of famous movies/TV shows on an interactive map. Users can explore the map, view filming locations, and see details including trailers and IMDb links.

### Tech Stack
- **Frontend**: React with Vite, Mapbox GL JS, React Router
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore (NoSQL cloud database)
- **Authentication**: Firebase Auth for moderator access

## Architecture
- **Database**: Cloud Firestore for all environments
  - Development uses a local in-memory mock with pre-populated sample data
  - Production uses real Firestore with service account authentication
  - Collections: `locations`, `submissions`, `moderators`
- **API Server**: Express.js REST API 
  - Async/await pattern throughout for promise handling
  - Route modularization (public vs. admin routes)
  - Middleware for authentication and moderation checks
- **Frontend**: React SPA with Mapbox integration
  - Component-based architecture
  - React Router (HashRouter) for client-side routing
  - React hooks for state management
  - API utilities with error handling and fallbacks
- **Filtering**: Map supports filtering to toggle between movies and TV shows

## Project Structure
- `/moviemap` - Frontend React application
  - `/src/components` - Reusable React components (Map, Header, LocationModal)
  - `/src/pages` - Page-level components (Home, About, Login)
  - `/src/utils` - Helper functions and API utilities
  - `/src/styles` - CSS files including theme variables
- `/server` - Backend Express API
  - `/config` - Configuration files (Firebase setup)
  - `/db` - Database connection and utilities
    - `index.js` - Main database interface
    - `firestore.js` - Firestore implementation
  - `/middleware` - Express middleware (auth, moderation)
  - `/routes` - API route definitions (public, admin)
  - `/data` - Sample location data for development and imports
- `/scripts` - Utility scripts for database management and data processing
  - `validate-trailers.js` - Validates and fixes YouTube trailer URLs
  - `import-locations.js` - Processes and imports locations to Firestore
  - `update-database.sh` - Convenient shell script to run the validation and import process

## Build Commands
### Frontend
- `cd moviemap && npm run dev` - Start Vite dev server
- `cd moviemap && npm run build` - Build for production
- `cd moviemap && npm run lint` - Run ESLint on project files

### Backend
- `cd server && npm start` - Start Express server
- `cd server && npm run dev` - Start server with nodemon for development

### Scripts
- `cd scripts && node validate-trailers.js` - Validate and fix YouTube trailer URLs
- `cd scripts && node import-locations.js` - Import validated locations to Firestore
- `cd scripts && ./update-database.sh` - Run complete validation and import process

## API Endpoints
- `GET /api/locations` - Get all approved filming locations
- `POST /api/submit-location` - Submit a new location for moderation
- `GET /api/admin/submissions` - Get pending submissions (requires auth)
- `PUT /api/admin/moderate/:id` - Approve/reject submission (requires auth)
- `GET /api/admin/profile` - Get current moderator profile information

## Environment Variables
### Frontend (.env in /moviemap)
- `VITE_API_URL` - Backend API URL (must include `/api` path, e.g., http://localhost:3000/api)
- `VITE_MAPBOX_TOKEN` - Mapbox GL JS access token
- `VITE_FIREBASE_*` - Firebase configuration variables

### Backend (.env in /server)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Firebase service account as JSON string (alternative to file path)

## Database Configuration
- **Firestore**: Used for all environments
- **Development Mode**: 
  - Uses an in-memory mock Firestore when no service account is available
  - Mock is pre-populated with sample locations for consistent development
  - Test moderator automatically created with uid `test-moderator`
- **Production Mode**:
  - Requires Firebase service account for authentication
  - Set `FIREBASE_SERVICE_ACCOUNT_JSON` as environment variable
- **Data Management**:
  - Use scripts from the `/scripts` directory to populate the production database
  - Sample data available in `/server/data/sampleLocations.js`

## Important Implementation Details
- **Async Database Access**: All database operations return Promises and must be used with `await`
- **Error Handling**: Comprehensive try/catch blocks throughout codebase
- **API Structure**: Consistent response format with `{ locations: [...] }` pattern
- **Frontend Fallbacks**: Sample data as fallback for network errors only
- **Authentication Flow**: JWT-based Firebase auth with moderator role check
- **Security**: Environment variables for sensitive data, CORS enabled
- **Development Server**: Vite proxy configuration to handle CORS in development

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
- Security: Never commit API keys or secrets (.env files are gitignored)

## Authentication
- Firebase is used for moderator authentication
- In development with mock Firestore, use the test token "test-token-moderator"
- Admin routes require a valid Firebase ID token in the Authorization header

## Deployment Guidelines
- Frontend is deployed on Netlify
- Backend is deployed on a separate service (details in /server/DEPLOYMENT.md)
- Important settings:
  - NODE_ENV=production
  - FIREBASE_SERVICE_ACCOUNT_JSON must be set as an environment variable
- Routing issues:
  - Frontend uses HashRouter for better static hosting compatibility
  - The _redirects file and netlify.toml are configured to handle SPA routing

## Common Issues and Solutions
- **Missing Locations**: Ensure API URL includes `/api` path segment
- **Authentication Errors**: Use test token in development, verify service account in production
- **Database Connection Issues**: Check service account credentials and permissions
- **Empty API Responses**: Verify that database is populated with locations
- **CORS Errors**: 
  - Ensure frontend is making requests to correct API URL
  - In development, Vite is configured with a proxy to avoid CORS issues

## CSS Architecture
- Main theme variables defined in `theme.css` (Alamo Drafthouse-inspired)
- Component-specific styles in dedicated CSS files
- Responsive design with mobile-first approach
- Use CSS variables for consistency across components

## Recent Implementation Changes
- Added About page with developer information and GitHub repository link
- Added filter functionality to toggle between movies and TV shows on the map
- Expanded location database to 150 entries (75 movies, 75 TV shows)
- Improved trailer URL validation and database import process
- Restructured project by moving scripts to root-level directory
- Added Vite proxy configuration to handle CORS in development
- Switched from BrowserRouter to HashRouter for better static hosting compatibility
- Pre-populated mock Firestore in development for more consistent testing

## Areas for Cleanup
- CSS duplication between App.css and theme.css
- SQL-style query patterns in Firestore implementation
- Complex initialization path in Firebase config
- Console logs in production code

## Next Development Priorities
1. Clean up redundant CSS variables between App.css and theme.css
2. Refactor Firestore implementation to remove SQL-like query patterns
3. Enhance moderator UI for handling submissions
4. Add user favoriting functionality 
5. Improve map UI with clustering for locations
6. Add search functionality for locations