# Firebase & Netlify Functions Setup Guide

This guide will help you properly configure the Firebase connection for your MovieMaps application on Netlify.

## Key Changes Made

1. **No More Fallbacks in Production**: The main application now directly uses Firestore and will show proper errors instead of silently falling back to sample data.
2. **Better Error Handling**: Clear error messages are now displayed if Firebase connection fails.
3. **Debug Tools**: A new `/test` page tests all API endpoints and provides detailed diagnostics.
4. **Standalone Functions**: New Netlify functions were added that don't rely on complex imports.

## Firebase Service Account Setup

For the Firestore connection to work, you must correctly set up your Firebase service account:

### 1. Get Firebase Service Account JSON

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file securely

### 2. Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add a new variable named `FIREBASE_SERVICE_ACCOUNT_JSON`
4. Paste the **ENTIRE** content of your service account JSON as the value
5. Make sure all quotes, braces and formatting are preserved exactly
6. Save the environment variable

### 3. Deploy Your Application

1. Commit all changes to your repository
2. Deploy to Netlify (either automatically or manually)
3. Wait for the build to complete

### 4. Testing & Debugging

After deployment, use these tools to verify your configuration:

#### Test Page
Visit `/test` on your site to see a comprehensive test of all API endpoints. This page will show:
- Which endpoints are working
- How many locations each endpoint returns
- Detailed error information if something is wrong

#### Netlify Function Logs
1. Go to your Netlify dashboard
2. Navigate to Functions > View logs
3. Look for logs from `locations-debug` function
4. Check for any error messages about Firebase connection issues

#### Direct Endpoint Testing
You can directly test these endpoints in your browser:
- `https://moviemaps.net/.netlify/functions/locations-debug` - Detailed Firebase connection info
- `https://moviemaps.net/.netlify/functions/sample-locations` - Test endpoint with 10 sample locations

## Common Issues & Solutions

If you're experiencing issues with the Firebase connection:

1. **Service Account JSON Format**: Ensure the entire JSON is pasted correctly with no formatting issues
2. **Firestore Database Exists**: Verify that you have created a Firestore database in your Firebase project
3. **Firestore Rules**: Check that your Firestore security rules allow reads from the Netlify function
4. **Collection Exists**: Ensure you have a `locations` collection in your Firestore database
5. **Service Account Permissions**: Verify the service account has at least read access to Firestore

## Manual Fallback Option

If needed, you can temporarily use the sample locations by setting:
- `VITE_FUNCTION_URL=https://moviemaps.net/.netlify/functions/sample-locations` in Netlify environment variables

However, this is only recommended while debugging, as the real solution is to fix the Firebase connection.