/**
 * Improved script to import filming locations to Firestore
 * 
 * This script validates trailer URLs and then adds the locations to Firestore.
 * It includes better validation, error handling, and reporting.
 */

// Set NODE_ENV to production to use the real Firestore
process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');
const { validateTrailers } = require('./validate-trailers');

// Import the Firestore database module
const db = require('../server/db');

// Import the Firebase admin SDK to access Firestore directly
const { admin } = require('../server/config/firebase');

/**
 * Add locations to Firestore
 * @param {Array} locationsData - Array of location objects to add
 * @param {Object} options - Import options
 */
async function importLocationsToFirestore(locationsData, options = {}) {
  const { overwrite = false, batchSize = 500, validateUrls = true } = options;
  
  console.log(`Starting import of ${locationsData.length} locations to Firestore...`);
  console.log(`Options: overwrite=${overwrite}, validateUrls=${validateUrls}`);
  
  try {
    // Check if locations already exist
    const existingLocations = await db.getLocations();
    
    if (existingLocations.rowCount > 0) {
      console.log(`Found ${existingLocations.rowCount} existing locations.`);
      
      if (!overwrite) {
        console.log('Locations already exist in the database.');
        console.log('To overwrite, use the --overwrite flag');
        return;
      }
      
      console.log('Clearing existing locations...');
      
      // Get a reference to the Firestore collection
      const locationsRef = admin.firestore().collection('locations');
      
      // Delete all existing locations
      const snapshot = await locationsRef.get();
      
      // Use batched writes for better performance
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
    
    // Add all locations
    console.log(`Adding ${locationsData.length} locations to Firestore...`);
    
    // Use batched writes for better performance
    let batch = admin.firestore().batch();
    let count = 0;
    const startTime = Date.now();
    
    for (const location of locationsData) {
      const docRef = admin.firestore().collection('locations').doc();
      
      // Add approved flag to all imported locations
      const locationWithApproved = {
        ...location,
        approved: true,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(docRef, locationWithApproved);
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
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Import completed in ${duration.toFixed(2)} seconds!`);
    
    // Verify the locations were added
    const updatedLocations = await db.getLocations();
    console.log(`Now there are ${updatedLocations.rowCount} locations in the database.`);
    
  } catch (error) {
    console.error('Error importing locations:', error);
    throw error;
  } finally {
    // Close the database connection
    await db.close();
  }
}

/**
 * Main function to run the import process
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    overwrite: args.includes('--overwrite'),
    skipValidation: args.includes('--skip-validation'),
    useValidatedFile: args.includes('--use-validated'),
    inputFile: args.find(arg => arg.startsWith('--input='))?.split('=')[1] || '../server/data/sampleLocations.js',
  };
  
  try {
    let locationsData;
    
    if (options.useValidatedFile && fs.existsSync(path.join(__dirname, '../server/data/validatedLocations.js'))) {
      console.log('Using pre-validated locations file...');
      locationsData = require('../server/data/validatedLocations').sampleLocations;
    } else if (options.skipValidation) {
      console.log('Skipping validation...');
      try {
        locationsData = require(options.inputFile).sampleLocations;
      } catch (error) {
        // Try with adjusted path
        console.log('Trying with adjusted path...');
        locationsData = require('../data/sampleLocations').sampleLocations;
      }
    } else {
      console.log('Validating trailer URLs...');
      // Run the validation process
      await validateTrailers();
      
      // Load the validated locations
      if (fs.existsSync(path.join(__dirname, '../server/data/validatedLocations.js'))) {
        locationsData = require('../server/data/validatedLocations').sampleLocations;
      } else {
        console.warn('Validation did not produce a file. Using original data...');
        locationsData = require(options.inputFile).sampleLocations;
      }
    }
    
    // Import to Firestore
    await importLocationsToFirestore(locationsData, {
      overwrite: options.overwrite,
      validateUrls: !options.skipValidation
    });
    
    console.log('Import process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import process failed:', error);
    process.exit(1);
  }
}

// Run the import if executed directly
if (require.main === module) {
  main();
}

module.exports = { importLocationsToFirestore };