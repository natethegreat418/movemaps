// Simple function to check Firebase config
const serverless = require('serverless-http');
const express = require('express');

// Force production mode
process.env.NODE_ENV = 'production';

const app = express();

app.get('/', async (req, res) => {
  try {
    // Import Firebase config
    const { admin } = require('../../server/config/firebase');
    
    // Check if Firestore is accessible
    const db = admin.firestore();
    const locationsCollection = db.collection('locations');
    const snapshot = await locationsCollection.limit(1).get();
    
    // Return the result
    res.json({
      status: 'success',
      firebaseInitialized: admin.apps.length > 0,
      locationsFound: snapshot.size,
      serviceAccountType: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 'JSON string' : 
                          process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? 'JSON file' : 'none',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      }
    });
  }
});

module.exports.handler = serverless(app);