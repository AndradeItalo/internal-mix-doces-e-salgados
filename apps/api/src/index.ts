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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log('Headers:', req.headers);
  next();
});

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

// Log all registered routes
console.log("[DEBUG] Registrando rotas...");
app.use("/api/clients", clientsRouter);
console.log("[DEBUG] Rota /api/clients registrada");
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/quick-sales", quickSalesRouter);
app.use("/api/quick-sale-payments", quickSalePaymentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/history", historyRouter);

// 404 handler para debug
app.use((req, res, next) => {
  console.log(`[404] Rota não encontrada: ${req.method} ${req.path}`);
  console.log("[404] Rotas disponíveis:", [
    "/health",
    "/api/clients",
    "/api/products", 
    "/api/orders",
    "/api/quick-sales",
    "/api/quick-sale-payments",
    "/api/payments",
    "/api/reminders",
    "/api/settings",
    "/api/history"
  ]);
  res.status(404).json({ error: "Rota não encontrada" });
});

// exporta para a Vercel
export const handler = serverless(app);

export default app;
