import { configureStore, combineReducers, createListenerMiddleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { publicApi } from './api/publicApi';
import { chatApi } from './api/chatApi';
import authReducer, { logout, setCredentials } from './slices/authSlice';
import guestChatReducer from './slices/guestChatSlice';
import type { UnknownAction } from '@reduxjs/toolkit';

const appReducer = combineReducers({
  auth: authReducer,
  guestChat: guestChatReducer,
  [authApi.reducerPath]: authApi.reducer,
  [publicApi.reducerPath]: publicApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (state && action.type === logout.type) {
    // Clear the non-API slices here. The API caches must NOT be wiped by the
    // reducer: RTK Query keeps its subscriptions in the middleware, so mounted
    // hooks would never refetch and would stay "loading" until a page refresh.
    // They are reset through resetApiState by the listener below instead.
    state = { ...state, auth: undefined, guestChat: undefined } as unknown as typeof state;
  }
  return appReducer(state, action);
};

// On logout, drop user-specific caches the supported way, so every mounted
// query hook refetches (now without a token).
const logoutListener = createListenerMiddleware();
logoutListener.startListening({
  actionCreator: logout,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(authApi.util.resetApiState());
    listenerApi.dispatch(publicApi.util.resetApiState());
    listenerApi.dispatch(chatApi.util.resetApiState());
  },
});

// On login, refetch public data: logged-out responses leave out details
// (e.g. announcement descriptions) that a logged-in user should get.
logoutListener.startListening({
  actionCreator: setCredentials,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(publicApi.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(logoutListener.middleware).concat(authApi.middleware, publicApi.middleware, chatApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
