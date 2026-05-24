'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
  selectAllProducts,
  selectProductsPagination,
  selectProductsFilters,
  selectProductsListStatus,
  selectProductsListError,
  selectProductCreateStatus,
  selectProductUpdateStatus,
  selectProductDeleteStatus,
  selectProductMutationError,
} from '../store/productsSelectors';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/productsThunks';
import { setFilters, clearMutationStatus } from '../store/productsSlice';
import type { ProductFilters } from '@/types';

export function useProducts() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const pagination = useAppSelector(selectProductsPagination);
  const filters = useAppSelector(selectProductsFilters);
  const listStatus = useAppSelector(selectProductsListStatus);
  const listError = useAppSelector(selectProductsListError);
  const createStatus = useAppSelector(selectProductCreateStatus);
  const updateStatus = useAppSelector(selectProductUpdateStatus);
  const deleteStatus = useAppSelector(selectProductDeleteStatus);
  const mutationError = useAppSelector(selectProductMutationError);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  return {
    products,
    pagination,
    filters,
    listStatus,
    listError,
    createStatus,
    updateStatus,
    deleteStatus,
    mutationError,
    setFilters: (f: Partial<ProductFilters>) => dispatch(setFilters(f)),
    createProduct: (fd: FormData) => dispatch(createProduct(fd)),
    updateProduct: (id: string, fd: FormData) => dispatch(updateProduct({ id, formData: fd })),
    deleteProduct: (id: string) => dispatch(deleteProduct(id)),
    clearMutationStatus: () => dispatch(clearMutationStatus()),
  };
}
