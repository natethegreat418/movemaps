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
  
  // Only load sample data in development mode
  if (process.env.NODE_ENV === 'development') {
    // Get sample location data from shared module
    const { sampleLocations } = require('../data/sampleLocations');
    
    // Populate sample locations in the mock database
    sampleLocations.forEach((location, index) => {
      collections.locations.set(`sample-location-${index+1}`, location);
    });
    
    console.log(`Populated ${sampleLocations.length} sample locations in mock Firestore for development`);
  } else {
    console.log('Skipping sample data population in production mode');
  }
  
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