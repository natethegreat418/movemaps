const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to service account file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, '../service-account.json');

/**
 * Initialize Firebase Admin SDK
 * 
 * This function initializes the Firebase Admin SDK using either:
 * 1. A service account file (if FIREBASE_SERVICE_ACCOUNT_PATH is set)
 * 2. Environment variables (if FIREBASE_SERVICE_ACCOUNT_JSON is set)
 * 3. Default credentials (if running in a Firebase/Google Cloud environment)
 * 4. In development, falls back to a mock for easy testing
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if we're already initialized
    if (admin.apps.length > 0) {
      return admin;
    }

    // If service account JSON is provided as an environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('Firebase Admin SDK initialized with service account from environment variable');
      return admin;
    }

    // If service account file exists, use it
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        
        console.log(`Firebase Admin SDK initialized with service account from: ${serviceAccountPath}`);
        return admin;
      } catch (importError) {
        console.error(`Error importing service account from ${serviceAccountPath}:`, importError);
        // Fall through to try other methods or use development mock
      }
    }

    // Use development mock if in development environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'WARNING: Using mock Firebase Admin SDK in development mode. ' +
        'For full functionality, provide service account credentials.'
      );
      
      // Return minimal mock for development
      return createMockAdmin();
    }

    // Otherwise, try to use Application Default Credentials
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      
      console.log('Firebase Admin SDK initialized with application default credentials');
      return admin;
    } catch (adcError) {
      console.error('Error initializing with application default credentials:', adcError);
      throw new Error('Failed to initialize Firebase Admin SDK. No valid credentials available.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    
    // In development, create a mock Firebase admin with limited functionality
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'WARNING: Using mock Firebase Admin SDK in development. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_PATH environment variable for full functionality.'
      );
      
      return createMockAdmin();
    }
    
    throw error;
  }
};

// Create a mock admin instance for development
const createMockAdmin = () => {
  console.log('Using mock Firebase Admin SDK for development');
  console.log('You can use "test-token-moderator" as a valid token');
  
  return {
    auth: () => ({
      verifyIdToken: (token) => {
        if (token === 'test-token-moderator') {
          return Promise.resolve({ uid: 'test-moderator', role: 'moderator' });
        }
        return Promise.reject(new Error('Invalid token'));
      }
    })
  };
};

// Export the initialized admin SDK
module.exports = {
  admin: initializeFirebaseAdmin(),
  
  // Also export the function for direct use
  initializeFirebaseAdmin
};