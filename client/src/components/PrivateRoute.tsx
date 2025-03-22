import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePlayFabAuth } from '@/hooks/usePlayFabAuth';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading: loading } = usePlayFabAuth();
  const [location, setLocation] = useLocation();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading && !isAuthenticated && location !== '/login') {
      setLocation('/login');
    }
  }, [isAuthenticated, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{isAuthenticated ? children : null}</>;
};

export default PrivateRoute;
