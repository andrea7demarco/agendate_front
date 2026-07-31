import type { PatientHealthInsuranceRequest } from '../../healthInsurances/types/healthInsurance.types';

export type Patient = {
  id: number;
  fullName: string;
  email: string;
};

export type CreatePatientRequest = {
  applicationUserId: string;
  birthDate: string;
  gender: number;
  email: string;
  firstName: string;
  lastName: string;
  hasCud: boolean;
  healthInsurances: PatientHealthInsuranceRequest[];
};
