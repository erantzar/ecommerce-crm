'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { fetchOrderById } from '@/features/orders/store/ordersThunks';
import { selectSelectedOrder, selectOrderDetailStatus } from '@/features/orders/store/ordersSelectors';
import OrderStatusStepper from '@/features/orders/components/OrderStatusStepper';
import StatusBadge from '@/features/orders/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectSelectedOrder);
  const status = useAppSelector(selectOrderDetailStatus);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-muted-foreground">Order not found.</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/orders" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold font-mono">Order …{order._id.slice(-10)}</h1>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Status stepper */}
      <Card>
        <CardHeader><CardTitle className="text-base">Manage Status</CardTitle></CardHeader>
        <CardContent>
          <OrderStatusStepper order={order} />
        </CardContent>
      </Card>

      {/* Order details */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.totalprice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Shipping</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{order.shippingAddress.street} {order.shippingAddress.houseNumber}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
            <p className="text-muted-foreground capitalize mt-2">Payment: {order.paymentMethod}</p>
            {order.notes && <p className="text-muted-foreground">Notes: {order.notes}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
