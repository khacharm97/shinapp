import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import type { RootState } from '../index';
import { logout } from '../slices/authSlice';
import { io } from 'socket.io-client';
import type { Notification as AppNotification, MastersQueryArgs, Master, Technique, TechniquesQueryArgs } from '@/types';

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
  const hadToken = !!(api.getState() as RootState).auth.token;
  if (result.error && result.error.status === 401) {
    // Only log out (which resets the whole store, including in-flight queries
    // from other, unauthenticated endpoints on the same page) if there was
    // actually a session to invalidate. A 401 from a request made while
    // logged out - e.g. a public page's own useGetProfileQuery call - is
    // expected and must not wipe unrelated queries that are still in flight.
    if (hadToken) {
      api.dispatch(logout());
    }
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
    'Profile',
    'Techniques',
    'MyTechniques'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => 'profile',
      providesTags: ['Profile'],
    }),
    getMasters: builder.query({
      query: ({ page = 1, limit = 10, search, regionId, cityId, topRated, availableNow, sortBy }: MastersQueryArgs) => {
        let qs = `masters?page=${page}&limit=${limit}`;
        if (search) qs += `&search=${encodeURIComponent(search)}`;
        if (regionId) qs += `&regionId=${encodeURIComponent(regionId)}`;
        if (cityId) qs += `&cityId=${encodeURIComponent(cityId)}`;
        if (topRated !== undefined) qs += `&topRated=${topRated}`;
        if (availableNow !== undefined) qs += `&availableNow=${availableNow}`;
        if (sortBy && sortBy !== 'relevance') qs += `&sortBy=${sortBy}`;
        return qs;
      },
    }),
    globalSearch: builder.query({
      query: ({ page = 1, limit = 10, search, regionId, cityId, topRated, availableNow, sortBy }: MastersQueryArgs) => {
        let qs = `search?page=${page}&limit=${limit}`;
        if (search) qs += `&search=${encodeURIComponent(search)}`;
        if (regionId) qs += `&regionId=${encodeURIComponent(regionId)}`;
        if (cityId) qs += `&cityId=${encodeURIComponent(cityId)}`;
        if (topRated !== undefined) qs += `&topRated=${topRated}`;
        if (availableNow !== undefined) qs += `&availableNow=${availableNow}`;
        if (sortBy && sortBy !== 'relevance') qs += `&sortBy=${sortBy}`;
        return qs;
      },
    }),
    getMasterById: builder.query({
      query: (id: string) => `masters/${id}`,
    }),
    searchBrigadeInvitees: builder.query({
      query: ({ search, brigadeId, limit = 5 }: { search: string; brigadeId?: string; limit?: number }) => {
        let qs = `profile/brigade/invitees?search=${encodeURIComponent(search)}&limit=${limit}`;
        if (brigadeId) qs += `&brigadeId=${encodeURIComponent(brigadeId)}`;
        return qs;
      },
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

        const wsUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
        const socket = io(wsUrl, {
          // `auth` is sent in the handshake for both the polling and websocket
          // transports; `extraHeaders` is ignored by browsers once the socket
          // upgrades to websocket, which broke realtime notifications in prod.
          auth: { token: `Bearer ${token}` },
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
      async onQueryStarted(id: string, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const target = draft.notifications?.find((n) => n.id === id);
            if (target) target.isRead = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Profile'], // Or a specific tag if preferred
    }),
    markAllNotificationsRead: builder.mutation<{ success?: boolean; error?: string }, void>({
      query: () => ({
        url: 'notifications/read-all',
        method: 'PUT',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            draft.notifications?.forEach((n) => {
              n.isRead = true;
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Profile'],
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
      invalidatesTags: (_result, _error, arg) => [{ type: 'Orders', id: arg }, 'Profile'],
    }),
    acceptOrderCompletion: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/accept-completion`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Orders', id: arg }, 'Profile'],
    }),
    createReview: builder.mutation<any, any>({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Masters', 'Orders', 'Profile'],
    }),
    getMasterReviews: builder.query<any, string>({
      query: (masterId) => `/reviews/master/${masterId}`,
      providesTags: (_result, _error, arg) => [{ type: 'Reviews', id: arg }],
    }),
    getMasterBusyDates: builder.query<any, string>({
      query: (masterId) => `/reviews/master/${masterId}/busy-dates`,
    }),

    getTechniques: builder.query<{ items: Technique[]; total: number; page: number; limit: number; totalPages: number }, TechniquesQueryArgs>({
      query: ({ page = 1, limit = 10, search }) => {
        let qs = `techniques?page=${page}&limit=${limit}`;
        if (search) qs += `&search=${encodeURIComponent(search)}`;
        return qs;
      },
      providesTags: ['Techniques'],
    }),
    getHomeTechniques: builder.query<{ items: Technique[]; total: number }, { limit?: number }>({
      query: ({ limit = 6 }) => `techniques?limit=${limit}`,
      providesTags: ['Techniques'],
    }),
    getTechniqueById: builder.query<Technique, string>({
      query: (id) => `techniques/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Techniques', id }],
    }),
    getTechniqueBusyDates: builder.query<{ startDate: string; endDate: string }[], string>({
      query: (id) => `techniques/${id}/busy-dates`,
    }),
    getMyTechniques: builder.query<Technique[], void>({
      query: () => 'profile/techniques',
      providesTags: ['MyTechniques'],
    }),
    createTechnique: builder.mutation<Technique, FormData>({
      query: (data) => ({
        url: 'profile/techniques',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MyTechniques', 'Techniques'],
    }),
    updateTechnique: builder.mutation<Technique, { id: string; body: FormData }>({
      query: (payload) => ({
        url: `profile/techniques/${payload.id}`,
        method: 'PUT',
        body: payload.body,
      }),
      invalidatesTags: ['MyTechniques', 'Techniques'],
    }),
    deleteTechnique: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `profile/techniques/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MyTechniques', 'Techniques'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetMastersQuery,
  useGlobalSearchQuery,
  useSearchBrigadeInviteesQuery,
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
  useMarkAllNotificationsReadMutation,
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

  useGetTechniquesQuery,
  useGetHomeTechniquesQuery,
  useGetTechniqueByIdQuery,
  useGetTechniqueBusyDatesQuery,
  useGetMyTechniquesQuery,
  useCreateTechniqueMutation,
  useUpdateTechniqueMutation,
  useDeleteTechniqueMutation,
} = authApi;

