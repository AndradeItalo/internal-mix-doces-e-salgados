import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Payment } from './payments';

export type Order = {
  id: string;
  clientId: string;
  total: number;
  deliveryAt?: string;
  status: string;
  createdAt: string;
  payments?: Payment[];
  client?: { id: string; name: string };
};

export const ordersApi = {
  list: () => apiGet<Order[]>('/api/orders'),
  get: (id: string) => apiGet<Order>(`/api/orders/${id}`),
  create: (data: Omit<Order, 'id' | 'createdAt'>) => apiPost<Order>('/api/orders', data),
  update: (id: string, data: Partial<Order>) => apiPut<Order>(`/api/orders/${id}`, data),
  remove: (id: string) => apiDelete(`/api/orders/${id}`),
};
