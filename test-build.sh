#!/bin/bash
# Test script to build and preview the application in production mode

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== MovieMap Test Build Script ===${NC}"
echo "This script builds the application in production mode and runs the preview server"
echo "to test production behavior, including sample data handling."

# Navigate to the frontend directory
cd moviemap

# Show current environment variables
echo -e "\n${YELLOW}Current environment variables:${NC}"
grep VITE_ .env 2>/dev/null || echo "No .env file found"

# Check if user wants to test with or without API URL
read -p "Test without API URL to verify fallback behavior? (y/n) " test_without_api
if [[ $test_without_api == "y" ]]; then
  echo "Creating temporary .env.production file without API URL..."
  echo "# Temporary production environment for testing" > .env.production
  echo "# This tests fallback behavior without API access" >> .env.production
else
  echo "Creating temporary .env.production file with current API URL..."
  grep VITE_API_URL .env 2>/dev/null > .env.production || echo "VITE_API_URL=http://localhost:3000/api" > .env.production
  echo "# Added other environment variables from .env" >> .env.production
  grep -v VITE_API_URL .env 2>/dev/null | grep VITE_ >> .env.production 2>/dev/null
fi

# Show the production environment variables
echo -e "\n${YELLOW}Using these production environment variables:${NC}"
cat .env.production

# Build the application
echo -e "\n${YELLOW}Building application in production mode...${NC}"
npm run build

# Start the preview server
echo -e "\n${GREEN}Starting preview server...${NC}"
echo "Open your browser to http://localhost:4173 to test the production build"
echo "Use Ctrl+C to stop the server when finished testing"
npm run preview

# Clean up temporary files
echo -e "\n${YELLOW}Cleaning up temporary files...${NC}"
rm .env.production

echo -e "\n${GREEN}Test completed.${NC}"
echo "You can compare this behavior with development mode by running 'npm run dev'"