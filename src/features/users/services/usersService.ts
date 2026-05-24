import axiosClient from '@/core/http/axiosClient';
import type { AdminUser, UserRole, ApiResponse } from '@/types';

export const usersService = {
  getAllUsers: () =>
    axiosClient.get<ApiResponse<AdminUser[]>>('/users/'),

  updateUserRole: (id: string, role: UserRole) =>
    axiosClient.put<ApiResponse<AdminUser>>(`/users/role/${id}`, { role }),

  deleteUser: (id: string) =>
    axiosClient.delete<ApiResponse<null>>(`/users/${id}`),
};
