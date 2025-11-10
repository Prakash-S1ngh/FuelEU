import { BankRepository } from "../../adapters/outbound/postgres/BankRepository";
import { BankEntity } from "../domain/Bank";

BankRepository
export class BankService {
  constructor(private repo: BankRepository) {}

  async getRecords(shipId: string, year: number) {
    return this.repo.findRecords(shipId, year);
  }

  async bankCB(shipId: string, year: number, amount: number) {
    if (amount <= 0) throw new Error("Only positive CB can be banked");
    const entity = new BankEntity({ ship_id: shipId, year, amount_gco2eq: amount });
    await this.repo.saveBankEntry(entity);
  }

  async applyBank(shipId: string, year: number, amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive");
    await this.repo.applyBank(shipId, year, amount);
  }

  async getAvailableBalance(shipId: string, year: number) {
    return this.repo.getAvailableBalance(shipId, year);
  }
}