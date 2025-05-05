const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Force production mode to ensure proper Firebase connection
process.env.NODE_ENV = 'production';

// Import your Express routes
const publicRoutes = require('../../server/routes/public');
const adminRoutes = require('../../server/routes/admin');

// Create Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Mount your routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// Handle root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MovieMaps API is running as a Netlify Function',
    endpoints: {
      locations: '/.netlify/functions/api/locations',
      submissions: '/.netlify/functions/api/submit-location'
    }
  });
});

// Add debug route
app.get('/debug', async (req, res) => {
  try {
    const db = require('../../server/db');
    const locationCount = await db.query('SELECT COUNT(*) as count FROM locations');
    const dbInfo = {
      locationCount: locationCount?.rows?.[0]?.count || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      isFirestore: !!db.getLocations
    };
    
    res.json({
      message: 'API Debug Information',
      database: dbInfo,
      environment: process.env,
      headers: req.headers
    });
  } catch (error) {
    res.json({
      message: 'API Debug Error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Export the serverless handler
module.exports.handler = serverless(app);