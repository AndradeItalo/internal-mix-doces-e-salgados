import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './api';

export type Reminder = {
  id: string;
  message: string;
  remindAt: string;
  createdAt: string;
  isCompleted: boolean;
};

export const remindersApi = {
  list: () => apiGet<Reminder[]>('/api/reminders'),
  get: (id: string) => apiGet<Reminder>(`/api/reminders/${id}`),
  create: (data: Omit<Reminder, 'id' | 'createdAt'>) => apiPost<Reminder>('/api/reminders', data),
  update: (id: string, data: Partial<Reminder>) => apiPut<Reminder>(`/api/reminders/${id}`, data),
  complete: (id: string) => apiPatch<Reminder>(`/api/reminders/${id}/complete`, {}),
  remove: (id: string) => apiDelete(`/api/reminders/${id}`),
};