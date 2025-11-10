import { BankEntity } from "../domain/Bank";



export interface BankRepositoryPort {
  saveBankEntry(entity: BankEntity): Promise<void>;
  findRecords(ship_id: string, year: number): Promise<BankEntity[]>;
  getAvailableBalance(ship_id: string, year: number): Promise<number>;
  applyBank(ship_id: string, year: number, amount: number): Promise<void>;
}