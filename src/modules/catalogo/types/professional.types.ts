export type Professional = {
  id: string;
  applicationUserId?: string | null;
  fullName: string;
  email: string;
  phoneNumber: string;
  consultationCost: number;
  appointmentType: string;
  address: string;
  province?: string | null;
  city?: string | null;
  nationalLicense: string;
  provincialLicense: string;
  biography?: string | null;
  degreeTitle?: string | null;
  university?: string | null;
  graduationYear?: number | null;
  specialties?: string[];
  locations?: ProfessionalLocation[];
  availabilities?: ProfessionalAvailability[];
  patientGroups?: ProfessionalPatientGroup[];
  trainings?: ProfessionalTraining[];
};

export type CreateProfessionalRequest = {
  applicationUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phoneNumber: string;
  consultationCost: number;
  appointmentType: 'Presencial' | 'Online' | 'Ambos';
  address?: string | null;
  province: string;
  city: string;
  nationalLicense: string;
  provincialLicense: string;
  biography?: string | null;
  degreeTitle?: string | null;
  university?: string | null;
  graduationYear?: number | null;
  specialtyIds: number[];
  healthInsuranceIds?: number[] | null;
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

//para ver el mapa
export type ProfessionalLocation = {
  id: number;
  name: string;
  formattedAddress?: string | null;
  city?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  externalPlaceId?: string | null;
  externalProvider?: string | null;
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

export type ProfessionalAvailability = {
  dayOfWeek: number;
  dayName: string;
  timeSlot: number;
  timeSlotName: string;
};

export type ProfessionalPatientGroup = {
  id: number;
  name: string;
};

export type ProfessionalTraining = {
  id: number;
  title: string;
  institution?: string | null;
  year?: number | null;
  description?: string | null;
};

export type Specialty = {
  id: number;
  name: string;
  parentSpecialtyId?: number | null;
};

export type ProfessionalSearchParams = {
  search?: string;
  province?: string;
  specialtyId?: number;
  appointmentType?: 'Presencial' | 'Online' | 'Ambos';
  page?: number;
  pageSize?: number;
};

export type PaginatedProfessionals = {
  items: Professional[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
