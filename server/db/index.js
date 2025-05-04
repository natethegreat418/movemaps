const { Pool } = require('pg');

// Create a pool of connections to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection and log any errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the pool to be used in other parts of the application
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};