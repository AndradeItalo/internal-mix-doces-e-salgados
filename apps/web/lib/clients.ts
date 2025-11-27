import { apiGet, apiPost, apiPut, apiDelete } from './api';

export type Client = {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
};

export const clientsApi = {
  list: () => apiGet<Client[]>('/api/clients'),
  get: (id: string) => apiGet<Client>(`/api/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'createdAt'>) => apiPost<Client>('/api/clients', data),
  update: (id: string, data: Partial<Client>) => apiPut<Client>(`/api/clients/${id}`, data),
  remove: (id: string) => apiDelete(`/api/clients/${id}`),
};
