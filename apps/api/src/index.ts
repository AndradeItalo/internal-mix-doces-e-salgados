import express, { Request, Response } from "express";
import cors from "cors";
import clientsRouter from "./routes/clients";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import quickSalesRouter from "./routes/quickSales";
import quickSalePaymentsRouter from "./routes/quickSalePayments";
import paymentsRouter from "./routes/payments";
import remindersRouter from "./routes/reminders";
import settingsRouter from "./routes/settings";
import historyRouter from "./routes/history";
import { ReminderScheduler } from "./jobs/reminderScheduler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/clients", clientsRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/quick-sales", quickSalesRouter);
app.use("/api/quick-sale-payments", quickSalePaymentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/history", historyRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  
  // Iniciar o agendador de lembretes
  ReminderScheduler.start();
});
