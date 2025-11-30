import { ReminderService } from '../services/reminderService';

export class ReminderScheduler {
  private static intervalId: NodeJS.Timeout | null = null;

  // Iniciar o agendador
  static start() {
    if (this.intervalId) {
      console.log('Agendador de lembretes já está rodando');
      return;
    }

    console.log('Iniciando agendador de lembretes...');
    
    // Rodar imediatamente na primeira vez
    this.checkAndCreateReminders();
    
    // Agendar para rodar a cada 6 horas
    this.intervalId = setInterval(() => {
      this.checkAndCreateReminders();
    }, 6 * 60 * 60 * 1000); // 6 horas em milissegundos
    
    console.log('Agendador de lembretes iniciado - verificará a cada 6 horas');
  }

  // Parar o agendador
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Agendador de lembretes parado');
    }
  }

  // Verificar e criar lembretes (com tratamento de erro)
  private static async checkAndCreateReminders() {
    try {
      console.log(`[${new Date().toISOString()}] Verificando encomendas para criar lembretes...`);
      await ReminderService.checkOrdersAndCreateReminders();
      console.log(`[${new Date().toISOString()}] Verificação de lembretes concluída`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Erro na verificação automática de lembretes:`, error);
    }
  }

  // Forçar verificação manual
  static async forceCheck() {
    console.log('Forçando verificação manual de lembretes...');
    await this.checkAndCreateReminders();
  }
}
