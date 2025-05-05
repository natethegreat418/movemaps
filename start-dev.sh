#!/bin/bash

# Start-up script for MovieMap development environment
# This script starts both the frontend and backend servers

# Set colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}MovieMap Development Environment Startup${NC}"
echo -e "${BLUE}===================================================${NC}"

# Set environment variables
export NODE_ENV=development

# Check if the database exists, and if not, initialize it
if [ ! -f "./server/data/moviemap.db" ]; then
  echo -e "${YELLOW}Database not found. Initializing...${NC}"
  cd server && node insert-sample-data.js && cd ..
  echo -e "${GREEN}Database initialized with sample data${NC}"
fi

# Function to handle script exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down servers...${NC}"
  kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
  exit 0
}

# Trap for Ctrl+C
trap cleanup INT

# Start the backend server
echo -e "${YELLOW}Starting backend server...${NC}"
cd server && npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}Backend server running with PID: $BACKEND_PID${NC}"

# Wait a bit for the backend to initialize
sleep 2

# Start the frontend server
echo -e "${YELLOW}Starting frontend server...${NC}"
cd moviemap && npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server running with PID: $FRONTEND_PID${NC}"

echo -e "\n${GREEN}Development servers are running!${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}Backend:${NC} http://localhost:3000"
echo -e "${GREEN}API:${NC} http://localhost:3000/api"
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for both processes to finish
wait $FRONTEND_PID $BACKEND_PID