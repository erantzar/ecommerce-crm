import type { RootState } from '@/core/store/store';

// selectToken intentionally removed — the raw JWT is no longer stored in Redux.
// Read from localStorage directly if you need the token value outside axiosClient.
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectTwoFAStep = (state: RootState) => state.auth.twoFAStep;
export const selectAuthUserId = (state: RootState) => state.auth.userId;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectTokenExpiresAt = (state: RootState) => state.auth.tokenExpiresAt;
