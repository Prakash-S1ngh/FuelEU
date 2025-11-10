import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./infrastructure/db/prisma";
import RouteRouter from "./adapters/inbound/http/controllers/route.controller";
import CompilanceRouter from "./adapters/inbound/http/controllers/compliance.controller";
import BankRouter from "./adapters/inbound/http/controllers/bank.controller";
import PoolRouter from "./adapters/inbound/http/controllers/pool.controller";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);

app.get("/", async (req: Request, res: Response) => {
  const routes = await prisma.route.findMany();
  res.json({
    message: "Server is running",
    routes,
  });
});

// Mount all routers
app.use("/routes", RouteRouter);
app.use("/compliance", CompilanceRouter);
app.use("/bank", BankRouter);
app.use("/pool", PoolRouter);
// Aliases so frontend paths like /banking and /pools work
app.use("/banking", BankRouter);
app.use("/pools", PoolRouter);

// 🧩 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});