import { ComplianceEntity } from "../domain/ComplianceEntity";
import { ComplianceRepository } from "../ports/ ComplianceRepository";
import {prisma} from "../../infrastructure/db/prisma";

export class ComplianceService {
  constructor(private repo: ComplianceRepository) {}

    async computeAndStoreCB(shipId: string, year: number) {
    const route = await prisma.route.findFirst({ where: { year } });
    if (!route) throw new Error(`No route found for year ${year}`);

    const targetIntensity = 89.3368; 
    const actualIntensity = route.ghg_intensity;
    const energyMJ = 41000;
    const cbValue = ComplianceEntity.calculate(targetIntensity, actualIntensity, energyMJ);

    const entity = new ComplianceEntity({
      id: crypto.randomUUID(),
      ship_id: shipId,
      year,
      cb_gco2eq: cbValue,
    });

    await this.repo.saveCB(entity);
    return entity;
  }
  
  async getAdjustedCB(shipId: string, year: number) {
    const cbRecord = await prisma.shipCompliance.findFirst({
      where: { ship_id: shipId, year },
    });
    if (!cbRecord) throw new Error("No CB record found");

    const banked = await prisma.bankEntry.findMany({
      where: { ship_id: shipId, year: { lte: year } },
    });

    const totalBanked = banked.reduce((sum, b) => sum + b.amount_gco2eq, 0);
    const adjusted = cbRecord.cb_gco2eq + totalBanked;

    return {
      ship_id: shipId,
      year,
      cb_original: cbRecord.cb_gco2eq,
      totalBanked,
      cb_adjusted: adjusted,
    };
  }
}