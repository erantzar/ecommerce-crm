import axiosClient from '@/core/http/axiosClient';
import type {
  AdminLoginPayload,
  AdminLoginResponse,
  TwoFAPayload,
  TwoFAResponse,
  AdminUser,
  ApiResponse,
} from '@/types';

export const authService = {
  adminLogin: (payload: AdminLoginPayload) =>
    axiosClient.post<ApiResponse<AdminLoginResponse>>('/auth/admin/login', payload),

  verify2FA: (payload: TwoFAPayload) =>
    axiosClient.post<ApiResponse<TwoFAResponse>>('/auth/admin/verify-2fa', payload),

  getMe: () =>
    axiosClient.get<ApiResponse<AdminUser>>('/users/me'),

  logout: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),
};
