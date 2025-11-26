export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
}

export const mockClients: Client[] = [
  { id: "1", nome: "Maria Silva", telefone: "(11) 99999-1111", email: "maria@example.com" },
  { id: "2", nome: "João Santos", telefone: "(11) 98888-2222", email: "joao@example.com" }
];
