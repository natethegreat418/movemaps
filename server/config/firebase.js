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
        // Use fs.readFileSync instead of require to handle file paths more reliably
        const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountContent);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        
        console.log(`Firebase Admin SDK initialized with service account from: ${serviceAccountPath}`);
        return admin;
      } catch (importError) {
        console.error(`Error with service account from ${serviceAccountPath}:`, importError.message);
        console.log('Falling back to development mock...');
        // Fall through to try other methods or use development mock
      }
    } else {
      console.log(`Service account file not found at: ${serviceAccountPath}`);
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

    // For development environment, prefer the mock over ADC
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping application default credentials in development environment');
      return createMockAdmin();
    }
    
    // Otherwise, try to use Application Default Credentials (for production environments)
    try {
      console.log('Trying to use application default credentials...');
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      
      console.log('Firebase Admin SDK initialized with application default credentials');
      return admin;
    } catch (adcError) {
      console.error('Error initializing with application default credentials:', adcError.message);
      
      // Fall back to mock if available
      if (process.env.NODE_ENV === 'development') {
        return createMockAdmin();
      }
      
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
    
    console.log('Using mock Firebase Admin SDK for development due to initialization error');
    return createMockAdmin();
  }
};

// Create a mock admin instance for development
const createMockAdmin = () => {
  console.log('Using mock Firebase Admin SDK for development');
  console.log('You can use "test-token-moderator" as a valid token');
  
  // Create in-memory document stores with sample data
  const collections = {
    locations: new Map(),
    submissions: new Map(),
    moderators: new Map([['test-moderator', { role: 'moderator' }]])
  };
  
  // Sample location data that matches the add-locations.js script
  const sampleLocations = [
    {
      title: 'The Dark Knight',
      year: 2008,
      type: 'movie',
      lat: 41.8781,
      lng: -87.6298,
      location_name: 'Chicago, Illinois (Lower Wacker Drive)',
      trailer_url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      imdb_link: 'https://www.imdb.com/title/tt0468569/'
    },
    {
      title: 'La La Land',
      year: 2016,
      type: 'movie',
      lat: 34.0675,
      lng: -118.2987,
      location_name: 'Griffith Observatory, Los Angeles',
      trailer_url: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
      imdb_link: 'https://www.imdb.com/title/tt3783958/'
    },
    {
      title: 'Lost in Translation',
      year: 2003,
      type: 'movie',
      lat: 35.6895,
      lng: 139.6917,
      location_name: 'Park Hyatt Tokyo, Shinjuku',
      trailer_url: 'https://www.youtube.com/watch?v=W6iVPCRflQM',
      imdb_link: 'https://www.imdb.com/title/tt0335266/'
    },
    {
      title: 'Game of Thrones',
      year: 2011,
      type: 'tv',
      lat: 42.6507,
      lng: 18.0944,
      location_name: 'Dubrovnik, Croatia (King\'s Landing)',
      trailer_url: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
      imdb_link: 'https://www.imdb.com/title/tt0944947/'
    },
    {
      title: 'Inception',
      year: 2010,
      type: 'movie',
      lat: 43.7800,
      lng: 11.2471,
      location_name: 'Ponte Vecchio, Florence, Italy',
      trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      imdb_link: 'https://www.imdb.com/title/tt1375666/'
    },
    {
      title: 'The Lord of the Rings',
      year: 2001,
      type: 'movie',
      lat: -41.1579,
      lng: 175.6274,
      location_name: 'Kaitoke Regional Park, New Zealand (Rivendell)',
      trailer_url: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
      imdb_link: 'https://www.imdb.com/title/tt0120737/'
    },
    {
      title: 'Breaking Bad',
      year: 2008,
      type: 'tv',
      lat: 35.1262,
      lng: -106.5369,
      location_name: 'Albuquerque, New Mexico',
      trailer_url: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
      imdb_link: 'https://www.imdb.com/title/tt0903747/'
    }
  ];
  
  // Populate sample locations in the mock database
  sampleLocations.forEach((location, index) => {
    collections.locations.set(`sample-location-${index+1}`, location);
  });
  
  // Create a document reference
  const createDocRef = (collection, id) => {
    return {
      id,
      collection,
      get: () => {
        const data = collections[collection].get(id);
        return Promise.resolve({
          exists: !!data,
          id,
          data: () => data,
          ref: { id }
        });
      },
      set: (data) => {
        collections[collection].set(id, data);
        return Promise.resolve();
      },
      update: (data) => {
        const existing = collections[collection].get(id) || {};
        collections[collection].set(id, { ...existing, ...data });
        return Promise.resolve();
      },
      delete: () => {
        collections[collection].delete(id);
        return Promise.resolve();
      }
    };
  };
  
  // Create a collection reference
  const createCollectionRef = (name) => {
    return {
      doc: (id = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`) => 
        createDocRef(name, id),
      add: (data) => {
        const id = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        collections[name].set(id, data);
        return Promise.resolve({ id });
      },
      where: (field, operator, value) => {
        return {
          get: () => {
            // Filter the collection based on the condition
            const filtered = [...collections[name].entries()].filter(([_, data]) => {
              if (!data) return false;
              
              switch (operator) {
                case '==': return data[field] === value;
                case '!=': return data[field] !== value;
                case '>': return data[field] > value;
                case '>=': return data[field] >= value;
                case '<': return data[field] < value;
                case '<=': return data[field] <= value;
                default: return false;
              }
            });
            
            return Promise.resolve({
              docs: filtered.map(([id, data]) => ({
                id,
                exists: true,
                data: () => data,
                ref: { id }
              })),
              size: filtered.length
            });
          }
        };
      },
      get: () => Promise.resolve({
        docs: [...collections[name].entries()].map(([id, data]) => ({
          id,
          exists: true,
          data: () => data,
          ref: { id }
        })),
        size: collections[name].size
      })
    };
  };
  
  // Create a batch
  const createBatch = () => {
    const operations = [];
    const batch = {
      set: (docRef, data) => {
        operations.push(() => docRef.set(data));
        return batch;
      },
      update: (docRef, data) => {
        operations.push(() => docRef.update(data));
        return batch;
      },
      delete: (docRef) => {
        operations.push(() => docRef.delete());
        return batch;
      },
      commit: () => {
        return Promise.all(operations.map(op => op()));
      }
    };
    return batch;
  };
  
  return {
    auth: () => ({
      verifyIdToken: (token) => {
        if (token === 'test-token-moderator') {
          return Promise.resolve({ uid: 'test-moderator', role: 'moderator' });
        }
        return Promise.reject(new Error('Invalid token'));
      }
    }),
    firestore: () => ({
      collection: (name) => createCollectionRef(name),
      batch: () => createBatch()
    })
  };
};

// Export the initialized admin SDK
module.exports = {
  admin: initializeFirebaseAdmin(),
  
  // Also export the function for direct use
  initializeFirebaseAdmin
};