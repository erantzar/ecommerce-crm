import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { parseApiError } from '@/core/http/apiError';
import type { AdminLoginPayload, TwoFAPayload, AdminUser } from '@/types';

/** Safely decode a JWT payload without verifying the signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    return JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/**
 * Called once on app mount when a token already exists in localStorage.
 * Restores `tokenExpiresAt` from the JWT payload so `useTokenExpiry` works
 * correctly across page refreshes, and re-fetches the user profile to
 * confirm the token is still accepted server-side.
 */
export const bootstrapAdminThunk = createAsyncThunk<
  { user: AdminUser; expiresAt: number } | null,
  void,
  { rejectValue: string }
>('auth/bootstrap', async (_, { rejectWithValue }) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('crm_admin_token') : null;
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    localStorage.removeItem('crm_admin_token');
    return null;
  }

  const expiresAt = (payload.exp as number) * 1000;
  if (expiresAt < Date.now()) {
    // Already expired — clean up before the server call
    localStorage.removeItem('crm_admin_token');
    return null;
  }

  try {
    const res = await authService.getMe();
    return { user: res.data.data, expiresAt };
  } catch {
    // Token rejected server-side (revoked, etc.) — clear storage
    localStorage.removeItem('crm_admin_token');
    return rejectWithValue('Session expired');
  }
});

export const adminLoginThunk = createAsyncThunk(
  'auth/adminLogin',
  async (payload: AdminLoginPayload, { rejectWithValue }) => {
    try {
      const res = await authService.adminLogin(payload);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const verify2FAThunk = createAsyncThunk(
  'auth/verify2FA',
  async (payload: TwoFAPayload, { rejectWithValue }) => {
    try {
      const res = await authService.verify2FA(payload);
      const { token } = res.data.data;
      localStorage.setItem('crm_admin_token', token);
      document.cookie = `crm_admin_token=${token}; Secure; SameSite=Strict; Max-Age=3600; path=/`;
      return token;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const fetchMeThunk = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getMe();
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (e) {
      // Always proceed with client-side cleanup — but log so server-side
      // token invalidation failures (tokenInvalidatedAt not set) are visible.
      console.warn('Logout server call failed — token may remain valid server-side:', e);
    }
    localStorage.removeItem('crm_admin_token');
    document.cookie = 'crm_admin_token=; Secure; SameSite=Strict; Max-Age=0; path=/';
    window.location.replace('/login');
  },
);
