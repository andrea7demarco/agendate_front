import type { User } from '../../../common/types/auth';
import type { PatientHealthInsuranceRequest } from '../../healthInsurances/types/healthInsurance.types';

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
  birthDate?: string | null;
  gender?: number | null;
  hasCud?: boolean | null;
  dni?: string | null;
  phoneNumber?: string | null;
  consultationCost?: number | null;
  appointmentType?: 'Presencial' | 'Online' | 'Ambos' | null;
  address?: string | null;
  province?: string | null;
  city?: string | null;
  nationalLicense?: string | null;
  provincialLicense?: string | null;
  biography?: string | null;
  degreeTitle?: string | null;
  university?: string | null;
  graduationYear?: number | null;
  specialtyIds?: number[] | null;
  healthInsuranceIds?: number[] | null;
  healthInsurances?: PatientHealthInsuranceRequest[] | null;
  locations?: ProfessionalLocationRequest[] | null;
  availabilities?: ProfessionalAvailabilityRequest[] | null;
  patientGroups?: number[] | null;
  trainings?: ProfessionalTrainingRequest[] | null;
};

export type ProfessionalLocationRequest = {
  name: string;
  formattedAddress: string;
  street?: string | null;
  streetNumber?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  externalPlaceId?: string | null;
  externalProvider: string;
  instructions?: string | null;
};

export type ProfessionalAvailabilityRequest = {
  dayOfWeek: number;
  timeSlot: number;
};

export type ProfessionalTrainingRequest = {
  title: string;
  institution?: string | null;
  year?: number | null;
  description?: string | null;
};
