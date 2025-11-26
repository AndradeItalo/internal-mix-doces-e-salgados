import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error) {
    console.error("Erro ao buscar clientes", error);
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

export default router;
