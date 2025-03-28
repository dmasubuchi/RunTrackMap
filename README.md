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

2. **Install dependencies**

```bash
# Install project dependencies
npm install

# Install PlayFab SDK
npm install playfab-sdk

# Install Azure Functions dependencies
cd azure-functions
npm install
cd ..
```

3. **Configure environment variables**

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

## Development Guidelines

### Code Style
This project follows specific code style guidelines to maintain consistency:
- Use TypeScript for type safety
- Follow the ESLint configuration
- Use async/await for asynchronous operations
- Document public functions and interfaces with JSDoc
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility

### Testing
Run tests with:
```bash
npm run test
```

### Building
Build the application for production with:
```bash
./build.sh
```

### Workflow
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Ensure all tests pass
5. Submit a pull request

### Debugging
- Use browser developer tools for frontend debugging
- Check server logs for backend issues
- Use the browser console to view client-side errors
- Set `NODE_ENV=development` for detailed error messages

See `CONTRIBUTING.md` for more detailed information on contributing to the project.

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
