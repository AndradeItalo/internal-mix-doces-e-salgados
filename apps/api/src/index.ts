import express from "express";
import cors from "cors";
import serverless from "serverless-http";

import clientsRouter from "./routes/clients";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import quickSalesRouter from "./routes/quickSales";
import quickSalePaymentsRouter from "./routes/quickSalePayments";
import paymentsRouter from "./routes/payments";
import remindersRouter from "./routes/reminders";
import settingsRouter from "./routes/settings";
import historyRouter from "./routes/history";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/clients", clientsRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/quick-sales", quickSalesRouter);
app.use("/quick-sale-payments", quickSalePaymentsRouter);
app.use("/payments", paymentsRouter);
app.use("/reminders", remindersRouter);
app.use("/settings", settingsRouter);
app.use("/history", historyRouter);

// exporta para a Vercel
export const handler = serverless(app);
