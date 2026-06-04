import { baseApi } from '../../../common/api/baseApi';
import type {
  CreateProfessionalRequest,
  Professional,
  Specialty,
} from '../types/professional.types';

export const professionalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfessionals: builder.query<Professional[], void>({
      query: () => ({
        url: '/professionals',
        method: 'GET',
      }),
    }),

    getProfessionalById: builder.query<Professional, string>({
      query: (id) => ({
        url: `/professionals/${id}`,
        method: 'GET',
      }),
    }),

    getSpecialties: builder.query<Specialty[], void>({
      query: () => ({
        url: '/professionals/specialties',
        method: 'GET',
      }),
    }),

    createProfessional: builder.mutation<Professional, CreateProfessionalRequest>({
      query: (body) => ({
        url: '/professionals',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetProfessionalsQuery,
  useGetProfessionalByIdQuery,
  useGetSpecialtiesQuery,
  useCreateProfessionalMutation,
} = professionalsApi;



