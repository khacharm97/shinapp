import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import type { RootState } from '../index';
import { logout } from '../slices/authSlice';
import { io } from 'socket.io-client';
import type { Notification as AppNotification, MastersQueryArgs, Master } from '@/types';

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

const baseQueryWithReauth = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  } else if (result.error && result.error.status === 403) {
    // If blocked, 403 is returned
    const errorData = result.error.data as { message?: string } | undefined;
    if (errorData?.message === 'auth_error_user_blocked' || result.error.status === 403) {
      api.dispatch(logout());
      window.location.href = '/login?error=auth_error_user_blocked';
    }
  }
  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Reviews',
    'Orders',
    'Masters',
    'Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => 'profile',
      providesTags: ['Profile'],
    }),
    getMasters: builder.query({
      query: ({ page = 1, limit = 10, search, regionId, cityId, topRated, availableNow }: MastersQueryArgs) => {
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
      query: ({ page = 1, limit = 10, search, regionId, cityId, topRated, availableNow }: MastersQueryArgs) => {
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
    getHomeMasters: builder.query<{ items: Master[], total: number }, { limit?: number }>({
      query: ({ limit = 6 }) => `masters?limit=${limit}`,
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: 'profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
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
      invalidatesTags: ['Profile'],
    }),
    getSkills: builder.query({
      query: () => 'skills',
    }),
    suggestSkill: builder.mutation({
      query: (skillData) => ({
        url: 'skills/suggest',
        method: 'POST',
        body: skillData,
      }),
    }),
    createPortfolio: builder.mutation({
      query: (formData: FormData) => ({
        url: 'profile/portfolio',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    deletePortfolio: builder.mutation({
      query: (id: string) => ({
        url: `profile/portfolio/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    getBrigades: builder.query({
      query: () => 'profile/brigade',
      providesTags: ['Profile'],
    }),
    getBrigadeById: builder.query({
      query: (id: string) => `brigades/${id}`,
    }),
    createBrigade: builder.mutation({
      query: (data: { name: string; about?: string; invites: string[] }) => ({
        url: 'profile/brigade',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateBrigade: builder.mutation({
      query: (data: { id: string; name: string; about?: string; invites: string[]; removeMemberIds: string[] }) => {
        const { id, ...body } = data;
        return {
          url: `profile/brigade/${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Profile'],
    }),
    deleteBrigade: builder.mutation({
      query: (id: string) => ({
        url: `profile/brigade/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    getNotifications: builder.query<{ notifications: AppNotification[] }, void>({
      query: () => 'notifications',
      providesTags: ['Profile'],
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState, dispatch }
      ) {
        // create a socket connection when the cache subscription starts
        const state = getState() as RootState;
        const token = state.auth.token;
        if (!token) return;

        const wsUrl = backendUrl.startsWith('http') ? backendUrl : `http://${backendUrl}`;
        const socket = io(wsUrl, {
          extraHeaders: {
            authorization: `Bearer ${token}`
          }
        });

        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded;

          // when data is received from the socket connection to the server,
          // update our query result with the received message
          socket.on('new_notification', (notification: AppNotification) => {
            updateCachedData((draft: { notifications?: AppNotification[] }) => {
              if (draft.notifications) {
                draft.notifications.unshift(notification);
              }
            });

            // Browser Push Notification
            if (Notification.permission === 'granted') {
              new Notification(notification.title, { body: notification.message });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification(notification.title, { body: notification.message });
                }
              });
            }
          });

          // Listen for brigade_updated events
          socket.on('brigade_updated', () => {
            // Invalidate 'Profile' to refetch brigades and other relevant profile info
            dispatch(authApi.util.invalidateTags(['Profile']));
          });
        } catch {
          console.log('Something went wrong')
        }

        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        await cacheEntryRemoved;
        socket.disconnect();
      },
    }),
    markNotificationRead: builder.mutation({
      query: (id: string) => ({
        url: `notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Profile'], // Or a specific tag if preferred
    }),
    acceptBrigadeInvite: builder.mutation({
      query: (brigadeId: string) => ({
        url: `profile/brigade/invite/${brigadeId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    rejectBrigadeInvite: builder.mutation({
      query: (brigadeId: string) => ({
        url: `profile/brigade/invite/${brigadeId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    getMyAnnouncements: builder.query({
      query: () => 'profile/announcements',
      providesTags: ['Profile'],
    }),
    createMyAnnouncement: builder.mutation({
      query: (data) => ({
        url: 'profile/announcements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateMyAnnouncement: builder.mutation({
      query: (payload: { id: string; body: any   | FormData }) => {
        return {
          url: `profile/announcements/${payload.id}`,
          method: 'PUT',
          body: payload.body,
        };
      },
      invalidatesTags: ['Profile'],
    }),
    deleteMyAnnouncement: builder.mutation({
      query: (id: string) => ({
        url: `profile/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    createOrder: builder.mutation({
      query: (data: FormData) => ({
        url: 'orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateOrder: builder.mutation({
      query: (payload: { id: string; body: FormData }) => ({
        url: `orders/${payload.id}`,
        method: 'PUT',
        body: payload.body,
      }),
      invalidatesTags: ['Profile'],
    }),
    acceptOrder: builder.mutation({
      query: (id: string) => ({
        url: `orders/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    rejectOrder: builder.mutation({
      query: (id: string) => ({
        url: `orders/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    getMyOrders: builder.query({
      query: () => 'orders',
      providesTags: ['Profile'],
    }),
    getOrderById: builder.query({
      query: (id: string) => `orders/${id}`,
      providesTags: ['Profile'],
    }),

    requestOrderCompletion: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/request-completion`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Orders', id: arg }],
    }),
    acceptOrderCompletion: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/accept-completion`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Orders', id: arg }],
    }),
    createReview: builder.mutation<any, any>({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Masters', 'Orders'],
    }),
    getMasterReviews: builder.query<any, string>({
      query: (masterId) => `/reviews/master/${masterId}`,
      providesTags: (_result, _error, arg) => [{ type: 'Reviews', id: arg }],
    }),
    getMasterBusyDates: builder.query<any, string>({
      query: (masterId) => `/reviews/master/${masterId}/busy-dates`,
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
  useGetHomeMastersQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetSkillsQuery,
  useSuggestSkillMutation,
  useCreatePortfolioMutation,
  useDeletePortfolioMutation,
  useGetBrigadesQuery,
  useGetBrigadeByIdQuery,
  useCreateBrigadeMutation,
  useUpdateBrigadeMutation,
  useDeleteBrigadeMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useAcceptBrigadeInviteMutation,
  useRejectBrigadeInviteMutation,
  useGetMyAnnouncementsQuery,
  useCreateMyAnnouncementMutation,
  useUpdateMyAnnouncementMutation,
  useDeleteMyAnnouncementMutation,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,

  useRequestOrderCompletionMutation,
  useAcceptOrderCompletionMutation,
  useCreateReviewMutation,
  useGetMasterReviewsQuery,
  useGetMasterBusyDatesQuery,
} = authApi;

