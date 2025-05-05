// Script to insert sample data into the MovieMap database
const db = require('./db');

// Sample filming locations for development and testing
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
  }
];

// Sample submissions for development and testing
const sampleSubmissions = [
  {
    title: 'Breaking Bad',
    year: 2008,
    type: 'tv',
    lat: 35.1264,
    lng: -106.5703,
    location_name: 'Albuquerque, New Mexico',
    trailer_url: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    imdb_link: 'https://www.imdb.com/title/tt0903747/',
    status: 'pending'
  },
  {
    title: 'The Lord of the Rings',
    year: 2001,
    type: 'movie',
    lat: -45.0153,
    lng: 168.6628,
    location_name: 'Queenstown, New Zealand',
    trailer_url: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
    imdb_link: 'https://www.imdb.com/title/tt0120737/',
    status: 'pending'
  }
];

// Clear existing data
function clearTables() {
  console.log('Clearing existing data...');
  db.query('DELETE FROM locations');
  db.query('DELETE FROM submissions');
  console.log('Tables cleared');
}

// Insert sample data
function insertSampleData() {
  console.log(`Adding ${sampleLocations.length} sample locations and ${sampleSubmissions.length} sample submissions`);

  // Use direct SQL for inserting locations
  const insertLocationStmt = db.db.prepare(`
    INSERT INTO locations (title, type, lat, lng, trailer_url, imdb_link, year, location_name) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Start a transaction for bulk insert of locations
  const insertLocations = db.db.transaction((locations) => {
    for (const location of locations) {
      insertLocationStmt.run(
        location.title, 
        location.type, 
        location.lat, 
        location.lng, 
        location.trailer_url, 
        location.imdb_link,
        location.year,
        location.location_name
      );
    }
  });

  // Use direct SQL for inserting submissions
  const insertSubmissionStmt = db.db.prepare(`
    INSERT INTO submissions (title, type, lat, lng, trailer_url, imdb_link, year, location_name, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Start a transaction for bulk insert of submissions
  const insertSubmissions = db.db.transaction((submissions) => {
    for (const submission of submissions) {
      insertSubmissionStmt.run(
        submission.title, 
        submission.type, 
        submission.lat, 
        submission.lng, 
        submission.trailer_url, 
        submission.imdb_link,
        submission.year,
        submission.location_name,
        submission.status
      );
    }
  });

  try {
    // Execute transactions
    insertLocations(sampleLocations);
    console.log('Sample locations inserted successfully');
    
    insertSubmissions(sampleSubmissions);
    console.log('Sample submissions inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Add test moderator
function addTestModerator() {
  try {
    // Check if test moderator exists
    const result = db.query('SELECT * FROM moderators WHERE uid = ?', ['test-moderator']);
    
    // If not, add it
    if (!result.rows || result.rows.length === 0) {
      db.query('INSERT INTO moderators (uid) VALUES (?)', ['test-moderator']);
      console.log('Added test moderator for development');
    } else {
      console.log('Test moderator already exists');
    }
  } catch (error) {
    console.error('Error adding test moderator:', error);
  }
}

// Main function
function main() {
  try {
    clearTables();
    insertSampleData();
    addTestModerator();
    
    // Print database stats
    const locationCount = db.query('SELECT COUNT(*) as count FROM locations').rows[0].count;
    const submissionCount = db.query('SELECT COUNT(*) as count FROM submissions').rows[0].count;
    const moderatorCount = db.query('SELECT COUNT(*) as count FROM moderators').rows[0].count;
    
    console.log('\nDatabase Statistics:');
    console.log(`- Locations: ${locationCount}`);
    console.log(`- Submissions: ${submissionCount}`);
    console.log(`- Moderators: ${moderatorCount}`);
    
    console.log('\nSetup complete. You can now start the server with:');
    console.log('npm run dev');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the script
main();