import type { UserRole } from '../constants/roles';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  registrationCompleted: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken?: string | null;
}
