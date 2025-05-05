/**
 * Script to test that Firestore is properly returning locations
 */

// Import the Firestore database module
const db = require('../db');

async function testLocations() {
  try {
    console.log('Testing Firestore locations...');
    
    // Get all locations
    const result = await db.getLocations();
    
    console.log(`Found ${result.rowCount} locations in Firestore`);
    
    if (result.rowCount > 0) {
      // Print the first location as a sample
      console.log('\nSample location:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      // Print all location titles
      console.log('\nAll location titles:');
      result.rows.forEach(location => {
        console.log(`- ${location.title} (${location.location_name})`);
      });
    } else {
      console.log('No locations found. Please run the add-locations.js script first.');
    }
  } catch (error) {
    console.error('Error testing locations:', error);
  } finally {
    // Close the connection
    await db.close();
    process.exit(0);
  }
}

// Run the test
testLocations();