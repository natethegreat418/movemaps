const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// For testing database connection
async function testDbConnection() {
  try {
    // Only attempt to connect if DATABASE_URL is provided
    if (process.env.DATABASE_URL) {
      const client = await db.getClient();
      console.log('Database connection successful');
      client.release();
    } else {
      console.log('DATABASE_URL not set, skipping database connection test');
    }
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// Call test function on startup but don't stop server if it fails
testDbConnection().catch(console.error);

module.exports = app;