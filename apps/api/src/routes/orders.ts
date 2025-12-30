import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ReminderService } from "../services/reminderService";
import { parseDateSafe } from "../utils/dateUtils";
import type { Prisma } from "@prisma/client";

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
    const { clientId, deliveryAt, deliveryHour, notes, status, items } = req.body as {
      clientId: string;
      deliveryAt?: string;
      deliveryHour?: string;
      notes?: string;
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
        deliveryAt: deliveryAtDate,
        deliveryHour: deliveryHour !== undefined ? deliveryHour : undefined,
        notes: notes !== undefined ? notes : undefined,
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
    const { clientId, total, deliveryAt, deliveryHour, notes, status, items } = req.body as {
      clientId?: string;
      total?: number;
      deliveryAt?: string;
      deliveryHour?: string;
      notes?: string;
      status?: string;
      items?: Array<{ productId?: string; variantId?: string; quantity: number; price: number }>;
    };
    
    // Buscar encomenda atual para verificar mudanças
    const currentOrder = await prisma.order.findUnique({
      where: { id: req.params.id }
    });

    if (!currentOrder) {
      return res.status(404).json({ message: "Encomenda não encontrada" });
    }
    
    // Converter a data corretamente para evitar problemas de timezone
    const deliveryAtDate = parseDateSafe(deliveryAt);

    const updatedOrder = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let computedTotal: number | undefined;
      let normalizedItems:
        | Array<{ productId: string; variantId: string; quantity: number; price: number }>
        | undefined;

      if (items && Array.isArray(items)) {
        if (items.length === 0) {
          throw new Error("Itens da encomenda são obrigatórios");
        }

        normalizedItems = await Promise.all(
          items.map(async (it) => {
            if (it.variantId) {
              const variant = await tx.productVariant.findUnique({
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
              const defaultVariant = await tx.productVariant.findFirst({
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
          })
        );

        computedTotal = normalizedItems.reduce((acc, it) => acc + it.quantity * it.price, 0);
      }

      return tx.order.update({
        where: { id: req.params.id },
        data: {
          clientId,
          deliveryAt: deliveryAtDate,
          deliveryHour,
          notes,
          status,
          total: computedTotal !== undefined ? computedTotal : total,
          ...(normalizedItems
            ? {
                items: {
                  deleteMany: {},
                  create: normalizedItems.map((it) => ({
                    productId: it.productId,
                    variantId: it.variantId,
                    quantity: it.quantity,
                    price: it.price,
                  })),
                },
              }
            : {}),
        },
      });
    });
    
    // Gerenciar lembretes baseado nas mudanças
    try {
      const effectiveStatus = status ?? currentOrder.status;

      if (effectiveStatus === 'entregue' && currentOrder.status !== 'entregue') {
        // Se foi entregue, remover lembrete
        await ReminderService.removeReminderForOrder(req.params.id);
      } else if (
        deliveryAtDate &&
        (!currentOrder.deliveryAt || deliveryAtDate.getTime() !== new Date(currentOrder.deliveryAt).getTime())
      ) {
        // Se mudou a data de entrega, recriar lembrete
        await ReminderService.removeReminderForOrder(req.params.id);
        await ReminderService.createReminderForOrder(req.params.id);
      }
    } catch (reminderError) {
      console.error("Erro ao gerenciar lembretes:", reminderError);
      // Não falhar a atualização da encomenda
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar encomenda", error);
    res.status(500).json({ message: "Erro ao atualizar encomenda" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return res.status(404).json({ message: "Encomenda não encontrada" });
    }

    try {
      await ReminderService.removeReminderForOrder(orderId);
    } catch (reminderError) {
      console.error("Erro ao remover lembretes da encomenda:", reminderError);
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.deleteMany({ where: { orderId } });
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir encomenda", error);
    res.status(500).json({ message: "Erro ao excluir encomenda" });
  }
});
export default router;
