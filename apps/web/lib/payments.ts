import { apiGet, apiPost, apiPut, apiDelete } from './api';

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  paidAt?: string;
  createdAt: string;
};

export const paymentsApi = {
  list: () => apiGet<Payment[]>('/api/payments'),
  get: (id: string) => apiGet<Payment>(`/api/payments/${id}`),
  create: (data: Omit<Payment, 'id' | 'createdAt'>) => apiPost<Payment>('/api/payments', data),
  update: (id: string, data: Partial<Payment>) => apiPut<Payment>(`/api/payments/${id}`, data),
  remove: (id: string) => apiDelete(`/api/payments/${id}`),
};
