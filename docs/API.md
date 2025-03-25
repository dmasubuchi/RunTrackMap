# RunTrackMap API Documentation

## Authentication
### Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "displayName": "string",
    "location": "string (optional)"
  }
  ```
- **Response**: User object with authentication session

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: User object with authentication session

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Response**: Success message

## User
### Get Current User
- **URL**: `/api/users/me`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User object

### Update Preferences
- **URL**: `/api/users/preferences`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**: 
  ```json
  {
    "notifications": boolean,
    "darkMode": boolean,
    "voiceFeedback": boolean,
    "distanceUnit": "km" | "mi",
    "weightUnit": "kg" | "lb"
  }
  ```
- **Response**: Success message

## Activities
### Get All Activities
- **URL**: `/api/activities`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Array of Activity objects

### Create Activity
- **URL**: `/api/activities`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**: 
  ```json
  {
    "type": "running" | "walking",
    "title": "string",
    "distance": number,
    "duration": number,
    "date": string,
    "route": [
      {
        "lat": number,
        "lng": number,
        "timestamp": number
      }
    ]
  }
  ```
- **Response**: Created Activity object

### Get Activity by ID
- **URL**: `/api/activities/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Activity object

## Statistics
### Get User Stats
- **URL**: `/api/stats`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "totalDistance": number,
    "totalDuration": number,
    "totalActivities": number,
    "runningDistance": number,
    "walkingDistance": number,
    "averageRunningPace": number,
    "averageWalkingPace": number,
    "achievements": [
      {
        "type": "string",
        "title": "string",
        "description": "string",
        "date": "string",
        "icon": "string"
      }
    ],
    "weeklyActivity": [
      {
        "day": "string",
        "running": number,
        "walking": number
      }
    ]
  }
  ```

## PlayFab Integration
### Authentication
- The application uses PlayFab for user authentication
- Client-side authentication is handled through the PlayFab SDK
- Server-side validation uses PlayFab server API

### Data Storage
- User activities are stored in PlayFab's title data
- Activity metadata is stored in Azure Cosmos DB through Azure Functions
- Statistics are calculated on-demand using stored activities
