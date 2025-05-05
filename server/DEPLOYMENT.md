# MovieMap Deployment Guide

This guide explains how to deploy the MovieMap application to production using Netlify and Firestore.

## Production Setup Steps

### 1. Firebase Setup

#### Create/Configure Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your production project
3. Enable Firestore Database in production mode
4. Configure security rules as specified in FIRESTORE_SETUP.md

#### Generate Production Service Account
1. In Firebase console, go to Project settings > Service accounts
2. Generate a new private key for the Firebase Admin SDK
3. Save this file securely (never commit to version control)

### 2. Server Deployment to Netlify

#### Configure Netlify Environment
1. In Netlify dashboard, go to Site settings > Environment variables
2. Add the following environment variables:
   - `NODE_ENV=production`
   - `PORT=8080` (Netlify may override this)
   - `FIREBASE_SERVICE_ACCOUNT_JSON=<paste the entire JSON string>` (from your service account file)

#### Deploy to Netlify
1. Push your code to GitHub
2. Connect Netlify to your GitHub repository
3. Configure build settings:
   - Build command: `cd server && npm install`
   - Publish directory: `server/public` (or appropriate directory)
   - Deploy the site

### 3. Populate Firestore Database

#### Option 1: Run the add-locations script locally
1. With your service account configured locally:
```bash
cd server
npm run add-locations
```

#### Option 2: Import data via Firebase console
1. Prepare a JSON file with your locations data
2. In Firebase console, go to Firestore Database
3. Click on the "Import/Export" option
4. Upload your data file

### 4. Verify Deployment

1. Test the API endpoints:
```
https://your-netlify-app.netlify.app/api/locations
```

2. Check the logs in Netlify dashboard to ensure proper connection to Firestore

3. Test the moderator authentication with a real Firebase Auth token

## Custom Domain Setup (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify
4. Enable HTTPS

## Monitoring and Maintenance

### Firestore Monitoring
- Monitor your Firestore usage in Firebase console
- Set up billing alerts to avoid unexpected charges

### Netlify Monitoring
- Check build logs and function logs regularly
- Enable notifications for build failures

### Updating Production Data
To update production data in the future:
```bash
cd server
npm run add-locations -- --overwrite
```

## Troubleshooting

### Connection Issues
If the server cannot connect to Firestore:
1. Verify the service account JSON is correctly formatted
2. Check Netlify function logs for specific errors
3. Ensure Firestore is enabled in your Firebase project

### Authentication Issues
If moderator authentication fails:
1. Verify that the Firebase project ID matches your frontend configuration
2. Check that the moderator exists in the moderators collection
3. Validate the JWT token format

### Data Issues
If locations don't appear:
1. Run the test script to verify data exists in Firestore:
```bash
npm run test:locations
```
2. Check Firestore console directly to view collection contents