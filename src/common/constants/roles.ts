export const ROLES = {
  ADMIN: 'admin',
  PATIENT: 'paciente',
  PROFESSIONAL: 'profesional',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
