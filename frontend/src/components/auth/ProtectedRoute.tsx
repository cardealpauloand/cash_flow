import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
interface ProtectedRouteProps {
    children: ReactNode;
}
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, isLoading, navigate]);
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow-pulse mx-auto">
            <Loader2 className="h-8 w-8 text-primary-foreground animate-spin"/>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>);
    }
    if (!isAuthenticated) {
        return null;
    }
    return <>{children}</>;
};
