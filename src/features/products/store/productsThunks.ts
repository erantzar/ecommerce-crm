import { createAsyncThunk } from '@reduxjs/toolkit';
import { productsService } from '../services/productsService';
import { parseApiError } from '@/core/http/apiError';
import type { ProductFilters } from '@/types';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const res = await productsService.getProducts(filters);
      return res.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await productsService.getProductById(id);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await productsService.createProduct(formData);
      return res.data; // Product
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const res = await productsService.updateProduct(id, formData);
      return res.data.product; // Product (update response nests under data.product)
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await productsService.deleteProduct(id);
      return res.data.data.product;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);
