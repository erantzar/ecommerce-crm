'use client';

import { useTokenExpiry } from '@/features/auth/hooks/useTokenExpiry';

export default function TokenExpiryWatcher() {
  useTokenExpiry();
  return null;
}
