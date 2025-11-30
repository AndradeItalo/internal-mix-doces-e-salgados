import { prisma } from "../lib/prisma";
import { parseDateSafe } from "../utils/dateUtils";

export class ReminderService {
  // Verificar encomendas e criar lembretes automaticamente
  static async checkOrdersAndCreateReminders() {
    try {
      console.log('Verificando encomendas para criar lembretes...');
      
      // Buscar encomendas com data de entrega futura
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Ajustar para meio-dia para evitar timezone shift
      tomorrow.setHours(12, 0, 0, 0);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      // Ajustar para meio-dia para evitar timezone shift
      nextWeek.setHours(12, 0, 0, 0);
      
      const orders = await prisma.order.findMany({
        where: {
          deliveryAt: {
            gte: tomorrow,
            lte: nextWeek
          },
          status: {
            not: 'entregue'
          }
        },
        include: {
          client: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      console.log(`Encontradas ${orders.length} encomendas para os próximos 7 dias`);
      
      for (const order of orders) {
        // Verificar se já existe lembrete para esta encomenda
        const existingReminder = await prisma.reminder.findFirst({
          where: {
            message: {
              contains: `#${order.id}`
            }
          }
        });
        
        if (!existingReminder) {
          // Criar lembrete 1 dia antes da entrega
          const deliveryAtDate = parseDateSafe(order.deliveryAt || undefined);
          if (!deliveryAtDate) continue;
          
          const reminderDate = new Date(deliveryAtDate);
          reminderDate.setDate(reminderDate.getDate() - 1);
          reminderDate.setHours(9, 0, 0, 0); // 9h da manhã
          
          await prisma.reminder.create({
            data: {
              message: `Entregar encomenda #${order.id} para ${order.client?.name || 'Cliente'}`,
              remindAt: reminderDate,
              isCompleted: false
            }
          });
          
          console.log(`Lembrete criado para encomenda #${order.id}`);
        }
      }
      
      console.log('Verificação de lembretes concluída');
    } catch (error) {
      console.error('Erro ao verificar encomendas e criar lembretes:', error);
    }
  }
  
  // Criar lembrete para uma encomenda específica
  static async createReminderForOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          client: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!order || !order.deliveryAt) {
        throw new Error('Encomenda não encontrada ou sem data de entrega');
      }
      
      // Verificar se já existe lembrete
      const existingReminder = await prisma.reminder.findFirst({
        where: {
          message: {
            contains: `#${order.id}`
          }
        }
      });
      
      if (existingReminder) {
        return existingReminder;
      }
      
      // Criar lembrete 1 dia antes
      const deliveryAtDate = parseDateSafe(order.deliveryAt);
      if (!deliveryAtDate) {
        throw new Error('Data de entrega inválida');
      }
      
      const reminderDate = new Date(deliveryAtDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0);
      
      const reminder = await prisma.reminder.create({
        data: {
          message: `Entregar encomenda #${order.id} para ${order.client?.name || 'Cliente'}`,
          remindAt: reminderDate,
          isCompleted: false
        }
      });
      
      return reminder;
    } catch (error) {
      console.error('Erro ao criar lembrete para encomenda:', error);
      throw error;
    }
  }
  
  // Remover lembrete quando encomenda é entregue
  static async removeReminderForOrder(orderId: string) {
    try {
      await prisma.reminder.deleteMany({
        where: {
          message: {
            contains: `#${orderId}`
          }
        }
      });
      
      console.log(`Lembretes removidos para encomenda #${orderId}`);
    } catch (error) {
      console.error('Erro ao remover lembretes da encomenda:', error);
    }
  }
}
