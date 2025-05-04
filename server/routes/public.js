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
 * Get all approved locations
 */
router.get('/locations', (req, res) => {
  try {
    const result = db.query('SELECT * FROM locations');
    res.json({ locations: result.rows });
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

/**
 * POST /api/submit-location
 * 
 * Submit a new location for moderation
 */
router.post('/submit-location', (req, res) => {
  try {
    const { title, type, lat, lng, trailer_url, imdb_link } = req.body;
    
    // Validate required fields
    if (!title || !type || !lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required fields. Title, type, lat, and lng are required.' 
      });
    }
    
    // Insert into submissions table
    db.query(
      `INSERT INTO submissions (title, type, lat, lng, trailer_url, imdb_link, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, type, lat, lng, trailer_url, imdb_link, 'pending']
    );
    
    res.status(201).json({ message: 'Location submitted successfully for review' });
  } catch (error) {
    console.error('Error submitting location:', error);
    res.status(500).json({ error: 'Failed to submit location' });
  }
});

module.exports = router;