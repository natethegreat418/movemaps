# MovieMap Server

Express backend for the MovieMap application, providing APIs for film location data.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file based on the example
   - Configure your PostgreSQL connection string in `DATABASE_URL`

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

## Database

The server is configured to connect to a PostgreSQL database with PostGIS extensions for geographic data.

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)