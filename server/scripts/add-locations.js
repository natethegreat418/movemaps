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

// Sample locations data - replace or expand this with your actual data
const locationsData = [
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
  // Add more locations here
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