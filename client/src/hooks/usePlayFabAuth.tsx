import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { PlayFabClient, PlayFabError, PlayFabResult, LoginResult } from '../lib/playfab';

// Define types for authentication context
interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Provider component
export function PlayFabAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const sessionTicket = localStorage.getItem('playfab_session_ticket');
    const userData = localStorage.getItem('playfab_user_data');
    
    if (sessionTicket && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          id: parsedUser.id,
          username: parsedUser.username,
          displayName: parsedUser.displayName,
          isAuthenticated: true
        });
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('playfab_session_ticket');
        localStorage.removeItem('playfab_user_data');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    return new Promise<void>((resolve, reject) => {
      PlayFabClient.LoginWithEmailAddress({
        Email: username,
        Password: password,
        InfoRequestParameters: {
          GetPlayerProfile: true,
          GetUserData: true,
          GetPlayerStatistics: true,
          GetUserInventory: false,
          GetUserReadOnlyData: false,
          GetUserVirtualCurrency: false,
          GetCharacterInventories: false,
          GetCharacterList: false,
          GetTitleData: false,
          ProfileConstraints: undefined,
          UserDataKeys: undefined,
          UserReadOnlyDataKeys: undefined
        }
      }, (error: PlayFabError | null, result: PlayFabResult<LoginResult> | null) => {
        if (error) {
          setError(error.errorMessage);
          setIsLoading(false);
          reject(error);
          return;
        }
        
        if (result && result.data) {
          const displayName = result.data.InfoResultPayload?.PlayerProfile?.DisplayName || username;
          
          const userData: AuthUser = {
            id: result.data.PlayFabId,
            username: username,
            displayName: displayName,
            isAuthenticated: true
          };
          
          // Store session data
          if (result.data.SessionTicket) {
            localStorage.setItem('playfab_session_ticket', result.data.SessionTicket);
            localStorage.setItem('playfab_user_data', JSON.stringify(userData));
            
            setUser(userData);
          }
          
          setIsLoading(false);
          resolve();
        }
      });
    });
  };

  // Register function
  const register = async (username: string, password: string, displayName: string) => {
    setIsLoading(true);
    setError(null);
    
    return new Promise<void>((resolve, reject) => {
      PlayFabClient.RegisterPlayFabUser({
        Email: username,
        Password: password,
        DisplayName: displayName,
        RequireBothUsernameAndEmail: false
      }, (error: PlayFabError | null, result: PlayFabResult<any> | null) => {
        if (error) {
          setError(error.errorMessage);
          setIsLoading(false);
          reject(error);
          return;
        }
        
        // Auto login after successful registration
        login(username, password)
          .then(resolve)
          .catch(reject);
      });
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('playfab_session_ticket');
    localStorage.removeItem('playfab_user_data');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function usePlayFabAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('usePlayFabAuth must be used within a PlayFabAuthProvider');
  }
  return context;
}
