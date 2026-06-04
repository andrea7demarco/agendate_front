import { baseApi } from '../../../common/api/baseApi';
import type {
  RegisterRequest,
  RegisterResponse,
  AuthResponse,
  LoginLocalRequest,
  LoginResponse,
  LoginGoogleRequest,
  CompleteRegistrationRequest,
} from '../types/auth.types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<AuthResponse, void>({
      query: () => ({
        url: '/identity/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    login: builder.mutation<LoginResponse, LoginLocalRequest>({
      query: (body) => ({
        url: '/identity/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    loginWithGoogle: builder.mutation<LoginResponse, LoginGoogleRequest>({
      query: (body) => ({
        url: '/identity/login/google',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/identity/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    completeRegistration: builder.mutation<
      LoginResponse,
      CompleteRegistrationRequest
    >({
      query: (body) => ({
        url: '/identity/complete-registration',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/identity/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useLoginWithGoogleMutation,
  useRegisterMutation,
  useCompleteRegistrationMutation,
  useLogoutMutation,
} = authApi;
