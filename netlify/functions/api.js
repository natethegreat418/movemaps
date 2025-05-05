const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

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

// Export the serverless handler
module.exports.handler = serverless(app);