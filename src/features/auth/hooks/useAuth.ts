'use client';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
  selectCurrentUser,
  selectTwoFAStep,
  selectAuthUserId,
  selectAuthStatus,
  selectAuthError,
} from '../store/authSelectors';
import { adminLoginThunk, verify2FAThunk, logoutThunk } from '../store/authThunks';
import type { AdminLoginPayload, TwoFAPayload } from '@/types';

export function useAuth() {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectCurrentUser);
  const twoFAStep = useAppSelector(selectTwoFAStep);
  const userId = useAppSelector(selectAuthUserId);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  return {
    currentUser,
    twoFAStep,
    userId,
    status,
    error,
    // isAuthenticated derived from currentUser presence — token is no longer
    // in Redux state (localStorage only) to avoid third exposure point.
    isAuthenticated: !!currentUser,
    adminLogin: (payload: AdminLoginPayload) => dispatch(adminLoginThunk(payload)),
    verify2FA: (payload: TwoFAPayload) => dispatch(verify2FAThunk(payload)),
    logout: () => dispatch(logoutThunk()),
  };
}
