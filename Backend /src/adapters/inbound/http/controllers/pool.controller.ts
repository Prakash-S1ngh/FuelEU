// src/adapters/inbound/http/PoolController.ts
import { Request, Response, Router } from "express";
import { PoolRepository } from "../../../outbound/postgres/PoolRepository";
import { PoolService } from "../../../../core/application/PoolService";
import { ComplianceService } from "../../../../core/application/ComplianceService";
import { ComplianceRepository } from "../../../../core/ports/ ComplianceRepository";

const router = Router();
const service = new PoolService(new PoolRepository());

router.post("/", async (req: Request, res: Response) => {
  try {
    const { year, members } = req.body;

    if (!year || !members?.length)
      return res.status(400).json({ success: false, message: "Year and members required" });

    // Accept either array of shipIds (strings) or array of objects { ship_id, cb_before }
    let memberObjs: { ship_id: string; cb_before: number }[] = [];
    if (typeof members[0] === "string") {
      // map ids -> fetch adjusted CB for each ship
      const complianceSvc = new ComplianceService(new ComplianceRepository());
      for (const id of members) {
        const adjusted = await complianceSvc.getAdjustedCB(String(id), Number(year));
        memberObjs.push({ ship_id: adjusted.ship_id, cb_before: adjusted.cb_adjusted ?? adjusted.cb_original ?? 0 });
      }
    } else {
      // assume already shaped
      memberObjs = members;
    }

    const result = await service.createPool(Number(year), memberObjs);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;