import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ContactRequestPayload, EstimateEmailPayload, ContactEmailPayload, BasicApiResponse } from '@/types';

const backendUrl = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';
const baseUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;

export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
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
  }),
});

export const { useInsertContactRequestMutation, useSendEstimateEmailMutation, useSendContactEmailMutation } = publicApi;
