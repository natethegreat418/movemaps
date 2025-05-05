# IMDb Movie and TV Show Locations Script

This script fetches the top 25 movies and top 25 TV shows from IMDb, finds their filming locations, and adds them to your MovieMap Firestore database.

## Prerequisites

1. **API Keys**: You'll need two free API keys:
   - **OMDb API Key**: Get from [OMDb API](http://www.omdbapi.com/apikey.aspx) (Free tier: 1,000 daily requests)
   - **TMDB API Key**: Get from [TMDB API](https://www.themoviedb.org/settings/api) (Free tier: 3,000 daily requests)

2. **Node.js and npm**: Make sure you have Node.js installed

3. **Firebase Setup**: Ensure your Firebase service account is properly configured

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**:
   Create or edit the `.env` file in the `server` directory and add your API keys:

   ```
   # Add these to your existing .env file
   OMDB_API_KEY=your_omdb_api_key_here
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

## Running the Script

The script can be run in three different modes:

### 1. Check Mode (Default)

This mode checks for existing locations and doesn't modify the database unless specified:

```bash
cd server
npm run fetch-imdb
```

If locations exist, it will show a message asking to use `--overwrite` or `--append`.

### 2. Overwrite Mode

This mode clears all existing locations and adds the new ones:

```bash
cd server
npm run fetch-imdb -- --overwrite
```

### 3. Append Mode

This mode keeps existing locations and adds the new ones:

```bash
cd server
npm run fetch-imdb -- --append
```

## What the Script Does

1. Fetches the top 25 movies and top 25 TV shows from TMDB API
2. Gets detailed information for each title, including IMDb ID
3. Fetches additional details from OMDb API
4. Finds filming locations using a combination of:
   - Predefined mapping for well-known titles
   - TMDB production countries
   - Title-based location guessing
5. Adds both known locations and educated guesses to your database
6. Saves a backup of all locations to `scripts/imdb-locations.json`

## Customization

You can customize the script by editing the following:

- **Predefined Locations**: Edit the `locationMap` object to add specific filming locations
- **Country Mappings**: Update the `getLocationForCountry` function
- **Fallback Locations**: Modify the `generateFallbackLocation` function

## Troubleshooting

- **API Limits**: Both APIs have free tier limits. If you hit them, wait 24 hours or upgrade
- **Missing Locations**: Some titles may not have accurate filming locations; review the JSON file
- **Database Errors**: Check your Firebase credentials and permissions
- **Script Timeout**: For large datasets, the script might time out. In this case, run it in smaller batches

## Data Quality Notes

The script uses several methods to find filming locations:

1. **Precise Locations**: For well-known titles in the predefined map
2. **Country-Based Locations**: When only country information is available
3. **Fallback Locations**: Generic locations based on content patterns

The quality ranking is:
- Best: Predefined locations in the map (100% accurate)
- Good: Country-based with major production hubs
- Approximate: Pattern-based fallbacks 

For the highest accuracy, consider manually verifying and updating locations using the Firestore console or by editing the JSON file and re-importing.