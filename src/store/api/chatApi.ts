import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import { io } from 'socket.io-client';
import type { RootState } from '../index';
import { logout } from '../slices/authSlice';
import type { ChatMessage, Conversation, ConversationType } from '@/types';

const backendUrl = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';
const httpBase = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${httpBase}/chat/`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: object,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

interface SendMessageArgs {
  conversationId?: string;
  recipientId?: string;
  type?: ConversationType;
  announcementId?: string;
  orderId?: string;
  body: string;
}

interface SendMessageResult {
  message: ChatMessage;
  conversationId: string;
  conversationType: ConversationType;
  participantIds: string[];
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,
  tagTypes: ['Conversations'],
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => 'conversations',
      providesTags: ['Conversations'],
    }),

    getConversation: builder.query<Conversation, string>({
      query: (id) => `conversations/${id}`,
    }),

    getMessages: builder.query<ChatMessage[], string>({
      query: (conversationId) => `conversations/${conversationId}/messages?limit=50`,
      transformResponse: (res: { items: ChatMessage[]; nextCursor: string | null }) => res.items,
    }),

    sendMessage: builder.mutation<SendMessageResult, SendMessageArgs>({
      query: (body) => ({ url: 'messages', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            chatApi.util.updateQueryData('getMessages', data.conversationId, (draft) => {
              if (!draft.some((m) => m.id === data.message.id)) draft.push(data.message);
            }),
          );
          dispatch(chatApi.util.invalidateTags(['Conversations']));
        } catch {
          // surfaced to the caller via the mutation result
        }
      },
    }),

    markConversationRead: builder.mutation<{ success?: boolean }, string>({
      query: (conversationId) => ({
        url: `conversations/${conversationId}/read`,
        method: 'POST',
      }),
      async onQueryStarted(conversationId, { dispatch, queryFulfilled, getState }) {
        const list = chatApi.endpoints.getConversations.select()(getState() as RootState).data;
        const clearing = list?.find((c) => c.id === conversationId)?.unreadCount ?? 0;

        const listPatch = dispatch(
          chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
            const convo = draft.find((c) => c.id === conversationId);
            if (convo) convo.unreadCount = 0;
          }),
        );
        const countPatch = dispatch(
          chatApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.count = Math.max(0, draft.count - clearing);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          countPatch.undo();
        }
      },
    }),

    // Always-mounted (navbar badge) — also owns the realtime socket so incoming
    // messages update every chat cache app-wide, not just on the messages page.
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => 'unread-count',
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch, getState },
      ) {
        const token = (getState() as RootState).auth.token;
        if (!token) return;

        const socket = io(`${httpBase}/chat`, {
          extraHeaders: { authorization: `Bearer ${token}` },
        });

        try {
          await cacheDataLoaded;

          socket.on(
            'chat:message',
            ({ conversationId, message }: { conversationId: string; message: ChatMessage }) => {
              const myId = (getState() as RootState).auth.user?.id;
              const fromOther = message.senderId !== myId;

              dispatch(
                chatApi.util.updateQueryData('getMessages', conversationId, (draft) => {
                  if (!draft.some((m) => m.id === message.id)) draft.push(message);
                }),
              );

              dispatch(
                chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
                  const idx = draft.findIndex((c) => c.id === conversationId);
                  if (idx === -1) {
                    dispatch(chatApi.util.invalidateTags(['Conversations']));
                    return;
                  }
                  const convo = draft[idx];
                  convo.lastMessage = message;
                  convo.lastMessageAt = message.createdAt;
                  if (fromOther) convo.unreadCount += 1;
                  draft.splice(idx, 1);
                  draft.unshift(convo);
                }),
              );

              if (fromOther) {
                updateCachedData((draft) => {
                  draft.count += 1;
                });
              }
            },
          );
        } catch {
          // cache entry removed before load resolved
        }

        await cacheEntryRemoved;
        socket.disconnect();
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useGetUnreadCountQuery,
} = chatApi;
