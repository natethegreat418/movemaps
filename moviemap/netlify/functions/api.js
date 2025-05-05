const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
let firebaseApp;

// Setup Firebase Admin
const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Check for Firebase service account in environment variables
  let serviceAccount;
  
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      console.warn('No Firebase service account found in environment variables');
      return null;
    }
    
    firebaseApp = initializeApp({
      credential: cert(serviceAccount)
    });
    
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

// Get all locations from Firestore
const getLocations = async () => {
  try {
    const app = initializeFirebase();
    if (!app) {
      throw new Error('Firebase not initialized');
    }
    
    console.log('Firebase initialized successfully');
    
    const db = getFirestore();
    const locationsRef = db.collection('locations');
    
    // Get all locations without filtering by approval status
    const snapshot = await locationsRef.get();
    
    if (snapshot.empty) {
      console.log('No locations found in the database');
      return [];
    }
    
    console.log('Found locations in Firestore:', snapshot.size);
    
    const locations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings if needed
      if (data.created_at && typeof data.created_at.toDate === 'function') {
        data.created_at = data.created_at.toDate().toISOString();
      }
      
      locations.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Returning', locations.length, 'locations');
    return locations;
  } catch (error) {
    console.error('Error getting locations:', error);
    throw error;
  }
};

// Main handler
exports.handler = async (event, context) => {
  // Enable CORS for all requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  
  // Handle OPTIONS requests (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  // Handle GET/locations endpoint
  if (event.httpMethod === 'GET' && event.path.includes('/locations')) {
    try {
      const locations = await getLocations();
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locations })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
  // Handle other endpoints
  return {
    statusCode: 404,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ error: 'Not found' })
  };
};