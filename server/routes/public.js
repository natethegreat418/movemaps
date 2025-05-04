const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * GET /api
 * 
 * API information and available endpoints
 */
router.get('/', (req, res) => {
  res.json({
    name: 'MovieMap API',
    version: '1.0.0',
    endpoints: {
      public: [
        { method: 'GET', path: '/api', description: 'API information' },
        { method: 'GET', path: '/api/locations', description: 'Get all approved locations' },
        { method: 'POST', path: '/api/submit-location', description: 'Submit a new location for moderation' }
      ],
      admin: [
        { method: 'GET', path: '/api/admin/submissions', description: 'Get pending submissions (requires auth)' },
        { method: 'PUT', path: '/api/admin/moderate/:id', description: 'Approve/reject submission (requires auth)' },
        { method: 'GET', path: '/api/admin/profile', description: 'Get moderator profile (requires auth)' }
      ]
    }
  });
});

/**
 * GET /api/locations
 * 
 * Get all approved locations from the database
 * Returns: id, title, type, coordinates (lat/lng), trailer_url, imdb_link
 */
router.get('/locations', (req, res) => {
  try {
    console.log('GET /locations request received');
    
    // First, check if we have any locations in the database
    const checkResult = db.query('SELECT COUNT(*) as count FROM locations');
    console.log('Count result:', checkResult);
    
    let count = 0;
    if (checkResult && checkResult.rows && checkResult.rows.length > 0) {
      count = checkResult.rows[0].count;
    } else if (checkResult && typeof checkResult.changes === 'number') {
      // This is for SQLite which might return a different format
      count = 0; // Assume no rows if we can't determine the count
    }
    
    console.log('Locations count:', count);
    
    // If no locations exist, insert sample data
    if (count === 0) {
      console.log('No locations found in database. Inserting sample data...');
      insertSampleLocations();
      console.log('Sample data inserted');
    }
    
    // Query to get all approved locations
    const result = db.query(`
      SELECT 
        id, 
        title, 
        type, 
        lat, 
        lng, 
        trailer_url, 
        imdb_link,
        year,
        location_name
      FROM locations
    `);
    
    console.log('Query result:', result);
    
    // Format the response to match the expected structure
    const locations = [];
    
    if (result && result.rows && Array.isArray(result.rows)) {
      // Map the rows to the expected format
      result.rows.forEach(location => {
        locations.push({
          id: location.id,
          title: location.title,
          type: location.type,
          lat: location.lat,
          lng: location.lng,
          trailerUrl: location.trailer_url,
          imdbLink: location.imdb_link,
          year: location.year,
          locationName: location.location_name
        });
      });
    }
    
    console.log(`Returning ${locations.length} locations`);
    res.json({ locations });
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({ error: 'Failed to get locations: ' + error.message });
  }
});

/**
 * POST /api/submit-location
 * 
 * Submit a new location for moderation
 */
router.post('/submit-location', (req, res) => {
  try {
    const { title, type, lat, lng, trailer_url, imdb_link, year, location_name } = req.body;
    
    // Validate required fields
    if (!title || !type || !lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required fields. Title, type, lat, and lng are required.' 
      });
    }
    
    // Insert into submissions table
    db.query(
      `INSERT INTO submissions (title, type, lat, lng, trailer_url, imdb_link, year, location_name, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, type, lat, lng, trailer_url, imdb_link, year || null, location_name || null, 'pending']
    );
    
    res.status(201).json({ message: 'Location submitted successfully for review' });
  } catch (error) {
    console.error('Error submitting location:', error);
    res.status(500).json({ error: 'Failed to submit location' });
  }
});

/**
 * Insert sample filming locations for development and testing
 */
function insertSampleLocations() {
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

  console.log(`Adding ${sampleLocations.length} sample locations`);

  // Use direct SQL for inserting batch data
  const insertStatement = db.db.prepare(`
    INSERT INTO locations (title, type, lat, lng, trailer_url, imdb_link, year, location_name) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Start a transaction for bulk insert
  const transaction = db.db.transaction((locations) => {
    for (const location of locations) {
      insertStatement.run(
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

  try {
    // Execute transaction
    transaction(sampleLocations);
    console.log('Sample locations inserted successfully');
  } catch (error) {
    console.error('Error inserting sample locations:', error);
  }
}

module.exports = router;