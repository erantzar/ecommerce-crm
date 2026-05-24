'use client';

import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/core/store/store';
import { bootstrapAdminThunk } from '@/features/auth/store/authThunks';
import { setMode, type ThemeMode } from '@/features/theme/store/themeSlice';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';

const STORAGE_KEY = 'crm_theme';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const [hydrated, setHydrated] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isThemeMode(stored)) {
        dispatch(setMode(stored));
      }
    } catch {}

    // bootstrapAdminThunk reads the token from localStorage, extracts the
    // expiry from the JWT payload (restoring tokenExpiresAt across refreshes),
    // then calls GET /users/me to confirm the token is still valid server-side.
    dispatch(bootstrapAdminThunk());

    setHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', mode === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode, hydrated]);

  return <>{children}</>;
}

export default function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSync>{children}</ThemeSync>
    </Provider>
  );
}
