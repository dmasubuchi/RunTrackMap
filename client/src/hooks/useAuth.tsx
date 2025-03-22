import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { UserPreferences } from '@shared/schema';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiRequest('GET', '/api/users/me', null, { on401: 'returnNull' });
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          
          // Apply dark mode setting
          if (userData.preferences?.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  // Effect to update dark mode when user preferences change
  useEffect(() => {
    if (user?.preferences) {
      if (user.preferences.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user?.preferences?.darkMode]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const userData = await apiRequest('POST', '/api/auth/login', { username, password });
      setUser(userData);
      setIsAuthenticated(true);
      toast({
        title: 'Logged in successfully',
        description: `Welcome back, ${userData.displayName || username}!`,
      });
      setLocation('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      setLocation('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      toast({
        title: 'Logout failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}