import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, PaginationMeta, ProductFilters } from '@/types';
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productsThunks';
import { logoutThunk } from '@/features/auth/store/authThunks';

interface ProductsState {
  items: Product[];
  pagination: PaginationMeta | null;
  filters: ProductFilters;
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;
  selected: Product | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationError: string | null;
}

const initialState: ProductsState = {
  items: [],
  pagination: null,
  filters: { page: 1, limit: 10 },
  listStatus: 'idle',
  listError: null,
  selected: null,
  detailStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  mutationError: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      const { page, ...rest } = action.payload;
      const isNonPageChange = Object.keys(rest).length > 0;
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: isNonPageChange ? 1 : (page ?? state.filters.page),
      };
    },
    clearMutationStatus(state) {
      state.createStatus = 'idle';
      state.updateStatus = 'idle';
      state.deleteStatus = 'idle';
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.data.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.listError = payload?.message ?? 'Failed to load products';
      });

    builder
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading';
        state.selected = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state) => {
        state.detailStatus = 'failed';
      });

    builder
      .addCase(createProduct.pending, (state) => { state.createStatus = 'loading'; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.mutationError = payload?.message ?? 'Failed to create product';
      });

    builder
      .addCase(updateProduct.pending, (state) => { state.updateStatus = 'loading'; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.mutationError = payload?.message ?? 'Failed to update product';
      });

    builder
      .addCase(deleteProduct.pending, (state) => { state.deleteStatus = 'loading'; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], isActive: false };
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.mutationError = payload?.message ?? 'Failed to delete product';
      });

    builder.addCase(logoutThunk.fulfilled, () => initialState);
    builder.addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { setFilters, clearMutationStatus } = productsSlice.actions;
export default productsSlice.reducer;
