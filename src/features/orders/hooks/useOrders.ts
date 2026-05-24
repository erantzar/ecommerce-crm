'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
  selectAllOrders,
  selectOrdersPagination,
  selectOrdersListStatus,
  selectOrdersListError,
  selectOrderUpdateStatus,
  selectOrderUpdateError,
} from '../store/ordersSelectors';
import { fetchOrders, updateOrderStatus, cancelOrder } from '../store/ordersThunks';
import { clearUpdateStatus } from '../store/ordersSlice';
import type { OrderStatus } from '@/types';

export function useOrders(page = 1, limit = 10) {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectAllOrders);
  const pagination = useAppSelector(selectOrdersPagination);
  const listStatus = useAppSelector(selectOrdersListStatus);
  const listError = useAppSelector(selectOrdersListError);
  const updateStatus = useAppSelector(selectOrderUpdateStatus);
  const updateError = useAppSelector(selectOrderUpdateError);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit }));
  }, [dispatch, page, limit]);

  return {
    orders,
    pagination,
    listStatus,
    listError,
    updateStatus,
    updateError,
    updateOrderStatus: (id: string, status: OrderStatus) =>
      dispatch(updateOrderStatus({ id, orderStatus: status })),
    cancelOrder: (id: string) => dispatch(cancelOrder(id)),
    clearUpdateStatus: () => dispatch(clearUpdateStatus()),
  };
}
