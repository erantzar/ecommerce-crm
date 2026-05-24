'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from './StatusBadge';
import { useOrders } from '../hooks/useOrders';
import { cancelOrder as cancelOrderThunk } from '../store/ordersThunks';
import type { Order } from '@/types';

export default function OrdersTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    orders,
    pagination,
    listStatus,
    cancelOrder,
    clearUpdateStatus,
  } = useOrders(page, pageSize);

  const isLoading = listStatus === 'loading';

  function handlePaginationChange(model: GridPaginationModel) {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this order?')) return;
    const result = await cancelOrder(id);
    if (cancelOrderThunk.fulfilled.match(result as never)) {
      toast.success('Order cancelled');
      clearUpdateStatus();
    } else {
      toast.error('Could not cancel — order may no longer be pending');
      clearUpdateStatus();
    }
  }

  const columns: GridColDef[] = [
    {
      field: '_id',
      headerName: 'Order ID',
      width: 130,
      renderCell: (params) => (
        <span className="font-mono text-xs">{(params.value as string).slice(-8)}</span>
      ),
    },
    { field: 'user', headerName: 'Customer', width: 130,
      renderCell: (params) => <span className="font-mono text-xs">{(params.value as string).slice(-8)}</span>,
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 70,
      renderCell: (params) => (params.value as Order['items']).length,
    },
    {
      field: 'totalprice',
      headerName: 'Total',
      width: 100,
      renderCell: (params) => `$${(params.value as number).toFixed(2)}`,
    },
    {
      field: 'paymentMethod',
      headerName: 'Payment',
      width: 100,
      renderCell: (params) => <span className="capitalize">{params.value as string}</span>,
    },
    {
      field: 'orderStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <StatusBadge status={params.value as Order['orderStatus']} />,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 110,
      renderCell: (params) =>
        new Date(params.value as string).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const order = params.row as Order;
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => router.push(`/orders/${order._id}`)}>
              View
            </Button>
            {order.orderStatus === 'pending' && (
              <Button size="sm" variant="destructive" onClick={() => handleCancel(order._id)}>
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row: Order) => row._id}
        rowCount={pagination?.totalOrders ?? orders.length}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 25, 50]}
        loading={isLoading}
        disableRowSelectionOnClick
        disableColumnResize
        disableColumnMenu
        autoHeight
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: false } }}
        sx={{ border: 'none' }}
      />
    </div>
  );
}

