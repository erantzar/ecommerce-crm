'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectTokenExpiresAt } from '../store/authSelectors';
import { logoutThunk } from '../store/authThunks';

/**
 * Schedules a precise logout exactly when the token expires — no polling.
 *
 * Previous implementation used setInterval(check, 60_000), which left a
 * ~60-second window where an expired token could still be used. This version
 * calculates the exact remaining milliseconds and fires a single setTimeout,
 * giving a window of < 1ms instead of up to 60 000ms.
 *
 * If the app is idle for longer than the token lifetime (laptop sleep, etc.),
 * the timeout fires immediately on the next event loop tick when the tab
 * regains focus, since Date.now() will already be past the expiry.
 */
export function useTokenExpiry() {
  const dispatch = useAppDispatch();
  const tokenExpiresAt = useAppSelector(selectTokenExpiresAt);

  useEffect(() => {
    if (!tokenExpiresAt) return;

    const msUntilExpiry = tokenExpiresAt - Date.now();

    if (msUntilExpiry <= 0) {
      // Already expired (e.g. restored from a stale localStorage after sleep)
      dispatch(logoutThunk());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(logoutThunk());
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [dispatch, tokenExpiresAt]);
}
