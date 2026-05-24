import axiosClient from '@/core/http/axiosClient';
import type { Order, OrderStatus, PaginationMeta } from '@/types';

export interface OrdersListResponse {
  status: string;
  results: number;
  pagination: PaginationMeta;
  data: Order[];
}

export interface OrderResponse {
  status: string;
  data: Order;
}

export const ordersService = {
  getOrders: (params: { page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return axiosClient.get<OrdersListResponse>(`/orders/?${query.toString()}`);
  },

  getOrderById: (id: string) =>
    axiosClient.get<OrderResponse>(`/orders/${id}`),

  updateOrderStatus: (id: string, orderStatus: OrderStatus) =>
    axiosClient.put<OrderResponse>(`/orders/${id}/status`, { orderStatus }),

  cancelOrder: (id: string) =>
    axiosClient.put<OrderResponse>(`/orders/${id}/cancel`),
};
