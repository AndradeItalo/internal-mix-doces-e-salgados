import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();


router.get("/", async (req: Request, res: Response) => {
  try {
    const quickSales = await prisma.quickSale.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        client: { select: { id: true, name: true } },
        items: { include: { product: true } },
        payments: true
      },
    });
    res.json(quickSales);
  } catch (error) {
    console.error("Erro ao buscar vendas rápidas", error);
    res.status(500).json({ message: "Erro ao buscar vendas rápidas" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const quickSale = await prisma.quickSale.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { id: true, name: true } },
        items: { include: { product: true } },
        payments: true
      },
    });

    if (!quickSale) {
      return res.status(404).json({ message: "Venda rápida não encontrada" });
    }

    res.json(quickSale);
  } catch (error) {
    console.error("Erro ao buscar venda rápida", error);
    res.status(500).json({ message: "Erro ao buscar venda rápida" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { clientId, items } = req.body as {
      clientId?: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Itens da venda rápida são obrigatórios" });
    }

    const total = items.reduce((acc, it) => acc + it.quantity * it.price, 0);

    const quickSale = await prisma.quickSale.create({
      data: {
        clientId,
        total,
        items: {
          create: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
      include: { 
        client: { select: { id: true, name: true } },
        items: { include: { product: true } }
      },
    });

    res.status(201).json(quickSale);
  } catch (error) {
    console.error("Erro ao criar venda rápida", error);
    res.status(500).json({ message: "Erro ao criar venda rápida" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { clientId, total } = req.body;
    const quickSale = await prisma.quickSale.update({
      where: { id: req.params.id },
      data: { clientId, total },
      include: { 
        client: { select: { id: true, name: true } },
        items: { include: { product: true } }
      },
    });
    res.json(quickSale);
  } catch (error) {
    console.error("Erro ao atualizar venda rápida", error);
    res.status(500).json({ message: "Erro ao atualizar venda rápida" });
  }
});

export default router;
