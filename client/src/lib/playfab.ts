import { PlayFab, PlayFabClient, PlayFabError, PlayFabResult, LoginResult } from 'playfab-sdk';

// Initialize PlayFab with title ID from environment variables
export const initializePlayFab = () => {
  // In development, use a default title ID if not provided
  const titleId = import.meta.env.VITE_PLAYFAB_TITLE_ID || 'YOUR_DEFAULT_TITLE_ID';
  PlayFab.settings.titleId = titleId;
};

// Export PlayFab client and types for direct API access
export { PlayFab, PlayFabClient, PlayFabError, PlayFabResult, LoginResult };
