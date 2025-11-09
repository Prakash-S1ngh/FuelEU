export interface CB {
    id: string,
    ship_id: string,
    year: number,
    cb_gco2eq: number
}
export class ComplianceEntity {
    id: string;
    ship_id: string;
    year: number;
    cb_gco2eq: number;
    constructor({ id, ship_id, year, cb_gco2eq }: CB) {
        this.id = id;
        this.ship_id = ship_id;
        this.year = year;
        this.cb_gco2eq = cb_gco2eq;
    }
    static calculate(target: number, actual: number, energyMJ: number): number {
    return (target - actual) * energyMJ;
    }

    static fromPrisma(data: any): ComplianceEntity {
        return new ComplianceEntity({
            id: data.id,
            ship_id: data.ship_id,
            year: data.year,
            cb_gco2eq: data.cb_gco2eq
        });
    }
    toPrisma() {
    return {
      id: this.id,
      ship_id: this.ship_id,
      year: this.year,
      cb_gco2eq: this.cb_gco2eq,
    };
  }

}
