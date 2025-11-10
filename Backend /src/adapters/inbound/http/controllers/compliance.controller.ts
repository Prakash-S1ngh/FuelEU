// src/adapters/inbound/http/complianceController.ts
import { Router, Request, Response } from "express";
import { ComplianceRepository } from "../../../../core/ports/ ComplianceRepository";
import { ComplianceService } from "../../../../core/application/ComplianceService";
import { prisma } from "../../../../infrastructure/db/prisma";

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
    if (!year) {
      return res.status(400).json({ success: false, message: "year is required" });
    }

    // if shipId provided, compute/store and return single (map to frontend shape)
    if (shipId) {
      const cbEntity = await service.computeAndStoreCB(String(shipId), Number(year));
      const mapped = {
        shipId: cbEntity.ship_id,
        year: cbEntity.year,
        cbBefore: cbEntity.cb_gco2eq,
        cbAfter: undefined,
      };
      return res.json({ success: true, data: mapped });
    }

    // otherwise, return CB snapshot for all ships for the year (map to frontend shape)
    const records = await prisma.shipCompliance.findMany({ where: { year: Number(year) } });
    const mapped = records.map((r) => ({ shipId: r.ship_id, year: r.year, cbBefore: r.cb_gco2eq, cbAfter: undefined }));
    res.json({ success: true, data: mapped });
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
    if (!year) {
      return res.status(400).json({ success: false, message: "year is required" });
    }

    if (shipId) {
      const adjusted = await service.getAdjustedCB(String(shipId), Number(year));
      // Map to frontend shape
      const mapped = {
        shipId: adjusted.ship_id,
        year: adjusted.year,
        cbBefore: adjusted.cb_adjusted ?? adjusted.cb_original ?? 0,
        cbAfter: undefined,
      };
      return res.json({ success: true, data: mapped });
    }

    // Otherwise return adjusted CB for all ships for the year
    const records = await prisma.shipCompliance.findMany({ where: { year: Number(year) } });
    const adjustedList = await Promise.all(records.map(async (r) => {
      const adjusted = await service.getAdjustedCB(r.ship_id, Number(year));
      return {
        shipId: adjusted.ship_id,
        year: adjusted.year,
        cbBefore: adjusted.cb_adjusted ?? adjusted.cb_original ?? 0,
        cbAfter: undefined,
      };
    }));
    res.json({ success: true, data: adjustedList });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;