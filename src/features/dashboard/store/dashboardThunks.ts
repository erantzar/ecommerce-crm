import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '@/core/http/axiosClient';
import { parseApiError } from '@/core/http/apiError';
import type { AdminUser, Order } from '@/types';

export interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  approximateRevenue: number;
  recentOrders: Order[];
  allOrders: Order[];
  allUsers: AdminUser[];
}

interface OrderStatsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [usersRes, productsRes, statsRes, recentOrdersRes] = await Promise.all([
        // Only fetch the 3 fields the chart actually needs — not full user documents.
        // The total count comes from pagination.totalUsers, not users.length.
        axiosClient.get<{
          pagination: { totalUsers: number };
          data: Pick<AdminUser, '_id' | 'createdAt' | 'isVerified'>[];
        }>('/users/?fields=_id,createdAt,isVerified&limit=500'),
        axiosClient.get<{ pagination: { totalProducts: number } }>('/products/?limit=1'),
        axiosClient.get<{ data: OrderStatsData }>('/orders/stats'),
        axiosClient.get<{ data: Order[] }>('/orders/?limit=50'),
      ]);

      const users = Array.isArray(usersRes.data.data) ? usersRes.data.data : [];
      const orders: Order[] = Array.isArray(recentOrdersRes.data.data) ? recentOrdersRes.data.data : [];
      const stats = statsRes.data.data;

      return {
        totalUsers: usersRes.data.pagination?.totalUsers ?? users.length,
        totalProducts: productsRes.data.pagination?.totalProducts ?? 0,
        pendingOrders: stats.pendingOrders,
        approximateRevenue: stats.totalRevenue,
        recentOrders: orders.slice(0, 5),
        allOrders: orders,
        allUsers: users as AdminUser[],
      } satisfies DashboardMetrics;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);
