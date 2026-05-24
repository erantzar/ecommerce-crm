import type { AdminUser } from './user.types';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  userId: string;
}

export interface TwoFAPayload {
  userId: string;
  code: string;
}

export interface TwoFAResponse {
  token: string;
}

export interface AuthState {
  // NOTE: The raw JWT is intentionally NOT stored here — it lives in
  // localStorage only. Storing it in Redux exposes it to DevTools and
  // window.__REDUX_DEVTOOLS_EXTENSION__. axiosClient reads it directly
  // from localStorage on every request.
  userId: string | null;
  currentUser: AdminUser | null;
  twoFAStep: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  tokenExpiresAt: number | null;
}
