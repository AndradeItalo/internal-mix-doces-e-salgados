import { Router, Request, Response } from "express";
import { mockClients } from "../data/mockClients";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(mockClients);
});

router.get("/:id", (req: Request, res: Response) => {
  const client = mockClients.find((c) => c.id === req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }
  res.json(client);
});

export default router;
