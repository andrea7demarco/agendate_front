import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../../../common/constants/roles';
import { useAuth } from '../../../common/hooks/useAuth';

type Props = {
  allowedRoles: UserRole[];
};

export const RoleGuard = ({ allowedRoles }: Props) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};