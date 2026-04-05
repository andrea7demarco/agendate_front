import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';

export const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
