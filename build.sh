#!/bin/bash
set -e

echo "Building RunTrackMap application..."

# Build client
echo "Building client..."
cd client
npm run build
cd ..

# Build server
echo "Building server..."
cd server
npm run build
cd ..

echo "Build complete!"
echo "To start the application in production mode, run: npm start"
