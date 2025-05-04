const express = require('express');
const { verifyFirebaseToken, verifyModerator } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Apply Firebase auth middleware to all admin routes
router.use(verifyFirebaseToken);
router.use(verifyModerator);

/**
 * GET /api/admin/submissions
 * 
 * Get all pending submissions for review
 */
router.get('/submissions', (req, res) => {
  try {
    const result = db.query(
      `SELECT * FROM submissions WHERE status = ? ORDER BY id DESC`,
      ['pending']
    );
    
    res.json({ submissions: result.rows });
  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

/**
 * PUT /api/admin/moderate/:id
 * 
 * Approve or reject a submission
 */
router.put('/moderate/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { action, updates } = req.body;
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }
    
    // Get the submission
    const getResult = db.query('SELECT * FROM submissions WHERE id = ?', [id]);
    
    if (!getResult.rows || getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = getResult.rows[0];
    
    if (action === 'approve') {
      // Apply any updates to the submission
      const finalSubmission = { ...submission, ...updates };
      
      // Insert into locations table
      db.query(
        `INSERT INTO locations (title, type, lat, lng, trailer_url, imdb_link) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          finalSubmission.title,
          finalSubmission.type,
          finalSubmission.lat,
          finalSubmission.lng,
          finalSubmission.trailer_url, 
          finalSubmission.imdb_link
        ]
      );
    }
    
    // Update submission status
    db.query(
      'UPDATE submissions SET status = ? WHERE id = ?',
      [action === 'approve' ? 'approved' : 'rejected', id]
    );
    
    res.json({ 
      message: `Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Error moderating submission:', error);
    res.status(500).json({ error: 'Failed to moderate submission' });
  }
});

/**
 * GET /api/admin/profile
 * 
 * Get current moderator profile
 */
router.get('/profile', (req, res) => {
  res.json({ 
    uid: req.user.uid,
    email: req.user.email || 'Unknown',
    role: 'moderator'
  });
});

module.exports = router;