// src/adapters/inbound/http/complianceController.ts
import { Router, Request, Response } from "express";
import { ComplianceRepository } from "../../../../core/ports/ ComplianceRepository";
import { ComplianceService } from "../../../../core/application/ComplianceService";

const router = Router();
const repo = new ComplianceRepository();
const service = new ComplianceService(repo);

/**
 * @route GET /compliance/cb?shipId&year
 * @desc Compute and store CB snapshot
 */
router.get("/cb", async (req: Request, res: Response) => {
  try {
    const { shipId, year } = req.query;
    if (!shipId || !year) {
      return res.status(400).json({ success: false, message: "shipId and year are required" });
    }

    const cbEntity = await service.computeAndStoreCB(String(shipId), Number(year));
    res.json({ success: true, data: cbEntity.toPrisma() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route GET /compliance/adjusted-cb?shipId&year
 * @desc Return CB after applying banked credits
 */
router.get("/adjusted-cb", async (req: Request, res: Response) => {
  try {
    const { shipId, year } = req.query;
    if (!shipId || !year) {
      return res.status(400).json({ success: false, message: "shipId and year are required" });
    }

    const adjusted = await service.getAdjustedCB(String(shipId), Number(year));
    res.json({ success: true, data: adjusted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;