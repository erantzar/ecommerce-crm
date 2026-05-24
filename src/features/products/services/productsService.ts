import axiosClient, { uploadWithFiles } from '@/core/http/axiosClient';
import type { Product, ProductFilters, PaginationMeta } from '@/types';

export interface ProductsListResponse {
  products: Product[];
}

export interface ProductsApiResponse {
  status: string;
  results: number;
  pagination: PaginationMeta;
  data: ProductsListResponse;
}

export interface ProductApiResponse {
  status: string;
  data: Product;
}

// Update endpoint wraps the product one level deeper: data.product
export interface ProductUpdateApiResponse {
  status: string;
  data: { product: Product };
}

export interface DeleteProductResponse {
  status: string;
  message: string;
  data: { product: { _id: string; name: string; isActive: boolean } };
}

export const productsService = {
  getProducts: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    });
    return axiosClient.get<ProductsApiResponse>(`/products/?${params.toString()}`);
  },

  getProductById: (id: string) =>
    axiosClient.get<ProductApiResponse>(`/products/${id}`),

  createProduct: (formData: FormData) =>
    uploadWithFiles<ProductApiResponse>('/products/', formData, 'post'),

  updateProduct: (id: string, formData: FormData) =>
    uploadWithFiles<ProductUpdateApiResponse>(`/products/${id}`, formData, 'put'),

  deleteProduct: (id: string) =>
    axiosClient.delete<DeleteProductResponse>(`/products/${id}`),

  deleteRating: (productId: string, ratingId: string) =>
    axiosClient.delete(`/products/${productId}/rating/${ratingId}`),
};
