# MovieMap Server

Express backend for the MovieMap application, providing APIs for film location data.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file based on the example
   - Optionally customize the `DB_PATH` to set a different SQLite database location

3. Start the server:
   ```
   npm start
   ```

   Or for development with auto-reload:
   ```
   npm run dev
   ```

## Endpoints

- `GET /health` - Health check endpoint (returns "OK")
- `GET /db-test` - Database connection test endpoint

## Database

The server uses SQLite for data storage. The database file is automatically created in the `data` directory when the server starts.

### Schema

- `locations` - Approved filming locations
- `submissions` - User-submitted locations pending moderation
- `moderators` - Authorized moderator UIDs

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database file path (default: ./data/moviemap.db)
- `NODE_ENV` - Environment (development/production)