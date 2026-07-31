import { baseApi } from '../../../common/api/baseApi';
import type { HealthInsurance } from '../types/healthInsurance.types';

export const healthInsurancesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealthInsurances: builder.query<HealthInsurance[], void>({
      query: () => ({
        url: '/health-insurances',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetHealthInsurancesQuery } = healthInsurancesApi;
