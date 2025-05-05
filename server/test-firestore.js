/**
 * Test script for Firestore integration
 * 
 * This script tests the Firestore integration by running basic queries.
 */

// Import the database module
const db = require('./db');

/**
 * Run test queries
 */
async function runTests() {
  console.log('Testing Firestore integration...');
  
  try {
    // Test 1: Get locations
    console.log('\n📝 Test 1: Get all locations');
    const locations = await db.query('SELECT * FROM locations');
    console.log(`Found ${locations.rowCount} locations`);
    if (locations.rowCount > 0) {
      console.log('First location:', locations.rows[0]);
    }
    
    // Test 2: Get submissions with status=pending
    console.log('\n📝 Test 2: Get pending submissions');
    const submissions = await db.query('SELECT * FROM submissions WHERE status = ?', ['pending']);
    console.log(`Found ${submissions.rowCount} pending submissions`);
    if (submissions.rowCount > 0) {
      console.log('First submission:', submissions.rows[0]);
    }
    
    // Test 3: Add a test location
    console.log('\n📝 Test 3: Add a test location');
    const testLocation = {
      title: 'Test Location',
      type: 'test',
      lat: 12.3456,
      lng: 65.4321,
      trailer_url: 'https://example.com/trailer',
      imdb_link: 'https://example.com/imdb',
      year: 2023,
      location_name: 'Test City, Test Country'
    };
    
    // Use the query interface for compatibility
    const insertResult = await db.query(
      'INSERT INTO locations (title, type, lat, lng, trailer_url, imdb_link, year, location_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        testLocation.title,
        testLocation.type,
        testLocation.lat,
        testLocation.lng,
        testLocation.trailer_url,
        testLocation.imdb_link,
        testLocation.year,
        testLocation.location_name
      ]
    );
    
    console.log('Insert result:', insertResult);
    
    // Test 4: Check if moderator exists
    console.log('\n📝 Test 4: Check if test-moderator exists');
    const moderator = await db.query('SELECT * FROM moderators WHERE uid = ?', ['test-moderator']);
    console.log(`Found ${moderator.rowCount} moderators with uid=test-moderator`);
    if (moderator.rowCount > 0) {
      console.log('Moderator:', moderator.rows[0]);
    } else {
      console.log('Adding test-moderator...');
      const addModeratorResult = await db.query('INSERT INTO moderators (uid) VALUES (?)', ['test-moderator']);
      console.log('Add moderator result:', addModeratorResult);
    }
    
    // Test 5: Add a test submission
    console.log('\n📝 Test 5: Add a test submission');
    const testSubmission = {
      title: 'Test Submission',
      type: 'test',
      lat: 34.5678,
      lng: 87.6543,
      trailer_url: 'https://example.com/submission-trailer',
      imdb_link: 'https://example.com/submission-imdb',
      year: 2024,
      location_name: 'Submission City, Submission Country',
      status: 'pending'
    };
    
    // Use the query interface for compatibility
    const insertSubmissionResult = await db.query(
      'INSERT INTO submissions (title, type, lat, lng, trailer_url, imdb_link, year, location_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        testSubmission.title,
        testSubmission.type,
        testSubmission.lat,
        testSubmission.lng,
        testSubmission.trailer_url,
        testSubmission.imdb_link,
        testSubmission.year,
        testSubmission.location_name,
        testSubmission.status
      ]
    );
    
    console.log('Insert submission result:', insertSubmissionResult);
    
    // Test 6: Get all locations again to confirm addition
    console.log('\n📝 Test 6: Get all locations again');
    const locationsAfter = await db.query('SELECT * FROM locations');
    console.log(`Found ${locationsAfter.rowCount} locations`);
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // No need to close Firestore connections
    console.log('\nTest complete.');
    process.exit(0);
  }
}

// Run the tests
runTests();