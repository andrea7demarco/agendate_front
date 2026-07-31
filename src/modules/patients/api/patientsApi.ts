import { baseApi } from '../../../common/api/baseApi';
import type { CreatePatientRequest, Patient } from '../types/patient.types';

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPatient: builder.mutation<Patient, CreatePatientRequest>({
      query: (body) => ({
        url: '/patients',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreatePatientMutation } = patientsApi;
