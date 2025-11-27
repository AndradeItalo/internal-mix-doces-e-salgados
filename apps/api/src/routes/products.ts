import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos", error);
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto", error);
    res.status(500).json({ message: "Erro ao buscar produto" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, price, stock } = req.body;
    const product = await prisma.product.create({ data: { name, price, stock } });
    res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao criar produto", error);
    res.status(500).json({ message: "Erro ao criar produto" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, price, stock } = req.body;
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { name, price, stock } });
    res.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto", error);
    res.status(500).json({ message: "Erro ao atualizar produto" });
  }
});

export default router;
