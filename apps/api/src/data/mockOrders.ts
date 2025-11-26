export interface OrderItem {
  produtoId: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Order {
  id: string;
  clienteId: string;
  cliente: string;
  dataCriacao: string; // ISO date
  dataEntrega: string; // ISO date
  status: "pendente" | "concluido" | "cancelado";
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    id: "1",
    clienteId: "1",
    cliente: "Maria Silva",
    dataCriacao: "2025-11-20",
    dataEntrega: "2025-11-25",
    status: "pendente",
    valorTotal: 200,
    valorPago: 100,
    valorPendente: 100,
    items: [
      { produtoId: "1", produto: "Brigadeiro Gourmet", quantidade: 20, valorUnitario: 3.5 },
      { produtoId: "2", produto: "Coxinha", quantidade: 10, valorUnitario: 6 }
    ]
  }
];
