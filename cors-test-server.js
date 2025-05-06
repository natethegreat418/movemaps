const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001; // Different port to avoid conflicts

// Sample data for testing
const sampleLocations = [
  {
    id: '1',
    title: 'The Shawshank Redemption',
    type: 'movie',
    year: 1994,
    lat: 41.2439,
    lng: -82.2375,
    locationName: 'Ohio State Reformatory, Mansfield, Ohio, USA',
    trailerUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
    imdbLink: 'https://www.imdb.com/title/tt0111161/'
  },
  {
    id: '2',
    title: 'The Godfather',
    type: 'movie',
    year: 1972,
    lat: 37.7986,
    lng: -122.4305,
    locationName: 'Doherty Drive, San Francisco, California, USA',
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
    imdbLink: 'https://www.imdb.com/title/tt0068646/'
  }
];

// Configure CORS with more permissive settings
// Method 1: Simple CORS setup
app.use(cors());

// Method 2: Explicit CORS settings
/*
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
*/

// Method 3: Manual CORS handling (if needed)
/*
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});
*/

// Basic endpoint for health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'CORS test server running' });
});

// Test API endpoint
app.get('/api/locations', (req, res) => {
  // Simulate a slight delay
  setTimeout(() => {
    res.status(200).json({ locations: sampleLocations });
  }, 300);
});

// Start server
app.listen(port, () => {
  console.log(`CORS test server running at http://localhost:${port}`);
  console.log(`Test API URL: http://localhost:${port}/api`);
  console.log(`Health check: http://localhost:${port}/health`);
});