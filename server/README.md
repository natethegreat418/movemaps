# MovieMap Server

Express backend for the MovieMap application, providing APIs for film location data.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file based on the example
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` to point to your service account file

3. Firebase Setup:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firebase Authentication with your preferred providers
   - Enable Firestore Database in Native mode
   - Generate a service account key from Project Settings > Service accounts
   - Save the JSON file as `service-account.json` in the project root
   - Or set the JSON as an environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`

4. Add locations to Firestore:
   ```
   node scripts/add-locations.js
   ```
   
   Options:
   - `--overwrite`: Clear existing locations before adding new ones
   - `--force`: Add locations without checking for duplicates

5. Start the server:
   ```
   npm start
   ```

   Or for development with auto-reload:
   ```
   npm run dev
   ```

6. Test the setup:
   ```
   npm test
   ```
   
   Or test just the locations:
   ```
   node scripts/test-locations.js
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

In development mode without a service account, you can use the test token: `test-token-moderator`

## Database

The server uses Firebase Firestore for data storage in all environments. During development without a service account, the system creates a mock database adapter that allows for testing.

### Data Model

The Firestore database uses the following collections:

- `locations` - Approved filming locations
- `submissions` - User-submitted locations pending moderation
- `moderators` - Authorized moderator UIDs

See `FIRESTORE_SETUP.md` for detailed information about the data model and setup.

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON file
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Firebase service account JSON as string