import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Listar todos os pagamentos de vendas rápidas
router.get("/", async (req: Request, res: Response) => {
  try {
    const payments = await prisma.quickSalePayment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        quickSale: {
          include: {
            client: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    res.json(payments);
  } catch (error) {
    console.error("Erro ao buscar pagamentos de vendas rápidas", error);
    res.status(500).json({ message: "Erro ao buscar pagamentos de vendas rápidas" });
  }
});

// Buscar pagamentos de uma venda rápida específica
router.get("/quick-sale/:quickSaleId", async (req: Request, res: Response) => {
  try {
    const payments = await prisma.quickSalePayment.findMany({
      where: { quickSaleId: req.params.quickSaleId },
      orderBy: { paidAt: "desc" }
    });
    res.json(payments);
  } catch (error) {
    console.error("Erro ao buscar pagamentos da venda rápida", error);
    res.status(500).json({ message: "Erro ao buscar pagamentos da venda rápida" });
  }
});

// Buscar um pagamento específico
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const payment = await prisma.quickSalePayment.findUnique({
      where: { id: req.params.id },
      include: {
        quickSale: {
          include: {
            client: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Erro ao buscar pagamento", error);
    res.status(500).json({ message: "Erro ao buscar pagamento" });
  }
});

// Criar um novo pagamento para venda rápida
router.post("/", async (req: Request, res: Response) => {
  try {
    const { quickSaleId, amount, method, paidAt } = req.body;

    // Validar se a venda rápida existe
    const quickSale = await prisma.quickSale.findUnique({
      where: { id: quickSaleId },
      include: { payments: true }
    });

    if (!quickSale) {
      return res.status(404).json({ message: "Venda rápida não encontrada" });
    }

    // Validar se o valor do pagamento não excede o total
    const totalPaid = quickSale.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    if (totalPaid + amount > quickSale.total) {
      return res.status(400).json({ message: "Valor do pagamento excede o total da venda" });
    }

    const payment = await prisma.quickSalePayment.create({
      data: {
        quickSaleId,
        amount,
        method,
        paidAt: paidAt ? new Date(paidAt) : new Date()
      },
      include: {
        quickSale: {
          include: {
            client: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Erro ao criar pagamento", error);
    res.status(500).json({ message: "Erro ao criar pagamento" });
  }
});

// Atualizar um pagamento
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { amount, method, paidAt } = req.body;

    // Buscar pagamento atual com a venda rápida
    const currentPayment = await prisma.quickSalePayment.findUnique({
      where: { id: req.params.id },
      include: {
        quickSale: {
          include: { payments: true }
        }
      }
    });

    if (!currentPayment) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    // Calcular o total pago sem o pagamento atual
    const otherPayments = currentPayment.quickSale.payments.filter((p: any) => p.id !== req.params.id);
    const totalPaid = otherPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

    // Validar se o novo valor não excede o total
    if (totalPaid + amount > currentPayment.quickSale.total) {
      return res.status(400).json({ message: "Valor do pagamento excede o total da venda" });
    }

    // Converter a data corretamente para evitar problemas de timezone
    let paidAtDate: Date | undefined = undefined;
    if (paidAt) {
      // Se for uma string ISO, criar mantendo a data local
      if (typeof paidAt === 'string') {
        const date = new Date(paidAt);
        // Ajustar para manter a data correta (evitar timezone shift)
        paidAtDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      }
    }

    const payment = await prisma.quickSalePayment.update({
      where: { id: req.params.id },
      data: {
        amount,
        method,
        paidAt: paidAtDate,
      },
      include: {
        quickSale: {
          include: {
            client: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.json(payment);
  } catch (error) {
    console.error("Erro ao atualizar pagamento", error);
    res.status(500).json({ message: "Erro ao atualizar pagamento" });
  }
});

// Excluir um pagamento
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const payment = await prisma.quickSalePayment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    await prisma.quickSalePayment.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir pagamento", error);
    res.status(500).json({ message: "Erro ao excluir pagamento" });
  }
});

export default router;
