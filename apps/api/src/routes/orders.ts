import { Router, Request, Response } from "express";
import { mockOrders } from "../data/mockOrders";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(mockOrders);
});

router.get("/:id", (req: Request, res: Response) => {
  const order = mockOrders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Encomenda não encontrada" });
  res.json(order);
});

export default router;
