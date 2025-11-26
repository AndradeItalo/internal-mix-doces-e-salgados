import { Router, Request, Response } from "express";
import { mockOrders } from "../data/mockOrders";

const router = Router();

// Pagamentos derivados das encomendas (pendente/recebido)
router.get("/", (req: Request, res: Response) => {
  const payments = mockOrders.map((o) => ({
    id: o.id,
    cliente: o.cliente,
    dataEntrega: o.dataEntrega,
    valorTotal: o.valorTotal,
    valorPago: o.valorPago,
    valorPendente: o.valorPendente,
    status: o.valorPendente > 0 ? "pendente" : "recebido"
  }));

  res.json(payments);
});

export default router;
