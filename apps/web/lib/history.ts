import { apiGet } from './api';

export interface HistoryStats {
  totalVendas: number;
  totalEncomendas: number;
  totalVendasRapidas: number;
  quantidadeEncomendas: number;
  ticketMedio: number;
  crescimento: number;
}

export interface SalesByMonth {
  mes: string;
  vendas: number;
}

export interface TopProduct {
  id: string;
  nome: string;
  quantidade: number;
  total: number;
}

export const historyApi = {
  getStats: (filters?: { month?: string; productId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.month && filters.month !== 'todos') params.append('month', filters.month);
    if (filters?.productId && filters.productId !== 'todos') params.append('productId', filters.productId);
    const query = params.toString();
    return apiGet<HistoryStats>(`/api/history/stats${query ? `?${query}` : ''}`);
  },
  
  getSalesByMonth: (productId?: string) => {
    const params = new URLSearchParams();
    if (productId && productId !== 'todos') params.append('productId', productId);
    const query = params.toString();
    return apiGet<SalesByMonth[]>(`/api/history/sales-by-month${query ? `?${query}` : ''}`);
  },
  
  getTopProducts: (filters?: { month?: string; productId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.month && filters.month !== 'todos') params.append('month', filters.month);
    if (filters?.productId && filters.productId !== 'todos') params.append('productId', filters.productId);
    const query = params.toString();
    return apiGet<TopProduct[]>(`/api/history/top-products${query ? `?${query}` : ''}`);
  }
};
