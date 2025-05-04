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

3. Firebase Authentication Setup:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication with your preferred providers
   - Generate a service account key from Project Settings > Service accounts
   - Save the JSON file as `service-account.json` in the project root
   - Or set the JSON as an environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`

4. Start the server:
   ```
   npm start
   ```

   Or for development with auto-reload:
   ```
   npm run dev
   ```

## Endpoints

### Public Endpoints
- `GET /health` - Health check endpoint (returns "OK")
- `GET /db-test` - Database connection test endpoint
- `GET /api/locations` - Get all approved locations
- `POST /api/submit-location` - Submit a new location for moderation

### Protected Admin Endpoints
All admin endpoints require Firebase authentication.

- `GET /api/admin/submissions` - Get all pending submissions for review
- `PUT /api/admin/moderate/:id` - Approve or reject a submission
- `GET /api/admin/profile` - Get current moderator profile

## Authentication

The server uses Firebase Authentication for admin access. To authenticate:

1. Obtain an ID token from Firebase Authentication on the client side
2. Include the token in API requests to protected endpoints:
   ```
   Authorization: Bearer YOUR_ID_TOKEN
   ```

In development mode, you can use the test token: `test-token-moderator`

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
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON file
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Firebase service account JSON as string