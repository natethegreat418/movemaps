# Sample Data in MovieMap

This document explains the recent changes to how sample data is handled in the MovieMap application.

## Background

Previously, sample location data was bundled with the application in both development and production builds, and it was used as a fallback when the API was unavailable. This approach had some drawbacks:

1. It increased the bundle size unnecessarily in production builds
2. Sample data was always published to the live site, even when not needed
3. There was duplication of sample data between frontend and backend

## Changes Made

To address these issues, we've implemented the following changes:

### Frontend Changes

1. **Conditional Loading**: Sample data is now loaded dynamically only when needed:
   - In development mode, it's pre-loaded for convenience
   - In production mode, it's only loaded if the API is unreachable

2. **Environment Utilities**: Added new utility functions in `src/utils/env.js`:
   - `isDevelopment()` and `isProduction()` to detect current environment
   - `shouldUseSampleData()` to determine when sample data should be used
   - `logEnvironmentInfo()` to show environment configuration on startup

3. **Dynamic Imports**: Using Vite's dynamic import capabilities to:
   - Prevent sample data from being bundled with the main application code
   - Load it on-demand only when the API is unavailable

4. **Vite Configuration**: Updated build options to:
   - Optimize chunk splitting for better performance
   - Make build mode available to client code

### Backend Changes

1. **Conditional Sample Data**: The server-side mock Firebase implementation now only loads sample data in development mode.

2. **Consistent Environment Handling**: Backend now properly respects `NODE_ENV` when deciding whether to use sample data.

## Testing

A new script `test-build.sh` has been added to help test the application in production mode. This script:

1. Creates a temporary production environment configuration
2. Builds the application in production mode
3. Starts the preview server for testing
4. Provides options to test with or without an API URL

To use it:

```bash
# Make executable if needed
chmod +x test-build.sh

# Run the test script
./test-build.sh
```

## How It Works

The application now follows this flow for handling location data:

1. Always attempt to fetch from the API first
2. If API is unavailable:
   - In development: Use sample data immediately
   - In production: Only lazy-load sample data if there's no API URL configured

This approach means that in typical production deployments with a working API endpoint, sample data will never be loaded or bundled with the application.

## Benefits

- Smaller bundle size in production
- Sample data not published to live site unless needed as fallback
- More efficient resource usage
- Clearer separation of development and production behavior
- Better testing capabilities for both environments