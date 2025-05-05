/**
 * Firestore Database Module for MovieMap
 * 
 * This module provides a Firestore implementation of the database
 * interface used by the MovieMap application. It handles connections
 * to Firestore and provides methods for interacting with the data.
 */
const { admin } = require('../config/firebase');

// Initialize Firestore
const db = admin.firestore();

// Collection references
const locationsCollection = db.collection('locations');
const submissionsCollection = db.collection('submissions');
const moderatorsCollection = db.collection('moderators');

/**
 * Convert Firestore document to application model
 * This adds the document ID as 'id' and converts any timestamp fields
 */
const docToModel = (doc) => {
  if (!doc || !doc.exists) return null;
  
  const data = doc.data();
  
  // Convert all timestamp fields to JS dates
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate();
    }
  });
  
  return { id: doc.id, ...data };
};

/**
 * Prepare a model for storage in Firestore
 * Converts fields as needed for Firestore compatibility
 */
const prepareForFirestore = (data) => {
  // Create a copy to avoid modifying the original
  const firestoreData = { ...data };
  
  // Remove id field if present (Firestore uses document ID)
  if (firestoreData.id) {
    delete firestoreData.id;
  }
  
  return firestoreData;
};

/**
 * Database interface methods
 */
const firestoreDb = {
  /**
   * Get all locations
   */
  async getLocations() {
    try {
      const snapshot = await locationsCollection.get();
      return {
        rows: snapshot.docs.map(docToModel),
        rowCount: snapshot.size
      };
    } catch (error) {
      console.error('Error getting locations from Firestore:', error);
      return { rows: [], rowCount: 0, error: error.message };
    }
  },
  
  /**
   * Get a single location by ID
   */
  async getLocationById(id) {
    try {
      const doc = await locationsCollection.doc(id).get();
      return {
        rows: doc.exists ? [docToModel(doc)] : [],
        rowCount: doc.exists ? 1 : 0
      };
    } catch (error) {
      console.error(`Error getting location ${id} from Firestore:`, error);
      return { rows: [], rowCount: 0, error: error.message };
    }
  },
  
  /**
   * Add a new location
   */
  async addLocation(locationData) {
    try {
      const data = prepareForFirestore(locationData);
      const docRef = await locationsCollection.add(data);
      return {
        rows: [{ id: docRef.id, ...data }],
        rowCount: 1,
        changes: 1
      };
    } catch (error) {
      console.error('Error adding location to Firestore:', error);
      return { rows: [], rowCount: 0, changes: 0, error: error.message };
    }
  },
  
  /**
   * Get all submissions with optional status filter
   */
  async getSubmissions(status = null) {
    try {
      let query = submissionsCollection;
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      const snapshot = await query.get();
      return {
        rows: snapshot.docs.map(docToModel),
        rowCount: snapshot.size
      };
    } catch (error) {
      console.error('Error getting submissions from Firestore:', error);
      return { rows: [], rowCount: 0, error: error.message };
    }
  },
  
  /**
   * Add a new submission
   */
  async addSubmission(submissionData) {
    try {
      // Ensure submission has a status field
      const data = prepareForFirestore({
        ...submissionData,
        status: submissionData.status || 'pending'
      });
      
      const docRef = await submissionsCollection.add(data);
      return {
        rows: [{ id: docRef.id, ...data }],
        rowCount: 1,
        changes: 1
      };
    } catch (error) {
      console.error('Error adding submission to Firestore:', error);
      return { rows: [], rowCount: 0, changes: 0, error: error.message };
    }
  },
  
  /**
   * Update a submission's status
   */
  async updateSubmissionStatus(id, status) {
    try {
      await submissionsCollection.doc(id).update({ status });
      return {
        rowCount: 1,
        changes: 1
      };
    } catch (error) {
      console.error(`Error updating submission ${id} status in Firestore:`, error);
      return { rowCount: 0, changes: 0, error: error.message };
    }
  },
  
  /**
   * Get a submission by ID
   */
  async getSubmissionById(id) {
    try {
      const doc = await submissionsCollection.doc(id).get();
      return {
        rows: doc.exists ? [docToModel(doc)] : [],
        rowCount: doc.exists ? 1 : 0
      };
    } catch (error) {
      console.error(`Error getting submission ${id} from Firestore:`, error);
      return { rows: [], rowCount: 0, error: error.message };
    }
  },
  
  /**
   * Check if a user is a moderator
   */
  async isModerator(uid) {
    try {
      const doc = await moderatorsCollection.doc(uid).get();
      return {
        rows: doc.exists ? [{ uid }] : [],
        rowCount: doc.exists ? 1 : 0
      };
    } catch (error) {
      console.error(`Error checking moderator status for ${uid} in Firestore:`, error);
      return { rows: [], rowCount: 0, error: error.message };
    }
  },
  
  /**
   * Add a moderator
   */
  async addModerator(uid) {
    try {
      await moderatorsCollection.doc(uid).set({ role: 'moderator' });
      return {
        rowCount: 1,
        changes: 1
      };
    } catch (error) {
      console.error(`Error adding moderator ${uid} to Firestore:`, error);
      return { rowCount: 0, changes: 0, error: error.message };
    }
  },
  
  /**
   * Generic query method for compatibility with existing code
   * This is a simplified adapter for basic queries to work with Firestore
   */
  async query(queryString, params = []) {
    // Parse the query to determine what operation to perform
    const queryLower = queryString.toLowerCase().trim();
    
    console.log(`Firestore adapter handling query: ${queryString}`);
    console.log('With parameters:', params);
    
    try {
      // SELECT queries
      if (queryLower.startsWith('select')) {
        // Determine which collection to query based on the query string
        if (queryLower.includes('from locations')) {
          if (queryLower.includes('where id =') && params.length > 0) {
            return await this.getLocationById(params[0]);
          }
          return await this.getLocations();
        }
        
        if (queryLower.includes('from submissions')) {
          if (queryLower.includes('where status =') && params.length > 0) {
            return await this.getSubmissions(params[0]);
          }
          if (queryLower.includes('where id =') && params.length > 0) {
            return await this.getSubmissionById(params[0]);
          }
          return await this.getSubmissions();
        }
        
        if (queryLower.includes('from moderators')) {
          if (queryLower.includes('where uid =') && params.length > 0) {
            return await this.isModerator(params[0]);
          }
          // Getting all moderators is not implemented yet
          return { rows: [], rowCount: 0 };
        }
        
        if (queryLower.includes('count(*)')) {
          // Handle count(*) queries - return a simple count
          if (queryLower.includes('from locations')) {
            const result = await this.getLocations();
            return { rows: [{ count: result.rowCount }], rowCount: 1 };
          }
          if (queryLower.includes('from submissions')) {
            const result = await this.getSubmissions();
            return { rows: [{ count: result.rowCount }], rowCount: 1 };
          }
          if (queryLower.includes('from moderators')) {
            const modResult = await moderatorsCollection.get();
            return { rows: [{ count: modResult.size }], rowCount: 1 };
          }
        }
      }
      
      // INSERT queries
      if (queryLower.startsWith('insert into')) {
        if (queryLower.includes('into locations')) {
          // Extract fields from the query and map to values from params
          const location = {
            title: params[0] || '',
            type: params[1] || '',
            lat: parseFloat(params[2] || 0),
            lng: parseFloat(params[3] || 0),
            trailer_url: params[4] || null,
            imdb_link: params[5] || null,
            year: params[6] ? parseInt(params[6], 10) : null,
            location_name: params[7] || null
          };
          return await this.addLocation(location);
        }
        
        if (queryLower.includes('into submissions')) {
          const submission = {
            title: params[0] || '',
            type: params[1] || '',
            lat: parseFloat(params[2] || 0),
            lng: parseFloat(params[3] || 0),
            trailer_url: params[4] || null,
            imdb_link: params[5] || null,
            year: params[6] ? parseInt(params[6], 10) : null,
            location_name: params[7] || null,
            status: params[8] || 'pending'
          };
          return await this.addSubmission(submission);
        }
        
        if (queryLower.includes('into moderators')) {
          return await this.addModerator(params[0]);
        }
      }
      
      // UPDATE queries
      if (queryLower.startsWith('update')) {
        if (queryLower.includes('update submissions set status =') && params.length >= 2) {
          return await this.updateSubmissionStatus(params[1], params[0]);
        }
      }
      
      // DELETE queries
      if (queryLower.startsWith('delete from')) {
        // Not implemented for this example, but would follow the pattern
        console.log('DELETE operations through query adapter not implemented yet');
        return { rows: [], rowCount: 0, changes: 0 };
      }
      
      // Default fallback
      console.warn('Query not supported by Firestore adapter:', queryString);
      return { rows: [], rowCount: 0, error: 'Query not supported by Firestore adapter' };
    } catch (error) {
      console.error('Error in Firestore query adapter:', error);
      return { rows: [], rowCount: 0, error: error.message };
    }
  },
  
  // Dummy close method for compatibility
  close: () => {
    console.log('Note: Firestore connection does not need to be closed');
    return Promise.resolve();
  }
};

module.exports = firestoreDb;