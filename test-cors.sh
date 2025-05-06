#!/bin/bash

echo "MovieMaps CORS Testing Script"
echo "============================"

# Check if the needed npm packages are installed
if ! command -v concurrently &> /dev/null; then
    echo "Installing required dependencies..."
    npm install --no-save concurrently cors express http-proxy-middleware
fi

# Start the test servers
echo "Starting the test servers..."
if [ "$1" == "proxy" ]; then
    echo "Starting proxy server only..."
    node proxy-server.js
elif [ "$1" == "test" ]; then
    echo "Starting test API server only..."
    node cors-test-server.js
else
    echo "Starting both servers..."
    npx concurrently "node cors-test-server.js" "node proxy-server.js"
fi

# Note: the script will continue running until you press Ctrl+C