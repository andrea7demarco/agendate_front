import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';

export const CompletedRegistrationGuard = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && user && !user.registrationCompleted) {
    const redirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/complete-registration?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return <Outlet />;
};
