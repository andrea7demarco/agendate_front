import type { User } from '../../../common/types/auth';

export interface LoginLocalRequest {
  email: string;
  password: string;
}

export interface LoginGoogleRequest {
  idToken: string;
  registrationKind: 'paciente' | 'profesional';
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  registrationKind: 'paciente' | 'profesional';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AuthResponse extends User {}
