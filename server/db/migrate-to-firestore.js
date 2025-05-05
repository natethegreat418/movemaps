/**
 * Migration script to transfer data from SQLite to Firestore
 * 
 * This script reads all data from the SQLite database and transfers it to Firestore.
 * Run this script once when transitioning from SQLite to Firestore.
 */
const sqliteDb = require('./index');
const firestoreDb = require('./firestore');
const { admin } = require('../config/firebase');

/**
 * Migrate all data from SQLite to Firestore
 */
async function migrateToFirestore() {
  console.log('Starting migration from SQLite to Firestore...');
  
  try {
    // Step 1: Migrate locations
    await migrateLocations();
    
    // Step 2: Migrate submissions
    await migrateSubmissions();
    
    // Step 3: Migrate moderators
    await migrateModerators();
    
    console.log('Migration complete! 🎉');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Clean up SQLite connection
    sqliteDb.close();
    
    // Exit the process
    process.exit(0);
  }
}

/**
 * Migrate locations data
 */
async function migrateLocations() {
  console.log('Migrating locations...');
  
  // Get all locations from SQLite
  const result = sqliteDb.query('SELECT * FROM locations');
  const locations = result.rows;
  
  console.log(`Found ${locations.length} locations to migrate`);
  
  // Get a reference to the Firestore locations collection
  const locationsCollection = admin.firestore().collection('locations');
  
  // Create a batch for efficient writes
  let batch = admin.firestore().batch();
  let operationCount = 0;
  
  for (const location of locations) {
    // Convert camelCase keys to snake_case keys
    const firestoreLocation = {
      title: location.title,
      type: location.type,
      lat: location.lat,
      lng: location.lng,
      trailer_url: location.trailer_url,
      imdb_link: location.imdb_link,
      year: location.year,
      location_name: location.location_name
    };
    
    // Generate a document ID (use the original ID if available)
    const docId = location.id ? location.id.toString() : locationsCollection.doc().id;
    const docRef = locationsCollection.doc(docId);
    
    // Add to batch
    batch.set(docRef, firestoreLocation);
    operationCount++;
    
    // Firestore batches are limited to 500 operations
    if (operationCount >= 400) {
      await batch.commit();
      console.log(`Committed batch of ${operationCount} locations`);
      batch = admin.firestore().batch();
      operationCount = 0;
    }
  }
  
  // Commit any remaining operations
  if (operationCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${operationCount} locations`);
  }
  
  console.log('Locations migration complete');
}

/**
 * Migrate submissions data
 */
async function migrateSubmissions() {
  console.log('Migrating submissions...');
  
  // Get all submissions from SQLite
  const result = sqliteDb.query('SELECT * FROM submissions');
  const submissions = result.rows;
  
  console.log(`Found ${submissions.length} submissions to migrate`);
  
  // Get a reference to the Firestore submissions collection
  const submissionsCollection = admin.firestore().collection('submissions');
  
  // Create a batch for efficient writes
  let batch = admin.firestore().batch();
  let operationCount = 0;
  
  for (const submission of submissions) {
    // Convert camelCase keys to snake_case keys
    const firestoreSubmission = {
      title: submission.title,
      type: submission.type,
      lat: submission.lat,
      lng: submission.lng,
      trailer_url: submission.trailer_url,
      imdb_link: submission.imdb_link,
      year: submission.year,
      location_name: submission.location_name,
      status: submission.status || 'pending'
    };
    
    // Generate a document ID (use the original ID if available)
    const docId = submission.id ? submission.id.toString() : submissionsCollection.doc().id;
    const docRef = submissionsCollection.doc(docId);
    
    // Add to batch
    batch.set(docRef, firestoreSubmission);
    operationCount++;
    
    // Firestore batches are limited to 500 operations
    if (operationCount >= 400) {
      await batch.commit();
      console.log(`Committed batch of ${operationCount} submissions`);
      batch = admin.firestore().batch();
      operationCount = 0;
    }
  }
  
  // Commit any remaining operations
  if (operationCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${operationCount} submissions`);
  }
  
  console.log('Submissions migration complete');
}

/**
 * Migrate moderators data
 */
async function migrateModerators() {
  console.log('Migrating moderators...');
  
  // Get all moderators from SQLite
  const result = sqliteDb.query('SELECT * FROM moderators');
  const moderators = result.rows;
  
  console.log(`Found ${moderators.length} moderators to migrate`);
  
  // Get a reference to the Firestore moderators collection
  const moderatorsCollection = admin.firestore().collection('moderators');
  
  // Create a batch for efficient writes
  let batch = admin.firestore().batch();
  let operationCount = 0;
  
  for (const moderator of moderators) {
    // Use the uid as the document ID
    const docRef = moderatorsCollection.doc(moderator.uid);
    
    // Add to batch
    batch.set(docRef, { role: 'moderator' });
    operationCount++;
    
    // Firestore batches are limited to 500 operations
    if (operationCount >= 400) {
      await batch.commit();
      console.log(`Committed batch of ${operationCount} moderators`);
      batch = admin.firestore().batch();
      operationCount = 0;
    }
  }
  
  // Commit any remaining operations
  if (operationCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${operationCount} moderators`);
  }
  
  console.log('Moderators migration complete');
}

// Start the migration
migrateToFirestore();