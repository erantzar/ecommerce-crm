import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer, { clearUpdateStatus } from '../store/ordersSlice';
import { fetchOrders, updateOrderStatus, cancelOrder } from '../store/ordersThunks';
import type { Order } from '@/types';

function makeStore() {
  return configureStore({ reducer: { orders: ordersReducer } });
}

const mockOrder: Order = {
  _id: 'order1',
  user: 'user1',
  items: [{ product: 'p1', name: 'Laptop', price: 999, image: '', quantity: 1 }],
  shippingAddress: { city: 'Tel Aviv', street: 'Main', houseNumber: 1, zip: '61000' },
  totalprice: 999,
  shipingCost: 0,
  paymentMethod: 'credit',
  paymentStatus: 'paid',
  orderStatus: 'pending',
  trackingNumber: '',
  notes: '',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('ordersSlice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts with idle listStatus', () => {
    expect(store.getState().orders.listStatus).toBe('idle');
  });

  it('sets listStatus to loading on fetchOrders.pending', () => {
    store.dispatch({ type: fetchOrders.pending.type });
    expect(store.getState().orders.listStatus).toBe('loading');
  });

  it('populates items on fetchOrders.fulfilled', () => {
    store.dispatch({
      type: fetchOrders.fulfilled.type,
      payload: {
        data: [mockOrder],
        pagination: { currentPage: 1, totalPages: 1, limit: 10, hasNextPage: false, hasPrevPage: false, totalOrders: 1 },
      },
    });
    const state = store.getState().orders;
    expect(state.listStatus).toBe('succeeded');
    expect(state.items).toHaveLength(1);
    expect(state.items[0]._id).toBe('order1');
  });

  it('updates specific order on updateOrderStatus.fulfilled', () => {
    store.dispatch({
      type: fetchOrders.fulfilled.type,
      payload: { data: [mockOrder], pagination: {} },
    });
    store.dispatch({
      type: updateOrderStatus.fulfilled.type,
      payload: { ...mockOrder, orderStatus: 'processing' },
    });
    expect(store.getState().orders.items[0].orderStatus).toBe('processing');
  });

  it('marks order as cancelled on cancelOrder.fulfilled', () => {
    store.dispatch({
      type: fetchOrders.fulfilled.type,
      payload: { data: [mockOrder], pagination: {} },
    });
    store.dispatch({
      type: cancelOrder.fulfilled.type,
      payload: { ...mockOrder, orderStatus: 'cancelled' },
    });
    expect(store.getState().orders.items[0].orderStatus).toBe('cancelled');
  });

  it('preserves existing status on cancelOrder.rejected', () => {
    store.dispatch({
      type: fetchOrders.fulfilled.type,
      payload: { data: [mockOrder], pagination: {} },
    });
    store.dispatch({ type: cancelOrder.rejected.type, payload: { message: 'Cannot cancel' } });
    expect(store.getState().orders.items[0].orderStatus).toBe('pending');
    expect(store.getState().orders.updateError).toBe('Cannot cancel');
  });

  it('clearUpdateStatus resets to idle', () => {
    store.dispatch({ type: updateOrderStatus.pending.type });
    store.dispatch(clearUpdateStatus());
    expect(store.getState().orders.updateStatus).toBe('idle');
    expect(store.getState().orders.updateError).toBeNull();
  });
});
