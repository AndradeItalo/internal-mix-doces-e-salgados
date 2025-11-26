export type ReminderType = "entrega" | "pagamento";

export interface Reminder {
  id: string;
  tipo: ReminderType;
  clienteId: string;
  cliente: string;
  encomendaId?: string;
  dataProgramada: string; // ISO date
  mensagem: string;
  concluido: boolean;
}

export const mockReminders: Reminder[] = [
  {
    id: "1",
    tipo: "entrega",
    clienteId: "1",
    cliente: "Maria Silva",
    encomendaId: "1",
    dataProgramada: "2025-11-24",
    mensagem: "Entregar doces aniversário",
    concluido: false
  }
];
