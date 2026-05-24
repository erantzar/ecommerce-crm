import { createAsyncThunk } from '@reduxjs/toolkit';
import { ordersService } from '../services/ordersService';
import { parseApiError } from '@/core/http/apiError';
import type { OrderStatus } from '@/types';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const res = await ordersService.getOrders(params);
      return res.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await ordersService.getOrderById(id);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, orderStatus }: { id: string; orderStatus: OrderStatus }, { rejectWithValue }) => {
    try {
      const res = await ordersService.updateOrderStatus(id, orderStatus);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await ordersService.cancelOrder(id);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);
