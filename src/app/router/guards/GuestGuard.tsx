import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { getHomePathByRole } from '../../../common/utils/auth';

export const GuestGuard = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getHomePathByRole(user.role)} replace />;
  }

  return <Outlet />;
};