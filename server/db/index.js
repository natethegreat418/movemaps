const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Connect to SQLite database
const dbPath = process.env.DB_PATH || path.join(dbDir, 'moviemap.db');
const db = new Database(dbPath, { verbose: console.log });

// Helper to make async queries more like pg
const query = (sql, params = []) => {
  try {
    console.log(`Executing query: ${sql}`);
    console.log('With parameters:', params);
    
    // For SELECT queries
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      
      let result;
      try {
        // Handle array of parameters vs individual parameters
        if (Array.isArray(params) && params.length > 0) {
          result = stmt.all(params);
        } else {
          result = stmt.all();
        }
        
        console.log(`Query returned ${result ? result.length : 0} rows`);
        return { 
          rows: result,
          // Some useful properties for better compatibility
          rowCount: result ? result.length : 0
        };
      } catch (stmtError) {
        console.error('Error executing statement:', stmtError);
        return { rows: [], rowCount: 0 };
      }
    }
    // For INSERT, UPDATE, DELETE queries
    else {
      const stmt = db.prepare(sql);
      
      let result;
      try {
        // Handle array of parameters vs individual parameters
        if (Array.isArray(params) && params.length > 0) {
          result = stmt.run(params);
        } else {
          result = stmt.run();
        }
        
        console.log(`Query affected ${result ? result.changes : 0} rows`);
        return { 
          rowCount: result ? result.changes : 0,
          changes: result ? result.changes : 0,
          // Add some useful properties
          rows: []
        };
      } catch (stmtError) {
        console.error('Error executing statement:', stmtError);
        return { rows: [], rowCount: 0, changes: 0 };
      }
    }
  } catch (err) {
    console.error('SQLite query error:', err);
    return { rows: [], rowCount: 0, error: err.message };
  }
};

// Initialize database with tables
const initDb = () => {
  console.log('Initializing SQLite database...');
  
  try {
    // Create locations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        trailer_url TEXT,
        imdb_link TEXT,
        year INTEGER,
        location_name TEXT
      )
    `);

    // Create submissions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        trailer_url TEXT,
        imdb_link TEXT,
        year INTEGER,
        location_name TEXT,
        status TEXT DEFAULT 'pending'
      )
    `);

    // Create moderators table
    db.exec(`
      CREATE TABLE IF NOT EXISTS moderators (
        uid TEXT PRIMARY KEY
      )
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
};

// Initialize the database
initDb();

// Export the database functions
module.exports = {
  db,
  query,
  close: () => db.close(),
};