# MovieMap Project Structure

This document explains the project structure for MovieMap.

## Directory Structure

```
/moviemaps/
├── moviemap/              # Frontend React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── ...                
│
├── server/                # Backend Express API server
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   ├── config/            # Server configuration
│   ├── db/                # Database connection and utilities
│   ├── data/              # Sample data and database seed files
│   └── ...                
│
├── scripts/               # Utility scripts
│   ├── add-locations.js   # Add film locations to Firestore
│   ├── import-locations.js# Improved location importer
│   ├── validate-trailers.js# Validate and fix trailer URLs
│   ├── fetch-imdb-locations.js# Fetch locations from IMDB
│   ├── update-database.sh # Convenience script to update the database
│   └── ...                
│
├── temp/                  # Temporary files (not tracked in git)
│
├── CLAUDE.md              # Claude AI assistant configuration
├── PROJECT_STRUCTURE.md   # This file
└── README.md              # Project overview
```

## Purpose of Each Directory

- **moviemap/**: Contains the frontend React application built with Vite
- **server/**: Contains the backend Express API server
- **scripts/**: Contains utility scripts for development, data management, and maintenance
- **server/data/**: Contains sample data files and database seed files
- **temp/**: Temporary files used during development (not tracked in git)

## Key Files

- **package.json**: Root package.json with convenience scripts
- **scripts/update-database.sh**: Script to update the database with validated location data
- **server/data/sampleLocations.js**: Sample location data used as a template for the database

## Running Scripts

Scripts can be run from the project root using npm:

```bash
# Validate trailer URLs
npm run validate-trailers

# Import locations to Firestore
npm run import-locations -- --overwrite

# Update database with validated locations
npm run update-db -- --overwrite
```

## Development Workflow

1. Start the backend server:
   ```bash
   npm run dev:server
   ```

2. Start the frontend development server:
   ```bash
   npm run dev:frontend
   ```

3. Access the application at http://localhost:5173

## Data Management

The project uses Firebase/Firestore as the primary database. The database management workflow is:

1. **Sample Data**: Sample location data is stored in `/server/data/sampleLocations.js`
2. **Validation**: Scripts can validate and fix trailer URLs before import
3. **Import**: Data is imported to Firestore using the import scripts

This approach ensures that:
- Sample data remains with the server code that uses it
- Utility scripts are separate from server deployment code
- The production database (Firebase) remains the single source of truth

## Benefits of the New Structure

- **Cleaner Deployment**: Only deployment-relevant code stays in the server directory
- **Separation of Concerns**: Runtime code is separated from maintenance scripts
- **Better Organization**: All utilities and data are in their own specific locations
- **Improved Workflow**: Root package.json provides convenient scripts for common tasks