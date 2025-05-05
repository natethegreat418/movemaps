# Firebase/Firestore Setup Guide

This guide explains how to set up and use Firebase/Firestore as the database for the MovieMap application in all environments.

## Prerequisites

- A Firebase project with Firestore enabled
- Node.js and npm installed
- MovieMap project code

## Firebase Setup

### 1. Create a Firebase Project (if you haven't already)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the prompts
3. Enable Firestore Database in Native mode

### 2. Get Firebase Service Account Credentials

1. In the Firebase Console, go to Project Settings
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `service-account.json` in your server directory

### 3. Set Environment Variables

Create a `.env` file in your server directory with the following variables:

```
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
```

## Data Model

The Firestore database uses the following collections:

### `locations` Collection

Each document represents a film location:

```
locations/
  {document_id}/
    title: string
    type: string
    lat: number
    lng: number
    trailer_url: string
    imdb_link: string
    year: number
    location_name: string
```

### `submissions` Collection

Each document represents a user-submitted location:

```
submissions/
  {document_id}/
    title: string
    type: string
    lat: number
    lng: number
    trailer_url: string
    imdb_link: string
    year: number
    location_name: string
    status: string (pending/approved/rejected)
```

### `moderators` Collection

Each document represents a moderator user:

```
moderators/
  {uid}/
    role: string
```

## Testing

To test your Firestore integration:

```bash
cd server
node test-firestore.js
```

This will perform basic CRUD operations to verify that your Firestore setup is working correctly.

## Development Mode

For development, the application uses a mock Firebase Admin SDK if no service account is found. This allows you to work on the application without setting up Firebase right away.

### Mock Firebase Features:

1. **Authentication**: You can use the test token "test-token-moderator" for admin routes
   ```
   Authorization: Bearer test-token-moderator
   ```

2. **In-Memory Firestore**: A complete in-memory mock of Firestore that supports:
   - Creating and reading documents
   - Querying with where clauses
   - Batch operations
   - All collections (`locations`, `submissions`, `moderators`)

3. **Automatic Setup**: The mock is automatically used when:
   - `NODE_ENV=development` and
   - No valid service account is found at the path specified by `FIREBASE_SERVICE_ACCOUNT_PATH`

To force using the mock in development:
```bash
# Remove or rename your service-account.json file temporarily, or
export FIREBASE_SERVICE_ACCOUNT_PATH=/non-existent-path.json
npm run dev
```

## Deployment

When deploying to production:

1. Make sure your environment variables are set:
   - `FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json` (or set via deployment platform)

2. If using a platform like Heroku, Render, or Vercel, you can set the environment variables in their dashboard

3. To deploy the service account JSON securely:
   - Either upload the file to your deployment platform
   - Or encode the JSON as an environment variable:
     ```
     FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
     ```

## Security Considerations

1. Always keep your service-account.json file secure and never commit it to version control
2. Set up Firestore security rules in the Firebase Console
3. When deploying, use environment variables to store sensitive information

## Firestore Security Rules

Recommended baseline security rules for Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Locations can be read by anyone, but only written by authenticated moderators
    match /locations/{locationId} {
      allow read: if true;
      allow write: if exists(/databases/$(database)/documents/moderators/$(request.auth.uid));
    }
    
    // Submissions can be read by moderators, written by anyone
    match /submissions/{submissionId} {
      allow read: if exists(/databases/$(database)/documents/moderators/$(request.auth.uid));
      allow create: if true;
      allow update, delete: if exists(/databases/$(database)/documents/moderators/$(request.auth.uid));
    }
    
    // Moderators can only be managed by other moderators
    match /moderators/{userId} {
      allow read: if request.auth != null;
      allow write: if exists(/databases/$(database)/documents/moderators/$(request.auth.uid));
    }
  }
}