import type { User } from '../../../common/types/auth';

export interface LoginLocalRequest {
  email: string;
  password: string;
}

export interface LoginGoogleRequest {
  idToken: string;
  registrationKind?: 'paciente' | 'profesional';
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  registrationKind: 'paciente' | 'profesional';
}

export interface RegisterResponse {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AuthResponse extends User {}

export type CompleteRegistrationRequest = {
  registrationKind: 'paciente' | 'profesional';
  dni?: string | null;
  phoneNumber?: string | null;
  consultationCost?: number | null;
  appointmentType?: 'Presencial' | 'Online' | 'Ambos' | null;
  address?: string | null;
  province?: string | null;
  nationalLicense?: string | null;
  provincialLicense?: string | null;
  biography?: string | null;
  specialtyIds?: number[] | null;
};
