// src/core/application/PoolService.ts
import { PoolRepository } from "../../adapters/outbound/postgres/PoolRepository";
import { PoolEntity } from "../domain/Pool";


export class PoolService {
  constructor(private repo: PoolRepository) {}

  async createPool(year: number, members: { ship_id: string; cb_before: number }[]) {
    const pool = new PoolEntity({ year, members });
    return await this.repo.createPool(pool);
  }
}