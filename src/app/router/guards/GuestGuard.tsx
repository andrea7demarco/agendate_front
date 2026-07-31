import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import {
  getHomePathByRole,
  getSafeRedirectPath,
} from '../../../common/utils/auth';

export const GuestGuard = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();

  if (isAuthenticated && user) {
    if (!user.registrationCompleted) {
      const redirect = searchParams.get('redirect');
      const destination = redirect
        ? `/complete-registration?redirect=${encodeURIComponent(redirect)}`
        : '/complete-registration';

      return <Navigate to={destination} replace />;
    }

    return (
      <Navigate
        to={getSafeRedirectPath(
          searchParams.get('redirect'),
          getHomePathByRole(user.role),
        )}
        replace
      />
    );
  }

  return <Outlet />;
};
