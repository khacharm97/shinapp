import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// A not-logged-in visitor who writes to support chat gets a guest session
// from the backend. It is kept apart from `auth` on purpose: the token only
// works for chat, and holding it must never make the app treat the visitor
// as logged in.
interface GuestChatState {
  token: string | null;
  userId: string | null;
}

const STORAGE_KEY = 'guest_chat';

function loadGuestChat(): GuestChatState {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored?.token && stored?.userId) {
      return { token: stored.token, userId: stored.userId };
    }
  } catch {
    // corrupted entry - start without a session
  }
  return { token: null, userId: null };
}

const guestChatSlice = createSlice({
  name: 'guestChat',
  // Lazy, so the store reset on logout re-reads the saved session.
  initialState: loadGuestChat,
  reducers: {
    setGuestSession: (
      state,
      action: PayloadAction<{ token: string; userId: string }>
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    clearGuestSession: (state) => {
      state.token = null;
      state.userId = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setGuestSession, clearGuestSession } = guestChatSlice.actions;
export default guestChatSlice.reducer;
