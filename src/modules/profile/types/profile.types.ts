export type AgeInfo = {
  years: number;
  months: number;
  display: string;
};

export type SpecialtyProfile = {
  id: number;
  name: string;
};

export type PatientHealthInsuranceProfile = {
  id: number;
  name: string;
  acronym: string;
  affiliateNumber?: string | null;
  planName?: string | null;
};

export type ProfessionalHealthInsuranceProfile = {
  id: number;
  name: string;
  acronym: string;
};

export type ProfessionalAvailabilityProfile = {
  dayOfWeek: number;
  dayName: string;
  timeSlot: number;
  timeSlotName: string;
};

export type ProfessionalPatientGroupProfile = {
  id: number;
  name: string;
};

export type ProfessionalTrainingProfile = {
  id: number;
  title: string;
  institution?: string | null;
  year?: number | null;
  description?: string | null;
};

export type PatientProfile = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  gender: string;
  birthDate: string;
  hasCud: boolean;
  age: AgeInfo;
  healthInsurances: PatientHealthInsuranceProfile[];
};

export type ProfessionalProfile = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dni: string;
  phoneNumber: string;
  consultationCost: number;
  appointmentType: string;
  address?: string | null;
  province: string;
  nationalLicense: string;
  provincialLicense: string;
  biography?: string | null;
  degreeTitle?: string | null;
  university?: string | null;
  graduationYear?: number | null;
  specialties: SpecialtyProfile[];
  healthInsurances: ProfessionalHealthInsuranceProfile[];
  availabilities: ProfessionalAvailabilityProfile[];
  patientGroups: ProfessionalPatientGroupProfile[];
  trainings: ProfessionalTrainingProfile[];
};

export type MyProfileResponse =
  | {
      profileType: 'paciente';
      profile: PatientProfile;
    }
  | {
      profileType: 'profesional';
      profile: ProfessionalProfile;
    };

export type UpdatePatientRequest = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: number;
  hasCud: boolean;
  healthInsurances?: PatientHealthInsuranceProfileRequest[] | null;
};

export type PatientHealthInsuranceProfileRequest = {
  healthInsuranceId: number;
  affiliateNumber?: string | null;
  planName?: string | null;
};

export type UpdateProfessionalRequest = {
  firstName: string;
  lastName: string;
  email: string;
  dni?: string | null;
  phoneNumber?: string | null;
  consultationCost: number;
  appointmentType: 'Presencial' | 'Online' | 'Ambos';
  address?: string | null;
  province?: string | null;
  nationalLicense?: string | null;
  provincialLicense?: string | null;
  biography?: string | null;
  degreeTitle?: string | null;
  university?: string | null;
  graduationYear?: number | null;
  specialtyIds: number[];
  healthInsuranceIds?: number[] | null;
  availabilities?: ProfessionalAvailabilityRequest[] | null;
  patientGroups?: number[] | null;
  trainings?: ProfessionalTrainingRequest[] | null;
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

export type UpdateProfileResponse = {
  id: number;
  fullName: string;
  email: string;
};
