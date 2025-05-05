const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables first
dotenv.config();

// Then load modules that depend on environment variables
const db = require('./db');
const { admin } = require('./config/firebase');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://moviemaps.net', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Test database endpoint
app.get('/db-test', async (req, res) => {
  try {
    // Simple query to check database connectivity
    const result = await db.query('SELECT 1 AS test');
    res.status(200).json({ 
      message: 'Database connection successful',
      result: result.rows
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Add test moderator in development
if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      // Check if test moderator exists
      const result = await db.query('SELECT * FROM moderators WHERE uid = ?', ['test-moderator']);
      
      // If not, add it
      if (!result.rows || result.rows.length === 0) {
        await db.query('INSERT INTO moderators (uid) VALUES (?)', ['test-moderator']);
        console.log('Added test moderator for development');
      }
    } catch (error) {
      console.error('Error adding test moderator:', error);
    }
  })();
}

// Proper shutdown
process.on('SIGINT', () => {
  console.log('Closing database connections...');
  db.close();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${port}/api`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\nDevelopment Mode:');
    console.log('- Test token for moderator access: "test-token-moderator"');
    console.log('- Test moderator UID: "test-moderator"');
  }
});

module.exports = app;