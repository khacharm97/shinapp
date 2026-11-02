import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ContactRequestPayload, EstimateEmailPayload, ContactEmailPayload, BasicApiResponse } from '@/types';
import type { RootState } from '../index';

const backendUrl = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';
const baseUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;

export const publicApi = createApi({
  reducerPath: 'publicApi',
  // Send the token when there is one: announcement details need a login.
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    insertContactRequest: builder.mutation<BasicApiResponse, ContactRequestPayload>({
      query: (data) => ({
        url: '/contact-requests',
        method: 'POST',
        body: data,
      }),
    }),
    sendEstimateEmail: builder.mutation<BasicApiResponse, EstimateEmailPayload>({
      query: (payload) => ({
        url: '/contact-requests/email/estimate',
        method: 'POST',
        body: payload,
      }),
    }),
    sendContactEmail: builder.mutation<BasicApiResponse, ContactEmailPayload>({
      query: (payload) => ({
        url: '/contact-requests/email/contact',
        method: 'POST',
        body: payload,
      }),
    }),
    getAnnouncements: builder.query<{ items: any  [], total: number, page: number, totalPages: number }, { page?: number, limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/announcements?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
    }),
    getAnnouncementById: builder.query<any, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useInsertContactRequestMutation, useSendEstimateEmailMutation, useSendContactEmailMutation, useGetAnnouncementsQuery, useGetAnnouncementByIdQuery } = publicApi;
