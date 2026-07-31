export type HealthInsurance = {
  id: number;
  name: string;
  acronym: string;
};

export type PatientHealthInsuranceRequest = {
  healthInsuranceId: number;
  affiliateNumber?: string | null;
  planName?: string | null;
};
