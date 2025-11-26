export interface QuickSale {
  id: string;
  produtoId: string;
  produto: string;
  quantidade: number;
  valorTotal: number;
  data: string; // ISO date
  cliente?: string;
}

export const mockQuickSales: QuickSale[] = [
  {
    id: "1",
    produtoId: "1",
    produto: "Brigadeiro Gourmet",
    quantidade: 10,
    valorTotal: 35,
    data: "2025-11-24",
    cliente: "Cliente balcão"
  }
];
