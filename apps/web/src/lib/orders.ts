import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Payment } from './payments';

export type OrderItem = {
  id: string;
  orderId: string;
  productId?: string;
  variantId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    flavor: string;
    productId: string;
    product?: {
      id: string;
      name: string;
    };
  };
};

export type Order = {
  id: string;
  clientId: string;
  total: number;
  deliveryAt?: string;
  deliveryHour?: string;
  notes?: string;
  status: string;
  createdAt: string;
  payments?: Payment[];
  client?: { id: string; name: string };
  items?: OrderItem[];
};

export type OrderCreateRequest = {
  clientId: string;
  deliveryAt?: string;
  deliveryHour?: string;
  notes?: string;
  status: string;
  items: Array<{ variantId: string; quantity: number; price: number }>;
};

export type OrderUpdateRequest = Partial<OrderCreateRequest> & {
  clientId?: string;
  total?: number;
};

export const ordersApi = {
  list: () => apiGet<Order[]>('/api/orders'),
  get: (id: string) => apiGet<Order>(`/api/orders/${id}`),
  create: (data: OrderCreateRequest) => apiPost<Order>('/api/orders', data),
  update: (id: string, data: OrderUpdateRequest) => apiPut<Order>(`/api/orders/${id}`, data),
  remove: (id: string) => apiDelete(`/api/orders/${id}`),
};
