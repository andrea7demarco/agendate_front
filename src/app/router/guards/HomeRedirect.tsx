import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { getHomePathByRole } from '../../../common/utils/auth';

export const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getHomePathByRole(user.role)} replace />;
};
