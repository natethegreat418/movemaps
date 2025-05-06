# MovieMap Database Scripts

This directory contains scripts for managing the MovieMap database, including importing location data, validating trailer URLs, and more.

## Overview of Scripts

1. **`import-locations.js`** - An improved script for importing locations to Firestore, with validation
2. **`validate-trailers.js`** - Checks and fixes YouTube trailer URLs in the location data
3. **`update-database.sh`** - A convenience shell script to run the validation and import process
4. **`add-locations.js`** - The original script for adding locations to Firestore (kept for compatibility)
5. **`fetch-imdb-locations.js`** - Fetches location data from IMDB
6. **`test-locations.js`** - Tests that locations can be retrieved from the database

## Improved Database Import Process

The improved database import process consists of two main steps:

1. **Validation**: The script checks all trailer URLs to ensure they are valid, working YouTube links. It uses several methods to find working trailer URLs:
   - Direct URL validation
   - YouTube API search (if an API key is provided)
   - Manual trailer mapping for important films
   - Fallback URL generation based on title and year

2. **Import**: After validation, the script imports the fixed location data to Firestore, with options to overwrite existing data or add new entries.

## Using the Scripts

### Updating the Database with Validation

The easiest way to update the database is using the `update-db` script:

```bash
# Validate trailers and update the database (overwriting existing entries)
npm run update-db -- --overwrite

# Use previously validated data without re-validating
npm run update-db -- --use-validated --overwrite

# Skip validation and just import the raw data
npm run update-db -- --skip-validation --overwrite
```

### Running the Scripts Individually

You can also run the individual scripts:

```bash
# Just validate the trailers without importing
npm run validate-trailers

# Import locations with validation
npm run import-locations -- --overwrite

# Import locations without validation
npm run import-locations -- --skip-validation --overwrite
```

## YouTube API Key

For the best results with trailer validation, set your YouTube API key as an environment variable:

```bash
export YOUTUBE_API_KEY=your_api_key_here
```

This allows the script to search YouTube for the most relevant trailer. Without an API key, the script will fall back to manual mapping and URL pattern generation.

## Manual Trailer Overrides

The `validate-trailers.js` script includes a mapping of known trailer URLs for important films. You can add more entries to this mapping to ensure specific films always have the correct trailer URL.

## Output

The validation process creates a new file `validatedLocations.js` in the `data` directory. This file contains the validated locations with fixed trailer URLs.

## Improvements over the Original Process

- **Trailer URL Validation**: Ensures all trailer links actually work
- **Multiple Validation Methods**: Uses multiple approaches to find working trailer URLs
- **Manual Overrides**: Includes known trailer URLs for important films
- **Better Error Handling**: More comprehensive error handling and reporting
- **Firestore Timestamp**: Adds proper Firestore timestamps for creation date
- **Approval Flag**: Automatically sets all imported locations as approved
- **Batched Writes**: Uses Firestore batched writes for better performance
- **Flexible Options**: Multiple command-line options for different use cases