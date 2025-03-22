# RunTrackMap

RunTrackMap is a full-stack web application designed to help users track and visualize their running and walking activities with GPS route tracking.

## Features

- Record running and walking activities with GPS route tracking
- View activity history with detailed statistics
- Analyze performance metrics like distance, duration, and pace
- Visualize routes on interactive maps
- Track achievements and progress over time

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Data Storage**: PlayFab (with Azure Functions and CosmosDB for extended metadata)
- **Maps**: Leaflet
- **Authentication**: PlayFab Authentication

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- PlayFab account with a configured title

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/dmasubuchi/RunTrackMap.git
cd RunTrackMap
```

2. **Automated Installation (Recommended)**

We provide an installation script that will set up all necessary dependencies:

```bash
# Make the script executable
chmod +x install.sh

# Run the installation script
./install.sh
```

The script will:
- Install all Node.js dependencies
- Install PlayFab SDK
- Create the Azure Functions directory and install its dependencies
- Set up environment files with placeholders

3. **Manual Installation (Alternative)**

If you prefer to install dependencies manually:

```bash
# Install project dependencies
npm install

# Install PlayFab SDK
npm install playfab-sdk

# Create Azure Functions directory if it doesn't exist
mkdir -p azure-functions

# Install Azure Functions dependencies
cd azure-functions
npm init -y
npm install @azure/cosmos
npm install azure-functions-core-tools --save-dev
cd ..
```

4. **Configure environment variables**

Create a `.env` file in the client directory:

```bash
# client/.env
VITE_PLAYFAB_TITLE_ID=YOUR_PLAYFAB_TITLE_ID
```

Create a `.env` file in the server directory:

```bash
# server/.env
PLAYFAB_TITLE_ID=YOUR_PLAYFAB_TITLE_ID
PLAYFAB_SECRET_KEY=YOUR_PLAYFAB_SECRET_KEY
AZURE_FUNCTION_URL=YOUR_AZURE_FUNCTION_URL
PORT=3000
HOST=localhost
```

## Development

1. **Start the development server**

```bash
# Start both client and server
npm run dev

# In a separate terminal, start Azure Functions (if needed)
cd azure-functions
npm start
```

2. **Access the application**

Open your browser and navigate to `http://localhost:5173`

## Deployment

### Azure Static Web Apps

The application is configured for deployment to Azure Static Web Apps using GitHub Actions. The workflow configuration is located in `azure-deployment/azure-static-web-app.yml`.

Required GitHub secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `PLAYFAB_TITLE_ID`
- `PLAYFAB_SECRET_KEY`
- `AZURE_FUNCTION_URL`

### Azure Functions

Azure Functions are deployed using GitHub Actions with the configuration in `azure-deployment/azure-function-app.yml`.

Required GitHub secrets:
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
- `COSMOSDB_ENDPOINT`
- `COSMOSDB_KEY`
- `COSMOSDB_DATABASE`
- `COSMOSDB_CONTAINER`
- `PLAYFAB_TITLE_ID`
- `PLAYFAB_SECRET_KEY`

## Project Structure

```
RunTrackMap/
├── client/                  # Frontend React application
│   ├── src/
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utility functions
│       ├── pages/           # Application pages
│       └── types/           # TypeScript type definitions
├── server/                  # Backend Express application
│   ├── playfab.ts           # PlayFab integration
│   ├── playfabRoutes.ts     # PlayFab API routes
│   └── routes.ts            # API endpoints
├── azure-functions/         # Azure Functions for extended storage
│   └── ActivityMetadata/    # Activity metadata function
└── azure-deployment/        # Deployment configurations
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
