import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { logout } from '../slices/authSlice';

const backendUrl = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';
const baseUrl = backendUrl.startsWith('http') ? `${backendUrl}/auth/` : `https://${backendUrl}/auth/`;

const baseQuery = fetchBaseQuery({ 
  baseUrl, // Ensure api-gateway runs on 3000
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => 'profile',
      providesTags: ['Profile'],
    }),
    getMasters: builder.query({
      query: ({ page = 1, limit = 10, search, regionId, cityId, topRated, availableNow }: any) => {
        let qs = `masters?page=${page}&limit=${limit}`;
        if (search) qs += `&search=${encodeURIComponent(search)}`;
        if (regionId) qs += `&regionId=${encodeURIComponent(regionId)}`;
        if (cityId) qs += `&cityId=${encodeURIComponent(cityId)}`;
        if (topRated !== undefined) qs += `&topRated=${topRated}`;
        if (availableNow !== undefined) qs += `&availableNow=${availableNow}`;
        return qs;
      },
    }),
    globalSearch: builder.query({
      query: ({ page = 1, limit = 10, search, regionId, cityId, topRated, availableNow }: any) => {
        let qs = `search?page=${page}&limit=${limit}`;
        if (search) qs += `&search=${encodeURIComponent(search)}`;
        if (regionId) qs += `&regionId=${encodeURIComponent(regionId)}`;
        if (cityId) qs += `&cityId=${encodeURIComponent(cityId)}`;
        if (topRated !== undefined) qs += `&topRated=${topRated}`;
        if (availableNow !== undefined) qs += `&availableNow=${availableNow}`;
        return qs;
      },
    }),
    getMasterById: builder.query({
      query: (id: string) => `masters/${id}`,
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: 'profile',
        method: 'PUT',
        body: profileData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'register',
        method: 'POST',
        body: userData,
      }),
    }),
    uploadAvatar: builder.mutation({
      query: (formData: FormData) => ({
        url: 'profile/avatar',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation,
  useGetProfileQuery,
  useGetMastersQuery,
  useGlobalSearchQuery,
  useGetMasterByIdQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation
} = authApi;
