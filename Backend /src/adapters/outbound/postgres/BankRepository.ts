// src/adapters/outbound/postgres/BankRepository.ts
import { prisma } from "../../../infrastructure/db/prisma";
import { BankRepositoryPort } from "../../../core/ports/Bankport";
import { BankEntity } from "../../../core/domain/Bank";

export class BankRepository implements BankRepositoryPort {
  async saveBankEntry(entity: BankEntity) {
    await prisma.bankEntry.create({
      data: entity.toPrisma(),
    });
  }

  async findRecords(ship_id: string, year: number) {
    const records = await prisma.bankEntry.findMany({
      where: { ship_id, year: { lte: year } },
      orderBy: { year: "asc" },
    });
    return records.map(BankEntity.fromPrisma);
  }

  async getAvailableBalance(ship_id: string, year: number) {
    const total = await prisma.bankEntry.aggregate({
      _sum: { amount_gco2eq: true },
      where: { ship_id, year: { lte: year } },
    });
    return total._sum.amount_gco2eq ?? 0;
  }

  async applyBank(ship_id: string, year: number, amount: number) {
    const available = await this.getAvailableBalance(ship_id, year);
    if (amount > available) {
      throw new Error("Insufficient banked credits");
    }

    // Deduct applied amount (store as negative record)
    await prisma.bankEntry.create({
      data: {
        ship_id,
        year,
        amount_gco2eq: -Math.abs(amount),
      },
    });
  }
}