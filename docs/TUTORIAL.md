# RunTrackMap Tutorial

## Introduction
RunTrackMap is a full-stack web application for tracking running and walking activities with GPS route visualization. This tutorial will guide you through setting up and using the application.

## Getting Started
1. **Installation**
   Follow the installation steps in the README.md file to set up the application.

2. **First Launch**
   After installation, start the application using `npm run dev` and navigate to `http://localhost:5173` in your browser.

## User Guide
### Creating an Account
1. Navigate to the login page
2. Click "Register" to create a new account
3. Fill in your username, password, and display name
4. Click "Create Account"

### Recording an Activity
1. Log in to your account
2. From the home page, click the "Start" button
3. Select activity type (running or walking)
4. Click the play button to start tracking
5. The app will record your route and stats in real-time
6. Use the pause button to temporarily stop tracking
7. Click the stop button when finished

### Viewing Your Activities
1. Navigate to the "History" page from the bottom navigation bar
2. Browse your past activities listed in chronological order
3. Click on any activity to view detailed information and route map

### Analyzing Statistics
1. Go to the "Stats" page from the bottom navigation
2. View your overall statistics including total distance and time
3. See your weekly activity chart showing running vs walking
4. Check achievements based on your performance

## Advanced Features
### Customizing Preferences
1. Go to the "Profile" page
2. Click "Preferences"
3. Adjust settings such as dark mode, units, and notifications

### PlayFab Integration
1. The application uses PlayFab for backend services
2. Your activities and user data are securely stored in the cloud
3. This enables cross-device synchronization of your activities

## Troubleshooting
### Common Issues
- **GPS not tracking**: Ensure location permissions are enabled in your browser
- **Can't log in**: Check your network connection and credentials
- **App crashes**: Clear browser cache and reload, or check console for errors

## Development
See the CONTRIBUTING.md file for information on contributing to the project.
