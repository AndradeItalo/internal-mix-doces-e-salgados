import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        client: { select: { id: true, name: true } },
        payments: true
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar encomendas", error);
    res.status(500).json({ message: "Erro ao buscar encomendas" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        payments: true,
        client: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Encomenda não encontrada" });
    }

    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar encomenda", error);
    res.status(500).json({ message: "Erro ao buscar encomenda" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { clientId, deliveryAt, status, items } = req.body as {
      clientId: string;
      deliveryAt?: string;
      status: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Itens da encomenda são obrigatórios" });
    }

    const total = items.reduce((acc, it) => acc + it.quantity * it.price, 0);

    const order = await prisma.order.create({
      data: {
        clientId,
        total,
        deliveryAt: deliveryAt ? new Date(deliveryAt) : undefined,
        status,
        items: {
          create: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar encomenda", error);
    res.status(500).json({ message: "Erro ao criar encomenda" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { clientId, total, deliveryAt, status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { clientId, total, deliveryAt, status },
    });
    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar encomenda", error);
    res.status(500).json({ message: "Erro ao atualizar encomenda" });
  }
});
export default router;
