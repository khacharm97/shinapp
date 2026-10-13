import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { publicApi } from './api/publicApi';
import { chatApi } from './api/chatApi';
import authReducer from './slices/authSlice';
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
  if (action.type === 'auth/logout') {
    // Reset the entire store on logout to clear user-specific RTK Query caches
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, publicApi.middleware, chatApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
