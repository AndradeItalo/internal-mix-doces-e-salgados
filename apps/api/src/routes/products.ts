import { Router, Request, Response } from "express";
import { mockProducts } from "../data/mockProducts";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(mockProducts);
});

router.get("/:id", (req: Request, res: Response) => {
  const product = mockProducts.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Produto não encontrado" });
  res.json(product);
});

export default router;
