/**
 * Script to add filming locations to Firestore
 * 
 * This script adds a set of filming locations to your Firestore database.
 * Run this once to populate your production database with initial data.
 */

// Set NODE_ENV to production to use the real Firestore
process.env.NODE_ENV = 'production';

// Import the Firestore database module
const db = require('../db');

// Import the Firebase admin SDK to access Firestore directly if needed
const { admin } = require('../config/firebase');

// Import sample locations from shared data module
const { sampleLocations: locationsData } = require('../data/sampleLocations');

/**
 * Add locations to Firestore
 */
async function addLocationsToFirestore() {
  console.log(`Adding ${locationsData.length} locations to Firestore...`);
  
  try {
    // Check if locations already exist
    const existingLocations = await db.getLocations();
    
    if (existingLocations.rowCount > 0) {
      console.log(`Found ${existingLocations.rowCount} existing locations.`);
      const overwrite = process.argv.includes('--overwrite');
      
      if (!overwrite) {
        console.log('Locations already exist in the database.');
        console.log('To overwrite, run with: node add-locations.js --overwrite');
        console.log('To add without checking for duplicates, run with: node add-locations.js --force');
        process.exit(0);
      } else {
        console.log('--overwrite flag detected. Clearing existing locations...');
        
        // Get a reference to the Firestore collection
        const locationsRef = admin.firestore().collection('locations');
        
        // Delete all existing locations
        const snapshot = await locationsRef.get();
        
        // Use batched writes for better performance
        const batchSize = 500;
        let batch = admin.firestore().batch();
        let count = 0;
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          count++;
          
          if (count >= batchSize) {
            // Commit the batch
            batch.commit();
            // Create a new batch
            batch = admin.firestore().batch();
            count = 0;
          }
        });
        
        // Commit any remaining deletes
        if (count > 0) {
          await batch.commit();
        }
        
        console.log('Existing locations cleared.');
      }
    }
    
    // Add all locations - even if we're not overwriting, this will add any new ones
    const forceAdd = process.argv.includes('--force');
    
    // Use batched writes for better performance
    const batchSize = 500;
    let batch = admin.firestore().batch();
    let count = 0;
    
    for (const location of locationsData) {
      const docRef = admin.firestore().collection('locations').doc();
      batch.set(docRef, location);
      count++;
      
      if (count >= batchSize) {
        await batch.commit();
        console.log(`Committed batch of ${count} locations`);
        batch = admin.firestore().batch();
        count = 0;
      }
    }
    
    // Commit any remaining adds
    if (count > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${count} locations`);
    }
    
    console.log('Locations added successfully!');
    
    // Verify the locations were added
    const updatedLocations = await db.getLocations();
    console.log(`Now there are ${updatedLocations.rowCount} locations in the database.`);
    
  } catch (error) {
    console.error('Error adding locations:', error);
  } finally {
    // Close the connection
    await db.close();
    process.exit(0);
  }
}

// Run the function
addLocationsToFirestore();