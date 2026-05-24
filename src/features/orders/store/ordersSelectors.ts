import type { RootState } from '@/core/store/store';

export const selectAllOrders = (state: RootState) => state.orders.items;
export const selectOrdersPagination = (state: RootState) => state.orders.pagination;
export const selectOrdersListStatus = (state: RootState) => state.orders.listStatus;
export const selectOrdersListError = (state: RootState) => state.orders.listError;
export const selectSelectedOrder = (state: RootState) => state.orders.selected;
export const selectOrderDetailStatus = (state: RootState) => state.orders.detailStatus;
export const selectOrderUpdateStatus = (state: RootState) => state.orders.updateStatus;
export const selectOrderUpdateError = (state: RootState) => state.orders.updateError;
