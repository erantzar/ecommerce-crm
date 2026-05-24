import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  processing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  shipped: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={`capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </Badge>
  );
}
