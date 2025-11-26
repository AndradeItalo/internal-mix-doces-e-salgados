import { Router, Request, Response } from "express";
import { mockQuickSales } from "../data/mockQuickSales";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(mockQuickSales);
});

export default router;
