'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/core/store/hooks';
import { updateOrderStatus, cancelOrder } from '../store/ordersThunks';
import { clearUpdateStatus } from '../store/ordersSlice';
import type { Order, OrderStatus } from '@/types';

const FORWARD_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

const STEP_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

interface Props {
  order: Order;
}

export default function OrderStatusStepper({ order }: Props) {
  const dispatch = useAppDispatch();
  const currentIdx = FORWARD_STEPS.indexOf(order.orderStatus);

  async function handleAdvance() {
    if (currentIdx === -1 || currentIdx >= FORWARD_STEPS.length - 1) return;
    const next = FORWARD_STEPS[currentIdx + 1];
    const result = await dispatch(updateOrderStatus({ id: order._id, orderStatus: next }));
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success(`Order moved to "${next}"`);
    } else {
      toast.error('Status update failed');
    }
    dispatch(clearUpdateStatus());
  }

  async function handleCancel() {
    if (!confirm('Cancel this order?')) return;
    const result = await dispatch(cancelOrder(order._id));
    if (cancelOrder.fulfilled.match(result)) {
      toast.success('Order cancelled');
    } else {
      toast.error('Cannot cancel — order is no longer pending');
    }
    dispatch(clearUpdateStatus());
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';

  return (
    <div className="space-y-4">
      {/* Progress track */}
      <div className="flex items-center gap-0">
        {FORWARD_STEPS.map((step, i) => {
          const done = i < currentIdx || isDelivered;
          const active = step === order.orderStatus && !isCancelled;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    done
                      ? 'bg-green-500 border-green-500 text-white'
                      : active
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs text-muted-foreground">{STEP_LABELS[step]}</span>
              </div>
              {i < FORWARD_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 ${done ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <p className="text-sm font-medium text-red-600">This order has been cancelled.</p>
      )}

      {/* Action buttons */}
      {!isCancelled && !isDelivered && (
        <div className="flex gap-2">
          {currentIdx < FORWARD_STEPS.length - 1 && (
            <Button onClick={handleAdvance} size="sm">
              Advance to {STEP_LABELS[FORWARD_STEPS[currentIdx + 1]]}
            </Button>
          )}
          {order.orderStatus === 'pending' && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              Cancel Order
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
