import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { getHomePathByRole } from '../../../common/utils/auth';

export const GuestGuard = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    if (!user.registrationCompleted) {
      return <Navigate to="/complete-registration" replace />;
    }

    return <Navigate to={getHomePathByRole(user.role)} replace />;
  }

  return <Outlet />;
};
