import { baseApi } from '../../../common/api/baseApi';
import type {
  RegisterRequest,
  AuthResponse,
  LoginLocalRequest,
  LoginResponse,
  LoginGoogleRequest,
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

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/identity/register',
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
  useLogoutMutation,
} = authApi;
