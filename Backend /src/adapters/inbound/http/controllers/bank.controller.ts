// src/adapters/inbound/http/BankingController.ts
import { Request, Response, Router } from "express";
import { BankRepository } from "../../../outbound/postgres/BankRepository";
import { BankService } from "../../../../core/application/BankService";

const router = Router();
const service = new BankService(new BankRepository());

router.get("/records", async (req, res) => {
  try {
    const { shipId, year } = req.query;
    const records = await service.getRecords(String(shipId), Number(year));
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/balance", async (req, res) => {
  try {
    const { shipId, year } = req.query;
    if (!shipId || !year) return res.status(400).json({ success: false, message: "shipId and year required" });
    const balance = await service.getAvailableBalance(String(shipId), Number(year));
    res.json({ success: true, data: { shipId: String(shipId), year: Number(year), available: balance } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/bank", async (req, res) => {
  try {
    // accept both snake_case and camelCase keys
    const ship_id = req.body.ship_id ?? req.body.shipId;
    const year = req.body.year ?? Number(req.body.year);
    const amount = req.body.amount_gco2eq ?? req.body.amount;
    if (!ship_id || !year || amount === undefined) return res.status(400).json({ success: false, message: "ship_id, year and amount required" });
    await service.bankCB(ship_id, Number(year), Number(amount));
    res.json({ success: true, message: "Banked successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/apply", async (req, res) => {
  try {
    const ship_id = req.body.ship_id ?? req.body.shipId;
    const year = req.body.year ?? Number(req.body.year);
    const amount = req.body.amount_gco2eq ?? req.body.amount;
    if (!ship_id || !year || amount === undefined) return res.status(400).json({ success: false, message: "ship_id, year and amount required" });
    await service.applyBank(ship_id, Number(year), Number(amount));
    res.json({ success: true, message: "Applied successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;