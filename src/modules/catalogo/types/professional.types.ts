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
  nationalLicense: string;
  provincialLicense: string;
  biography?: string | null;
  specialties?: string[];
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
  nationalLicense: string;
  provincialLicense: string;
  biography?: string | null;
  specialtyIds: number[];
};

export type Specialty = {
  id: number;
  name: string;
  parentSpecialtyId?: number | null;
};
