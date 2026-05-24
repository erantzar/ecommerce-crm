export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'credit' | 'paypal' | 'simulated';
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  city: string;
  street: string;
  houseNumber: number;
  zip: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalprice: number;
  shipingCost: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
