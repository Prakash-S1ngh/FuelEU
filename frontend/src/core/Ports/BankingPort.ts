export interface BankingPort {
  getRecords(shipId: string, year: number): Promise<any[]>;
  bankPositiveCB(shipId: string, year: number, amount: number): Promise<void>;
  applyBankedCB(shipId: string, year: number, amount: number): Promise<void>;
}