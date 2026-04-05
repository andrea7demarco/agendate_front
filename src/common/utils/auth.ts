import { ROLES, type UserRole } from '../constants/roles';

export const getHomePathByRole = (role: UserRole) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.PROFESSIONAL:
      return '/professional';
    default:
      return '/';
  }
};
