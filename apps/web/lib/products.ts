import { apiGet, apiPost, apiPut } from './api';

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
};

export const productsApi = {
  list: () => apiGet<Product[]>('/api/products'),
  get: (id: string) => apiGet<Product>(`/api/products/${id}`),
  create: (data: Omit<Product, 'id' | 'createdAt'>) => apiPost<Product>('/api/products', data),
  update: (id: string, data: Partial<Product>) => apiPut<Product>(`/api/products/${id}`, data),
};
