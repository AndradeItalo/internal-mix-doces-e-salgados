import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("[GET /clients] Iniciando busca de clientes...");
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log("[GET /clients] Clientes encontrados:", clients.length);
    console.log("[GET /clients] Dados:", JSON.stringify(clients, null, 2));
    res.json(clients);
  } catch (error) {
    console.error("[GET /clients] Erro ao buscar clientes", error);
    res.status(500).json({ message: "Erro ao buscar clientes" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    res.json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente", error);
    res.status(500).json({ message: "Erro ao buscar cliente" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone, notes } = req.body;

    const client = await prisma.client.create({
      data: { name, phone, notes },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Erro ao criar cliente", error);
    res.status(500).json({ message: "Erro ao criar cliente" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, phone, notes } = req.body;
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { name, phone, notes },
    });
    res.json(client);
  } catch (error) {
    console.error("Erro ao atualizar cliente", error);
    res.status(500).json({ message: "Erro ao atualizar cliente" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    const [ordersCount, quickSalesCount] = await Promise.all([
      prisma.order.count({ where: { clientId: id } }),
      prisma.quickSale.count({ where: { clientId: id } }),
    ]);

    if (ordersCount > 0 || quickSalesCount > 0) {
      return res.status(409).json({
        message:
          "Não é possível excluir este cliente porque ele possui vendas/encomendas vinculadas.",
      });
    }

    await prisma.client.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir cliente", error);
    return res.status(500).json({ message: "Erro ao excluir cliente" });
  }
});

export default router;
