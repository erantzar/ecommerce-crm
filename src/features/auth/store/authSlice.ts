import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '@/types';
import {
  adminLoginThunk,
  verify2FAThunk,
  fetchMeThunk,
  logoutThunk,
  bootstrapAdminThunk,
} from './authThunks';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour (mirrors backend JWT expiry)

const initialState: AuthState = {
  // token intentionally removed from state — it lives in localStorage only.
  // Storing the raw JWT in Redux creates a third exposure point accessible
  // to Redux DevTools and window.__REDUX_DEVTOOLS_EXTENSION__.
  userId: null,
  currentUser: null,
  twoFAStep: false,
  status: 'idle',
  error: null,
  tokenExpiresAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: () => initialState,
    clearTwoFAStep(state) {
      state.twoFAStep = false;
      state.userId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Bootstrap (page refresh with existing token) ────────────────────────
    builder
      .addCase(bootstrapAdminThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentUser = action.payload.user;
          state.tokenExpiresAt = action.payload.expiresAt;
          state.status = 'succeeded';
        }
      })
      .addCase(bootstrapAdminThunk.rejected, () => initialState);

    // ── Step 1: email + password ─────────────────────────────────────────────
    builder
      .addCase(adminLoginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(adminLoginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userId = action.payload.userId;
        state.twoFAStep = true;
      })
      .addCase(adminLoginThunk.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message ?? 'Login failed';
      });

    // ── Step 2: 2FA code ─────────────────────────────────────────────────────
    builder
      .addCase(verify2FAThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verify2FAThunk.fulfilled, (state) => {
        // Raw token is NOT stored in Redux — it's already written to localStorage
        // and the non-HttpOnly cookie inside verify2FAThunk itself.
        state.status = 'succeeded';
        state.twoFAStep = false;
        state.tokenExpiresAt = Date.now() + TOKEN_EXPIRY_MS;
      })
      .addCase(verify2FAThunk.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message ?? '2FA verification failed';
      });

    // ── Profile fetch ────────────────────────────────────────────────────────
    builder.addCase(fetchMeThunk.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });

    // ── Logout ───────────────────────────────────────────────────────────────
    builder.addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const { clearAuth, clearTwoFAStep } = authSlice.actions;
export default authSlice.reducer;
