// Migration script to update the MovieMap database schema
const db = require('./db');

/**
 * Add missing columns to tables
 */
function migrateSchema() {
  console.log('Starting database schema migration...');
  
  try {
    // First, check if columns already exist in locations table
    const locationsInfo = db.query(`PRAGMA table_info(locations)`).rows;
    const columnsToAdd = [];
    
    // Check for year column
    if (!locationsInfo.some(col => col.name === 'year')) {
      columnsToAdd.push(`ALTER TABLE locations ADD COLUMN year INTEGER`);
    }
    
    // Check for location_name column
    if (!locationsInfo.some(col => col.name === 'location_name')) {
      columnsToAdd.push(`ALTER TABLE locations ADD COLUMN location_name TEXT`);
    }
    
    // Now check submissions table
    const submissionsInfo = db.query(`PRAGMA table_info(submissions)`).rows;
    
    // Check for year column in submissions
    if (!submissionsInfo.some(col => col.name === 'year')) {
      columnsToAdd.push(`ALTER TABLE submissions ADD COLUMN year INTEGER`);
    }
    
    // Check for location_name column in submissions
    if (!submissionsInfo.some(col => col.name === 'location_name')) {
      columnsToAdd.push(`ALTER TABLE submissions ADD COLUMN location_name TEXT`);
    }
    
    // Execute all ALTER TABLE statements
    if (columnsToAdd.length > 0) {
      console.log(`Adding ${columnsToAdd.length} missing columns to database tables...`);
      
      for (const alterStatement of columnsToAdd) {
        console.log(`Executing: ${alterStatement}`);
        db.db.exec(alterStatement);
      }
      
      console.log('Schema migration completed successfully');
    } else {
      console.log('No schema changes needed');
    }
    
    // Print current schema
    console.log('\nCurrent database schema:');
    console.log('Locations table:');
    console.log(locationsInfo.map(col => `  - ${col.name} (${col.type})`).join('\n'));
    
    console.log('\nSubmissions table:');
    console.log(submissionsInfo.map(col => `  - ${col.name} (${col.type})`).join('\n'));
    
  } catch (error) {
    console.error('Error migrating schema:', error);
    throw error;
  }
}

// Run the migration
migrateSchema();

// Close the database connection when done
db.close();