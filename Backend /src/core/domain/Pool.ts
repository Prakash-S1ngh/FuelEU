// src/core/domain/PoolEntity.ts
export interface PoolMemberProps {
  ship_id: string;
  cb_before: number;
  cb_after?: number;
}

export interface PoolProps {
  year: number;
  members: PoolMemberProps[];
}

export class PoolEntity {
  constructor(public props: PoolProps) {}

  /** Business logic for pooling */
  allocate(): PoolMemberProps[] {
    const members = this.props.members.map((m) => ({
      ...m,
      cb_after: m.cb_before,
    }));

    // sort by descending CB
    members.sort((a, b) => b.cb_before - a.cb_before);

    const deficits = members.filter((m) => m.cb_before < 0);
    const surplus = members.filter((m) => m.cb_before > 0);

    let total = members.reduce((sum, m) => sum + m.cb_before, 0);
    if (total < 0) throw new Error("Total CB sum cannot be negative");

    // Greedy transfer from surplus → deficits
    for (const def of deficits) {
      let needed = Math.abs(def.cb_before);

      for (const sur of surplus) {
        if (needed <= 0) break;
        const give = Math.min(sur.cb_after!, needed);
        sur.cb_after! -= give;
        def.cb_after! += give;
        needed -= give;
      }
    }

    // validation rules
    if (members.some((m) => m.cb_after! < 0))
      throw new Error("Surplus ships cannot exit negative");

    if (deficits.some((m) => m.cb_after! < m.cb_before))
      throw new Error("Deficit ship cannot exit worse");

    return members;
  }
}