import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import productsReducer, { setFilters, clearMutationStatus } from '../store/productsSlice';
import { fetchProducts } from '../store/productsThunks';
import type { Product } from '@/types';

function makeStore() {
  return configureStore({ reducer: { products: productsReducer } });
}

const mockProduct: Product = {
  _id: 'prod1',
  name: 'Laptop',
  description: 'Fast laptop',
  price: 999,
  category: 'electronics',
  images: [],
  stock: 10,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('productsSlice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts with idle listStatus', () => {
    expect(store.getState().products.listStatus).toBe('idle');
  });

  it('sets listStatus to loading on fetchProducts.pending', () => {
    store.dispatch({ type: fetchProducts.pending.type });
    expect(store.getState().products.listStatus).toBe('loading');
  });

  it('populates items on fetchProducts.fulfilled', () => {
    store.dispatch({
      type: fetchProducts.fulfilled.type,
      payload: {
        data: { products: [mockProduct] },
        pagination: { currentPage: 1, totalPages: 1, limit: 10, hasNextPage: false, hasPrevPage: false, totalProducts: 1 },
      },
    });
    const state = store.getState().products;
    expect(state.listStatus).toBe('succeeded');
    expect(state.items).toHaveLength(1);
    expect(state.items[0]._id).toBe('prod1');
    expect(state.pagination?.totalProducts).toBe(1);
  });

  it('setFilters resets page to 1 when non-page filter changes', () => {
    store.dispatch(setFilters({ page: 3 }));
    store.dispatch(setFilters({ search: 'laptop' }));
    expect(store.getState().products.filters.page).toBe(1);
    expect(store.getState().products.filters.search).toBe('laptop');
  });

  it('setFilters preserves explicit page when only page changes', () => {
    store.dispatch(setFilters({ page: 4 }));
    expect(store.getState().products.filters.page).toBe(4);
  });

  it('clearMutationStatus resets all mutation states', () => {
    store.dispatch({ type: 'products/create/pending' });
    store.dispatch(clearMutationStatus());
    const state = store.getState().products;
    expect(state.createStatus).toBe('idle');
    expect(state.updateStatus).toBe('idle');
    expect(state.deleteStatus).toBe('idle');
  });

  it('soft-deletes product on deleteProduct.fulfilled', () => {
    store.dispatch({
      type: fetchProducts.fulfilled.type,
      payload: {
        data: { products: [mockProduct] },
        pagination: { currentPage: 1, totalPages: 1, limit: 10, hasNextPage: false, hasPrevPage: false, totalProducts: 1 },
      },
    });
    store.dispatch({
      type: 'products/delete/fulfilled',
      payload: { _id: 'prod1', name: 'Laptop', isActive: false },
    });
    expect(store.getState().products.items[0].isActive).toBe(false);
  });
});
