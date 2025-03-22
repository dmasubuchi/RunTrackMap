import axios from 'axios';

// PlayFab server integration
export interface PlayFabConfig {
  titleId: string;
  developerSecretKey: string;
  azureFunctionUrl: string;
}

// Default configuration that will be overridden by environment variables
const defaultConfig: PlayFabConfig = {
  titleId: process.env.PLAYFAB_TITLE_ID || 'YOUR_PLAYFAB_TITLE_ID',
  developerSecretKey: process.env.PLAYFAB_SECRET_KEY || 'YOUR_PLAYFAB_SECRET_KEY',
  azureFunctionUrl: process.env.AZURE_FUNCTION_URL || 'https://your-function-app.azurewebsites.net/api'
};

// Initialize with default config
let config: PlayFabConfig = { ...defaultConfig };

// Configure PlayFab integration
export function configurePlayFab(newConfig: Partial<PlayFabConfig>) {
  config = { ...config, ...newConfig };
}

// Validate PlayFab session ticket
export async function validateSessionTicket(sessionTicket: string): Promise<any> {
  try {
    const response = await axios.post(
      `https://${config.titleId}.playfabapi.com/Server/AuthenticateSessionTicket`,
      {
        SessionTicket: sessionTicket
      },
      {
        headers: {
          'X-SecretKey': config.developerSecretKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.code === 200 && response.data.data) {
      return response.data.data.UserInfo;
    }
    
    throw new Error('Invalid session ticket');
  } catch (error) {
    console.error('Error validating session ticket:', error);
    throw new Error('Failed to validate session ticket');
  }
}

// Forward request to Azure Function for activity metadata
export async function storeActivityMetadata(playFabId: string, activityId: string, metadata: any): Promise<any> {
  try {
    const response = await axios.post(
      `${config.azureFunctionUrl}/ActivityMetadata`,
      {
        activityId,
        metadata
      },
      {
        headers: {
          'x-playfab-id': playFabId,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error storing activity metadata:', error);
    throw new Error('Failed to store activity metadata');
  }
}

// Get activity metadata from Azure Function
export async function getActivityMetadata(playFabId: string, activityId?: string): Promise<any> {
  try {
    const url = activityId 
      ? `${config.azureFunctionUrl}/ActivityMetadata?activityId=${activityId}`
      : `${config.azureFunctionUrl}/ActivityMetadata`;
      
    const response = await axios.get(url, {
      headers: {
        'x-playfab-id': playFabId,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting activity metadata:', error);
    throw new Error('Failed to get activity metadata');
  }
}
