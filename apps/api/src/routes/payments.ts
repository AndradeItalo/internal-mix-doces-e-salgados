import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { parseDateSafe } from "../utils/dateUtils";

const router = Router();

// Pagamentos derivados das encomendas (pendente/recebido)
router.get("/", async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        order: {
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
    console.error("Erro ao buscar pagamentos", error);
    res.status(500).json({ message: "Erro ao buscar pagamentos" });
  }
});


router.get("/:id", async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
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

router.post("/", async (req: Request, res: Response) => {
  try {
    const { orderId, amount, method, paidAt } = req.body;

    // Converter a data corretamente para evitar problemas de timezone
    const paidAtDate = parseDateSafe(paidAt);

    const payment = await prisma.payment.create({
      data: { orderId, amount, method, paidAt: paidAtDate },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Erro ao criar pagamento", error);
    res.status(500).json({ message: "Erro ao criar pagamento" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { orderId, amount, method, paidAt } = req.body;
    
    // Converter a data corretamente para evitar problemas de timezone
    const paidAtDate = parseDateSafe(paidAt);
    
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { orderId, amount, method, paidAt: paidAtDate },
    });
    res.json(payment);
  } catch (error) {
    console.error("Erro ao atualizar pagamento", error);
    res.status(500).json({ message: "Erro ao atualizar pagamento" });
  }
});

export default router;
