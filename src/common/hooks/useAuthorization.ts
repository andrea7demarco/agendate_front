import type { UserRole } from '../constants/roles';
import { useAuth } from './useAuth';

export const useAuthorization = () => {
  const { user } = useAuth();

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return { hasRole };
};
