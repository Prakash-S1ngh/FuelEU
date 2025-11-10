import { Request, Response, Router } from "express";
import { prisma } from "../../../../infrastructure/db/prisma";
import { RouteRepository } from "../../../outbound/postgres/RouteRepository";
import { RouteService } from "../../../../core/application/RouteService";


const router = Router();

// Initialize dependencies
const repo = new RouteRepository(prisma);
const service = new RouteService(repo);

/**
 * @route GET /routes
 * @desc Get all routes
 */
router.get("/", async (_: Request, res: Response) => {
  try {
    const routes = await service.getRoutes();
    res.json({ success: true, data: routes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route POST /routes/:id/baseline
 * @desc Set baseline route
 */
router.post("/:id/baseline", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await service.setBaseline(id);
    res.json({ success: true, message: `Route ${id} set as baseline.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route GET /routes/comparison
 * @desc Compare all routes vs baseline
 */
router.get("/comparison", async (_: Request, res: Response) => {
  try {
    console.log("Comparing routes...");
    const comparison = await service.compareRoutes();
    res.json({ success: true, data: comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;