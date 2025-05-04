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
    // For SELECT queries
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      return { rows: stmt.all(params) };
    }
    // For INSERT, UPDATE, DELETE queries
    else {
      const stmt = db.prepare(sql);
      const result = stmt.run(params);
      return { rowCount: result.changes };
    }
  } catch (err) {
    console.error('SQLite query error:', err);
    throw err;
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
        imdb_link TEXT
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