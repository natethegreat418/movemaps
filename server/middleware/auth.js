const { admin } = require('../config/firebase');
const db = require('../db');

/**
 * Middleware to verify Firebase ID tokens
 * 
 * This middleware extracts the ID token from the Authorization header,
 * verifies it with Firebase Admin SDK, and attaches the decoded user
 * information to the request object.
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
    }
    
    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach the user info to the request
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to verify the user is a moderator
 * 
 * This middleware checks if the authenticated user is in the moderators table.
 * It should be used after the verifyFirebaseToken middleware.
 */
const verifyModerator = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    // In development with test token, allow access
    if (process.env.NODE_ENV === 'development' && req.user.uid === 'test-moderator') {
      return next();
    }
    
    // Check if the user is in the moderators table
    const result = await db.query('SELECT * FROM moderators WHERE uid = ?', [req.user.uid]);
    
    if (result.rows && result.rows.length > 0) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: User is not a moderator' });
    }
  } catch (error) {
    console.error('Error verifying moderator status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  verifyFirebaseToken,
  verifyModerator
};