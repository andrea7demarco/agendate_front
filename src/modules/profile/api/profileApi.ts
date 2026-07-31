import { baseApi } from '../../../common/api/baseApi';
import type {
  MyProfileResponse,
  UpdatePatientRequest,
  UpdateProfessionalRequest,
  UpdateProfileResponse,
} from '../types/profile.types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<MyProfileResponse, void>({
      query: () => ({
        url: '/profile/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    updatePatientProfile: builder.mutation<
      UpdateProfileResponse,
      { id: number; body: UpdatePatientRequest }
    >({
      query: ({ id, body }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateProfessionalProfile: builder.mutation<
      UpdateProfileResponse,
      { id: number; body: UpdateProfessionalRequest }
    >({
      query: ({ id, body }) => ({
        url: `/professionals/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdatePatientProfileMutation,
  useUpdateProfessionalProfileMutation,
} = profileApi;
