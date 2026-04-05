import { useAppSelector } from '../../app/hooks';

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
  };
};
