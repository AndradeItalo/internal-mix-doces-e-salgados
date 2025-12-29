import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ReminderService } from "../services/reminderService";
import { parseDateSafe } from "../utils/dateUtils";

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
        items: { include: { product: true, variant: { include: { product: true } } } },
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
    const { clientId, deliveryAt, deliveryHour, status, items } = req.body as {
      clientId: string;
      deliveryAt?: string;
      deliveryHour?: string;
      status: string;
      items: Array<{ productId?: string; variantId?: string; quantity: number; price: number }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Itens da encomenda são obrigatórios" });
    }

    const normalizedItems = await Promise.all(items.map(async (it) => {
      if (it.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: it.variantId },
          include: { product: true },
        });
        if (!variant) throw new Error(`Variant não encontrada: ${it.variantId}`);

        return {
          productId: variant.productId,
          variantId: variant.id,
          quantity: it.quantity,
          price: it.price,
        };
      }

      if (it.productId) {
        const defaultVariant = await prisma.productVariant.findFirst({
          where: { productId: it.productId },
          orderBy: { createdAt: "asc" },
        });
        if (!defaultVariant) throw new Error(`Produto não possui variantes: ${it.productId}`);

        return {
          productId: it.productId,
          variantId: defaultVariant.id,
          quantity: it.quantity,
          price: it.price,
        };
      }

      throw new Error("Item precisa de variantId ou productId");
    }));

    const total = normalizedItems.reduce((acc, it) => acc + it.quantity * it.price, 0);

    // Converter a data corretamente para evitar problemas de timezone
    const deliveryAtDate = parseDateSafe(deliveryAt);
    const order = await prisma.order.create({
      data: {
        clientId,
        total,
        deliveryAt: deliveryAt ? new Date(deliveryAt) : undefined,
        deliveryHour: deliveryHour !== undefined ? deliveryHour : undefined,
        status,
        items: {
          create: normalizedItems.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
      include: { items: true },
    });

    // Criar lembrete automaticamente se tiver data de entrega
    if (deliveryAt) {
      try {
        await ReminderService.createReminderForOrder(order.id);
      } catch (reminderError) {
        console.error("Erro ao criar lembrete automático:", reminderError);
        // Não falhar a criação da encomenda se o lembrete falhar
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar encomenda", error);
    res.status(500).json({ message: "Erro ao criar encomenda" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { clientId, total, deliveryAt, deliveryHour, status } = req.body;
    
    // Buscar encomenda atual para verificar mudanças
    const currentOrder = await prisma.order.findUnique({
      where: { id: req.params.id }
    });
    
    // Converter a data corretamente para evitar problemas de timezone
    const deliveryAtDate = parseDateSafe(deliveryAt);
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { clientId, total, deliveryAt: deliveryAtDate, deliveryHour, status },
    });
    
    // Gerenciar lembretes baseado nas mudanças
    try {
      if (status === 'entregue' && currentOrder?.status !== 'entregue') {
        // Se foi entregue, remover lembrete
        await ReminderService.removeReminderForOrder(req.params.id);
      } else if (deliveryAtDate && (!currentOrder?.deliveryAt || deliveryAtDate.getTime() !== new Date(currentOrder.deliveryAt).getTime())) {
        // Se mudou a data de entrega, recriar lembrete
        await ReminderService.removeReminderForOrder(req.params.id);
        await ReminderService.createReminderForOrder(req.params.id);
      }
    } catch (reminderError) {
      console.error("Erro ao gerenciar lembretes:", reminderError);
      // Não falhar a atualização da encomenda
    }
    
    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar encomenda", error);
    res.status(500).json({ message: "Erro ao atualizar encomenda" });
  }
});
export default router;
