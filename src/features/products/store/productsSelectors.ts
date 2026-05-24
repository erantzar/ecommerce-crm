import type { RootState } from '@/core/store/store';

export const selectAllProducts = (state: RootState) => state.products.items;
export const selectProductsPagination = (state: RootState) => state.products.pagination;
export const selectProductsFilters = (state: RootState) => state.products.filters;
export const selectProductsListStatus = (state: RootState) => state.products.listStatus;
export const selectProductsListError = (state: RootState) => state.products.listError;
export const selectSelectedProduct = (state: RootState) => state.products.selected;
export const selectProductDetailStatus = (state: RootState) => state.products.detailStatus;
export const selectProductCreateStatus = (state: RootState) => state.products.createStatus;
export const selectProductUpdateStatus = (state: RootState) => state.products.updateStatus;
export const selectProductDeleteStatus = (state: RootState) => state.products.deleteStatus;
export const selectProductMutationError = (state: RootState) => state.products.mutationError;
