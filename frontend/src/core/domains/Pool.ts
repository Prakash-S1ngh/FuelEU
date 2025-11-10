export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  id?: string;
  year: number;
  members: PoolMember[];
}