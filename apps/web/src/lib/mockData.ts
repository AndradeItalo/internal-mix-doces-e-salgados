// Mock data for demonstration purposes

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  observacoes?: string;
  totalEncomendas: number;
  totalAberto: number;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  unidade: string;
  observacoes?: string;
}

export interface ItemEncomenda {
  produtoId: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Pagamento {
  id: string;
  valor: number;
  formaPagamento: string;
  data: string;
  observacao?: string;
}

export interface Encomenda {
  id: string;
  clienteId: string;
  cliente: string;
  items: ItemEncomenda[];
  dataEntrega: string;
  status: 'pendente' | 'parcial' | 'pago' | 'cancelado';
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  observacoes?: string;
  pagamentos: Pagamento[];
  dataCriacao: string;
}

export interface VendaRapida {
  id: string;
  produtoId: string;
  produto: string;
  quantidade: number;
  valorTotal: number;
  cliente?: string;
  data: string;
}

export interface Lembrete {
  id: string;
  tipo: 'entrega' | 'pagamento';
  dataProgramada: string;
  mensagem: string;
  clienteId: string;
  cliente: string;
  encomendaId?: string;
  status: 'pendente' | 'concluido' | 'atrasado';
}

// Mock data
export const mockClientes: Cliente[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    telefone: '(11) 98765-4321',
    observacoes: 'Prefere entregas pela manhã',
    totalEncomendas: 5,
    totalAberto: 250.00
  },
  {
    id: '2',
    nome: 'João Santos',
    telefone: '(11) 97654-3210',
    totalEncomendas: 3,
    totalAberto: 0
  },
  {
    id: '3',
    nome: 'Ana Costa',
    telefone: '(11) 96543-2109',
    observacoes: 'Alérgica a amendoim',
    totalEncomendas: 8,
    totalAberto: 180.00
  },
  {
    id: '4',
    nome: 'Pedro Oliveira',
    telefone: '(11) 95432-1098',
    totalEncomendas: 2,
    totalAberto: 350.00
  },
];

export const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Brigadeiro Gourmet',
    categoria: 'Doce',
    preco: 3.50,
    unidade: 'unidade',
    observacoes: 'Disponível em vários sabores'
  },
  {
    id: '2',
    nome: 'Bolo de Chocolate',
    categoria: 'Torta',
    preco: 80.00,
    unidade: 'unidade',
  },
  {
    id: '3',
    nome: 'Coxinha',
    categoria: 'Salgado',
    preco: 4.50,
    unidade: 'unidade',
  },
  {
    id: '4',
    nome: 'Bem Casado',
    categoria: 'Doce',
    preco: 5.00,
    unidade: 'unidade',
  },
  {
    id: '5',
    nome: 'Torta de Limão',
    categoria: 'Torta',
    preco: 90.00,
    unidade: 'unidade',
  },
  {
    id: '6',
    nome: 'Brownie',
    categoria: 'Doce',
    preco: 6.00,
    unidade: 'unidade',
  },
];

export const mockEncomendas: Encomenda[] = [
  {
    id: '1',
    clienteId: '1',
    cliente: 'Maria Silva',
    items: [
      { produtoId: '1', produto: 'Brigadeiro Gourmet', quantidade: 50, valorUnitario: 3.50, valorTotal: 175.00 },
      { produtoId: '2', produto: 'Bolo de Chocolate', quantidade: 1, valorUnitario: 80.00, valorTotal: 80.00 },
    ],
    dataEntrega: '2025-12-01',
    status: 'parcial',
    valorTotal: 255.00,
    valorPago: 100.00,
    valorPendente: 155.00,
    observacoes: 'Entregar até 14h',
    pagamentos: [
      {
        id: 'p1',
        valor: 100.00,
        formaPagamento: 'Pix',
        data: '2025-11-20',
        observacao: 'Entrada'
      }
    ],
    dataCriacao: '2025-11-20'
  },
  {
    id: '2',
    clienteId: '2',
    cliente: 'João Santos',
    items: [
      { produtoId: '3', produto: 'Coxinha', quantidade: 100, valorUnitario: 4.50, valorTotal: 450.00 },
    ],
    dataEntrega: '2025-11-30',
    status: 'pago',
    valorTotal: 450.00,
    valorPago: 450.00,
    valorPendente: 0,
    pagamentos: [
      {
        id: 'p2',
        valor: 450.00,
        formaPagamento: 'Dinheiro',
        data: '2025-11-25',
      }
    ],
    dataCriacao: '2025-11-22'
  },
  {
    id: '3',
    clienteId: '3',
    cliente: 'Ana Costa',
    items: [
      { produtoId: '4', produto: 'Bem Casado', quantidade: 80, valorUnitario: 5.00, valorTotal: 400.00 },
      { produtoId: '5', produto: 'Torta de Limão', quantidade: 2, valorUnitario: 90.00, valorTotal: 180.00 },
    ],
    dataEntrega: '2025-12-05',
    status: 'parcial',
    valorTotal: 580.00,
    valorPago: 200.00,
    valorPendente: 380.00,
    observacoes: 'Festa de casamento',
    pagamentos: [
      {
        id: 'p3',
        valor: 200.00,
        formaPagamento: 'Pix',
        data: '2025-11-23',
        observacao: 'Sinal'
      }
    ],
    dataCriacao: '2025-11-23'
  },
  {
    id: '4',
    clienteId: '4',
    cliente: 'Pedro Oliveira',
    items: [
      { produtoId: '1', produto: 'Brigadeiro Gourmet', quantidade: 100, valorUnitario: 3.50, valorTotal: 350.00 },
    ],
    dataEntrega: '2025-12-10',
    status: 'pendente',
    valorTotal: 350.00,
    valorPago: 0,
    valorPendente: 350.00,
    dataCriacao: '2025-11-25',
    pagamentos: []
  },
];

export const mockVendasRapidas: VendaRapida[] = [
  {
    id: '1',
    produtoId: '1',
    produto: 'Brigadeiro Gourmet',
    quantidade: 10,
    valorTotal: 35.00,
    data: '2025-11-26',
  },
  {
    id: '2',
    produtoId: '6',
    produto: 'Brownie',
    quantidade: 5,
    valorTotal: 30.00,
    cliente: 'Cliente Avulso',
    data: '2025-11-26',
  },
  {
    id: '3',
    produtoId: '3',
    produto: 'Coxinha',
    quantidade: 20,
    valorTotal: 90.00,
    data: '2025-11-25',
  },
];

export const mockLembretes: Lembrete[] = [
  {
    id: '1',
    tipo: 'entrega',
    dataProgramada: '2025-12-01',
    mensagem: 'Entrega de encomenda - 50 brigadeiros + bolo',
    clienteId: '1',
    cliente: 'Maria Silva',
    encomendaId: '1',
    status: 'pendente'
  },
  {
    id: '2',
    tipo: 'pagamento',
    dataProgramada: '2025-11-30',
    mensagem: 'Lembrar pagamento restante de R$ 155,00',
    clienteId: '1',
    cliente: 'Maria Silva',
    encomendaId: '1',
    status: 'pendente'
  },
  {
    id: '3',
    tipo: 'entrega',
    dataProgramada: '2025-12-05',
    mensagem: 'Entrega de bem casados e tortas para casamento',
    clienteId: '3',
    cliente: 'Ana Costa',
    encomendaId: '3',
    status: 'pendente'
  },
  {
    id: '4',
    tipo: 'pagamento',
    dataProgramada: '2025-11-25',
    mensagem: 'Verificar pagamento restante',
    clienteId: '3',
    cliente: 'Ana Costa',
    encomendaId: '3',
    status: 'atrasado'
  },
];
