import { createSlice } from '@reduxjs/toolkit';
import type { Order, PaginationMeta } from '@/types';
import { fetchOrders, fetchOrderById, updateOrderStatus, cancelOrder } from './ordersThunks';
import { logoutThunk } from '@/features/auth/store/authThunks';

interface OrdersState {
  items: Order[];
  pagination: PaginationMeta | null;
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;
  selected: Order | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailError: string | null;
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateError: string | null;
}

const initialState: OrdersState = {
  items: [],
  pagination: null,
  listStatus: 'idle',
  listError: null,
  selected: null,
  detailStatus: 'idle',
  detailError: null,
  updateStatus: 'idle',
  updateError: null,
};

function applyOrderUpdate(state: OrdersState, updated: Order) {
  const idx = state.items.findIndex((o) => o._id === updated._id);
  if (idx !== -1) state.items[idx] = updated;
  if (state.selected?._id === updated._id) state.selected = updated;
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearUpdateStatus(state) {
      state.updateStatus = 'idle';
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.listStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.listError = payload?.message ?? 'Failed to load orders';
      });

    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.detailStatus = 'loading';
        state.selected = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.detailError = payload?.message ?? 'Order not found';
      });

    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        applyOrderUpdate(state, action.payload);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.updateError = payload?.message ?? 'Status update failed';
      });

    builder
      .addCase(cancelOrder.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        applyOrderUpdate(state, action.payload);
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.updateStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.updateError = payload?.message ?? 'Cancel failed';
      });

    builder.addCase(logoutThunk.fulfilled, () => initialState);
    builder.addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearUpdateStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
