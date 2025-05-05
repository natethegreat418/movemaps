# MovieMap Project

MovieMap displays filming locations of famous movies/TV shows on an interactive map. Users can explore the map, view filming locations, and see details including trailers and IMDb links.

## Project Structure

- `/moviemap` - Frontend React application
- `/server` - Backend Express API

## Quick Start

The easiest way to start the development environment is with the provided startup script:

```bash
# Make the script executable if needed
chmod +x start-dev.sh

# Run the development environment
./start-dev.sh
```

This script will:
1. Initialize the database with sample data if needed
2. Start the backend server
3. Start the frontend server

## Getting Started (Manual Setup)

### Prerequisites

- Node.js and npm installed
- Mapbox GL JS access token

### Setup and Run Frontend

```bash
cd moviemap
npm install
npm run dev
```

The frontend will run on http://localhost:5173 by default.

### Setup and Run Backend

```bash
cd server
npm install

# Initialize the database with sample data (if first time)
node insert-sample-data.js

# Start the server
npm run dev
```

The backend will run on http://localhost:3000 by default.

## Database Setup

The project uses SQLite for data storage. The database is automatically created and initialized with sample data when you run the backend for the first time.

### Sample Data

Sample data includes:
- 5 approved film locations
- 2 pending submissions
- 1 test moderator account

### Manual Database Operations

If you need to reset or re-initialize the database:

```bash
cd server

# To update the database schema
node migrate-schema.js

# To insert/reset sample data
node insert-sample-data.js
```

## Deployment

### Frontend (Netlify)

The frontend is ready to be deployed to Netlify. See the [Netlify deployment guide](./moviemap/NETLIFY_DEPLOY.md) for detailed instructions.

### Backend

The backend can be deployed to platforms like Render, Heroku, or any Node.js hosting service.

## Environment Variables

### Frontend (.env in /moviemap)

- `VITE_API_URL` - Backend API URL (must include `/api` path, e.g., https://api.moviemaps.net/api)
- `VITE_MAPBOX_TOKEN` - Mapbox GL JS access token
- `VITE_FIREBASE_*` - Firebase configuration variables

### Backend (.env in /server)

- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database file path
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON

## Authentication

For development, you can use the mock Firebase authentication:
- Test token: `test-token-moderator`
- Test moderator UID: `test-moderator`

## License

This project is licensed under the MIT License.