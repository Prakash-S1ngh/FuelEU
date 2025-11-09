import express from "express";
import dotenv from "dotenv";
import { prisma } from "./infrastructure/db/prisma";
import { Request,Response } from "express";

// Ensure environment variables are loaded
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", async (req:Request, res:Response) => {
  const routes = await prisma.route.findMany();
  res.json({
    message: "Server is running",
    routes,
  });
});

// 🧩 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});