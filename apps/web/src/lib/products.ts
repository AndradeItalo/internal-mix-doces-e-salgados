import { apiGet, apiPost, apiPut } from './api';

export type ProductVariant = {
  id: string;
  productId: string;
  flavor: string;
  price: number;
  stock: number;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  variants: ProductVariant[];
};

export type ProductUpsert = {
  name: string;
  variants: Array<{
    id?: string;
    flavor: string;
    price: number;
    stock: number;
  }>;
};

export const productsApi = {
  list: () => apiGet<Product[]>('/api/products'),
  get: (id: string) => apiGet<Product>(`/api/products/${id}`),
  create: (data: ProductUpsert) => apiPost<Product>('/api/products', data),
  update: (id: string, data: Partial<ProductUpsert>) => apiPut<Product>(`/api/products/${id}`, data),
};
