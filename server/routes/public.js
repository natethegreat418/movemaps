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
router.get('/locations', async (req, res) => {
  try {
    console.log('GET /locations request received');
    
    // Check how many locations are in the database
    const checkResult = await db.query('SELECT COUNT(*) as count FROM locations');
    console.log('Count result:', checkResult);
    
    let count = 0;
    if (checkResult && checkResult.rows && checkResult.rows.length > 0) {
      count = checkResult.rows[0].count;
    } else if (checkResult && typeof checkResult.changes === 'number') {
      // This is for SQLite which might return a different format
      count = 0; // Assume no rows if we can't determine the count
    }
    
    console.log('Locations count:', count);
    
    // If no locations exist, log a message but don't insert sample data
    if (count === 0) {
      console.log('No locations found in database. Please run the add-locations.js script.');
    }
    
    // Query to get all approved locations
    const result = await db.query(`
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


module.exports = router;