import { Router, Request, Response } from "express";
import { mockReminders } from "../data/mockReminders";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(mockReminders);
});

export default router;
