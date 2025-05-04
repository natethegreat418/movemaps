const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables first
dotenv.config();

// Then load modules that depend on environment variables
const db = require('./db');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Test database endpoint
app.get('/db-test', (req, res) => {
  try {
    // Simple query to check database connectivity
    const result = db.query('SELECT 1 AS test');
    res.status(200).json({ 
      message: 'Database connection successful',
      result: result.rows
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Proper shutdown
process.on('SIGINT', () => {
  console.log('Closing database connections...');
  db.close();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;