import { ROLES, type UserRole } from '../constants/roles';

export const getHomePathByRole = (role: UserRole) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin';

    case ROLES.PROFESSIONAL:
      return '/';

    case ROLES.PATIENT:
      return '/';

    default:
      return '/';
  }
};

export const getSafeRedirectPath = (
  redirect: string | null,
  fallback: string,
) => {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return fallback;
  }

  return redirect;
};
