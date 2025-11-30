import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ReminderService } from "../services/reminderService";
import { parseDateSafe } from "../utils/dateUtils";

const router = Router();

// Listar todos os lembretes
router.get("/", async (req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: { remindAt: "asc" }
    });
    res.json(reminders);
  } catch (error) {
    console.error("Erro ao buscar lembretes", error);
    res.status(500).json({ message: "Erro ao buscar lembretes" });
  }
});

// Buscar um lembrete específico
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id }
    });

    if (!reminder) {
      return res.status(404).json({ message: "Lembrete não encontrado" });
    }

    res.json(reminder);
  } catch (error) {
    console.error("Erro ao buscar lembrete", error);
    res.status(500).json({ message: "Erro ao buscar lembrete" });
  }
});

// Criar novo lembrete manualmente (se necessário)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, remindAt } = req.body;

    if (!message || !remindAt) {
      return res.status(400).json({ 
        message: "Mensagem e data de lembrete são obrigatórios" 
      });
    }

    // Converter a data corretamente para evitar problemas de timezone
    const remindAtDate = parseDateSafe(remindAt);
    if (!remindAtDate) {
      return res.status(400).json({ 
        message: "Data de lembrete inválida" 
      });
    }

    const reminder = await prisma.reminder.create({
      data: { 
        message, 
        remindAt: remindAtDate
      }
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error("Erro ao criar lembrete", error);
    res.status(500).json({ message: "Erro ao criar lembrete" });
  }
});

// Atualizar lembrete
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { message, remindAt, isCompleted } = req.body;

    // Converter a data corretamente para evitar problemas de timezone
    const remindAtDate = parseDateSafe(remindAt);

    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: { 
        message,
        remindAt: remindAtDate,
        isCompleted
      }
    });

    res.json(reminder);
  } catch (error) {
    console.error("Erro ao atualizar lembrete", error);
    res.status(500).json({ message: "Erro ao atualizar lembrete" });
  }
});

// Marcar lembrete como concluído
router.patch("/:id/complete", async (req: Request, res: Response) => {
  try {
    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: { isCompleted: true }
    });

    res.json(reminder);
  } catch (error) {
    console.log(error)
    console.error("Erro ao marcar lembrete como concluído", error);
    res.status(500).json({ message: "Erro ao marcar lembrete como concluído" });
  }
});

// Excluir lembrete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.reminder.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir lembrete", error);
    res.status(500).json({ message: "Erro ao excluir lembrete" });
  }
});

// Endpoint para verificar encomendas e criar lembretes automaticamente
router.post("/check-orders", async (req: Request, res: Response) => {
  try {
    await ReminderService.checkOrdersAndCreateReminders();
    res.json({ message: "Verificação concluída com sucesso" });
  } catch (error) {
    console.error("Erro na verificação automática", error);
    res.status(500).json({ message: "Erro na verificação automática" });
  }
});

// Criar lembrete para encomenda específica
router.post("/from-order/:orderId", async (req: Request, res: Response) => {
  try {
    const reminder = await ReminderService.createReminderForOrder(req.params.orderId);
    res.status(201).json(reminder);
  } catch (error) {
    console.error("Erro ao criar lembrete da encomenda", error);
    res.status(500).json({ message: "Erro ao criar lembrete da encomenda" });
  }
});

export default router;
