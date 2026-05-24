import axios from 'axios';
import type { Dispatch } from '@reduxjs/toolkit';
import { clearAuth } from '@/features/auth/store/authSlice';

let _dispatch: Dispatch | null = null;

export function injectDispatch(dispatch: Dispatch) {
  _dispatch = dispatch;
}

const axiosClient = axios.create({
  baseURL: '/api/backend',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('crm_admin_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        // Skip the forced redirect during an intentional logout — logoutThunk
        // already handles cleanup and navigation itself.
        const isLogout = error.config?.url?.includes('/auth/logout');
        if (!isLogout && typeof window !== 'undefined') {
          localStorage.removeItem('crm_admin_token');
          document.cookie =
            'crm_admin_token=; Secure; SameSite=Strict; Max-Age=0; path=/';
          _dispatch?.(clearAuth());
          // Use replace() so the protected page is not left in browser history.
          // Preserve the current path so the admin lands back here after re-login.
          const returnTo = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          window.location.replace(`/login?redirect=${returnTo}`);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

/** Use for product create/update — sets multipart/form-data per-request */
export async function uploadWithFiles<T>(
  url: string,
  formData: FormData,
  method: 'post' | 'put' = 'post',
): Promise<T> {
  const response = await axiosClient.request<T>({
    url,
    method,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
