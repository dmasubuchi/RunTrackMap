#!/bin/bash
set -e

echo "Installing RunTrackMap dependencies..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install PlayFab SDK
echo "Installing PlayFab SDK..."
npm install playfab-sdk

# Create necessary directories if they don't exist
echo "Creating Azure Functions directory if it doesn't exist..."
mkdir -p azure-functions

# Install Azure Functions dependencies
echo "Installing Azure Functions dependencies..."
cd azure-functions
npm init -y
npm install @azure/cosmos
npm install azure-functions-core-tools --save-dev
cd ..

# Create environment files if they don't exist
echo "Creating environment files if they don't exist..."

# Client environment file
if [ ! -f client/.env ]; then
  echo "Creating client/.env..."
  cat > client/.env << EOL
VITE_PLAYFAB_TITLE_ID=YOUR_PLAYFAB_TITLE_ID
EOL
fi

# Server environment file
if [ ! -f server/.env ]; then
  echo "Creating server/.env..."
  cat > server/.env << EOL
PLAYFAB_TITLE_ID=YOUR_PLAYFAB_TITLE_ID
PLAYFAB_SECRET_KEY=YOUR_PLAYFAB_SECRET_KEY
AZURE_FUNCTION_URL=YOUR_AZURE_FUNCTION_URL
PORT=3000
HOST=localhost
EOL
fi

echo "Installation complete!"
echo "To start the development server, run: npm run dev"
echo ""
echo "Note: You need to update the environment files with your actual PlayFab credentials."
echo "- client/.env: Update VITE_PLAYFAB_TITLE_ID"
echo "- server/.env: Update PLAYFAB_TITLE_ID, PLAYFAB_SECRET_KEY, and AZURE_FUNCTION_URL"
