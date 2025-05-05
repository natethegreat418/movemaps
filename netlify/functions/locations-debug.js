// Enhanced debugging function for Firestore connection
exports.handler = async function() {
  try {
    // Force production mode
    process.env.NODE_ENV = 'production';
    
    console.log('Starting locations-debug function');
    console.log('Environment variables check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Has FIREBASE_SERVICE_ACCOUNT_JSON:', !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    
    // Load Firebase Admin directly to avoid path issues
    const admin = require('firebase-admin');
    console.log('Firebase Admin package loaded');
    
    let db;
    
    // Initialize Firebase (only if not already initialized)
    if (admin.apps.length === 0) {
      // Check for service account in env variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          console.log('Parsing service account from environment variable');
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          console.log('Service account parsed successfully, project_id:', serviceAccount.project_id);
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          console.log('Firebase Admin initialized with service account from environment variable');
        } catch (parseError) {
          console.error('Error parsing service account JSON:', parseError.message);
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              error: 'Failed to parse service account JSON',
              details: parseError.message,
              serviceAccountFirstChars: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 
                process.env.FIREBASE_SERVICE_ACCOUNT_JSON.substring(0, 20) + '...' : 'Not available'
            })
          };
        }
      } else {
        console.log('No service account JSON found in environment variables');
        // Try application default credentials if in production
        try {
          admin.initializeApp({
            credential: admin.credential.applicationDefault()
          });
          console.log('Firebase Admin initialized with application default credentials');
        } catch (adcError) {
          console.error('Failed to initialize with application default credentials:', adcError.message);
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              error: 'Failed to initialize Firebase Admin SDK',
              details: adcError.message,
              solution: 'Please configure FIREBASE_SERVICE_ACCOUNT_JSON environment variable'
            })
          };
        }
      }
    } else {
      console.log('Firebase Admin already initialized');
    }
    
    // Get Firestore database
    db = admin.firestore();
    console.log('Firestore database accessed');
    
    // Get all locations
    console.log('Fetching locations collection');
    const locationsCollection = db.collection('locations');
    const snapshot = await locationsCollection.get();
    console.log(`Retrieved ${snapshot.size} locations from Firestore`);
    
    // Process locations
    const locations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        type: data.type,
        lat: data.lat,
        lng: data.lng,
        trailerUrl: data.trailer_url,
        imdbLink: data.imdb_link,
        year: data.year,
        locationName: data.location_name,
        raw: data
      };
    });
    
    // Return success response
    console.log('Successfully prepared response with', locations.length, 'locations');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        count: locations.length,
        locations: locations,
        timestamp: new Date().toISOString(),
        source: 'locations-debug'
      })
    };
  } catch (error) {
    console.error('Error in locations-debug function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        environment: process.env.NODE_ENV,
        hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        source: 'locations-debug'
      })
    };
  }
};