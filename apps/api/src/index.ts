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

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4000);
const shouldListen = !process.env.VERCEL;

if (shouldListen) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`API rodando na porta ${PORT}`);
  });

  server.on("error", (err) => {
    console.error("Falha ao iniciar o servidor Express:", err);
  });
}

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
