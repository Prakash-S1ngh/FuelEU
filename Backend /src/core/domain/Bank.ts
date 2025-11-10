// src/core/domain/BankEntity.ts
export interface BankProps {
  ship_id: string;
  year: number;
  amount_gco2eq: number;
}

export class BankEntity {
  constructor(public props: BankProps) {}

  toPrisma() {
    return {
      ship_id: this.props.ship_id,
      year: this.props.year,
      amount_gco2eq: this.props.amount_gco2eq,
    };
  }

  static fromPrisma(data: any): BankEntity {
    return new BankEntity({
      ship_id: data.ship_id,
      year: data.year,
      amount_gco2eq: data.amount_gco2eq,
    });
  }
}