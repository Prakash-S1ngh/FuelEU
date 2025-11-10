// src/adapters/outbound/postgres/PoolRepository.ts
import { PoolEntity } from "../../../core/domain/Pool";
import { prisma } from "../../../infrastructure/db/prisma";

export class PoolRepository {
  async createPool(entity: PoolEntity) {
    const pool = await prisma.pool.create({
      data: {
        year: entity.props.year,
      },
    });

    const allocations = entity.allocate();

    for (const m of allocations) {
      await prisma.poolMember.create({
        data: {
          pool_id: pool.id,
          ship_id: m.ship_id,
          cb_before: m.cb_before,
          cb_after: m.cb_after!,
        },
      });
    }

    return { poolId: pool.id, members: allocations };
  }
}