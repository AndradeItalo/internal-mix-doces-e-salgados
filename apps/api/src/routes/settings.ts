import { Router, Request, Response } from "express";
import { settings } from "../data/mockSettings";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(settings);
});

export default router;
