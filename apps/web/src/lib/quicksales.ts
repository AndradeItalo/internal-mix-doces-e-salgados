import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Payment } from './payments';

export type QuickSalePayment = {
  id: string;
  quickSaleId: string;
  amount: number;
  method: string;
  paidAt?: string;
  createdAt: string;
  quickSale?: {
    id: string;
    client?: {
      id: string;
      name: string;
    };
  };
};

export type QuickSaleItem = {
  id: string;
  quickSaleId: string;
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

export type QuickSale = {
  id: string;
  clientId?: string;
  total: number;
  createdAt: string;
  client?: {
    id: string;
    name: string;
  };
  items: QuickSaleItem[];
  payments?: QuickSalePayment[];
};

export const quickSalesApi = {
  list: () => apiGet<QuickSale[]>('/api/quick-sales'),
  get: (id: string) => apiGet<QuickSale>(`/api/quick-sales/${id}`),
  create: (data: Omit<QuickSale, 'id' | 'createdAt'>) => apiPost<QuickSale>('/api/quick-sales', data),
  update: (id: string, data: Partial<QuickSale>) => apiPut<QuickSale>(`/api/quick-sales/${id}`, data),
  remove: (id: string) => apiDelete(`/api/quick-sales/${id}`),
};

export const quickSalePaymentsApi = {
  list: () => apiGet<QuickSalePayment[]>('/api/quick-sale-payments'),
  getByQuickSale: (quickSaleId: string) => apiGet<QuickSalePayment[]>(`/api/quick-sale-payments/quick-sale/${quickSaleId}`),
  get: (id: string) => apiGet<QuickSalePayment>(`/api/quick-sale-payments/${id}`),
  create: (data: Omit<QuickSalePayment, 'id' | 'createdAt'>) => apiPost<QuickSalePayment>('/api/quick-sale-payments', data),
  update: (id: string, data: Partial<QuickSalePayment>) => apiPut<QuickSalePayment>(`/api/quick-sale-payments/${id}`, data),
  remove: (id: string) => apiDelete(`/api/quick-sale-payments/${id}`),
};
