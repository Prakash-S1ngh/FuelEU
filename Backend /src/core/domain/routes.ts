export interface RouteProps{
    id:string,
    route_id:string,
    year:number,
  ghg_intensity:number,
  vessel_type?:string,
  fuel_type?:string,
  fuel_consumption?:number,
  distance?:number,
  total_emissions?:number,
    is_baseline:boolean
}

export class RouteEntity{
    public props:RouteProps;
    constructor(props:RouteProps){
        this.props = props
    }
    get id():string{
        return this.props.id
    }
      get routeId(): string {
    return this.props.route_id;
  }

  get year(): number {
    return this.props.year;
  }

  get ghgIntensity(): number {
    return this.props.ghg_intensity;
  }

  get vesselType(): string | undefined {
    return this.props.vessel_type;
  }

  get fuelType(): string | undefined {
    return this.props.fuel_type;
  }

  get fuelConsumption(): number | undefined {
    return this.props.fuel_consumption;
  }

  get distance(): number | undefined {
    return this.props.distance;
  }

  get totalEmissions(): number | undefined {
    return this.props.total_emissions;
  }
  /**
   * Compute missing derived fields using reasonable assumptions.
   * energyPerTonneMJ is the energy content per tonne of fuel (MJ/tonne). Default: 41000 MJ/t.
   */
  ensureComputedFields(energyPerTonneMJ = 41000) {
    // If total_emissions missing but fuel_consumption present, compute total_emissions (tonnes CO2)
    if ((this.props.total_emissions === undefined || this.props.total_emissions === null) && this.props.fuel_consumption) {
      // ghg_intensity (gCO2e/MJ) * energy (MJ/t) * fuel_consumption (t) => gCO2e
      // convert to tonnes CO2e by dividing by 1e6
      const total_g = this.props.ghg_intensity * energyPerTonneMJ * this.props.fuel_consumption;
      this.props.total_emissions = Number((total_g / 1e6).toFixed(6));
    }

    // If fuel_consumption missing but total_emissions present, compute fuel_consumption (t)
    if ((this.props.fuel_consumption === undefined || this.props.fuel_consumption === null) && this.props.total_emissions) {
      // total_emissions (t) -> gCO2e = total_emissions * 1e6
      // fuel_consumption = total_g / (ghg_intensity * energyPerTonneMJ)
      const total_g = this.props.total_emissions * 1e6;
      this.props.fuel_consumption = Number((total_g / (this.props.ghg_intensity * energyPerTonneMJ)).toFixed(6));
    }
    // Note: distance cannot be reliably computed from provided fields; leave as-is if missing.
  }

  get isBaseline(): boolean {
    return this.props.is_baseline;
  }
  compareToBaseline(baselineIntensity: number) {
  const percentDiff =
    ((this.props.ghg_intensity - baselineIntensity) / baselineIntensity) * 100;

  const compliant = this.props.ghg_intensity <= baselineIntensity;

  return {
    route_id: this.props.route_id,
    percentDiff: Number(percentDiff.toFixed(2)),
    compliant,
  };
}
static fromPrisma(data: any): RouteEntity {
  const entity = new RouteEntity({
    id: data.id,
    route_id: data.route_id,
    year: data.year,
    ghg_intensity: data.ghg_intensity,
    vessel_type: data.vessel_type,
    fuel_type: data.fuel_type,
    fuel_consumption: data.fuel_consumption,
    distance: data.distance,
    total_emissions: data.total_emissions,
    is_baseline: data.is_baseline,
  });
  // compute derived fields when possible
  entity.ensureComputedFields();
  return entity;
}
  
  toPrisma() {
    return {
      id: this.props.id,
      route_id: this.props.route_id,
      year: this.props.year,
      ghg_intensity: this.props.ghg_intensity,
      vessel_type: this.props.vessel_type,
      fuel_type: this.props.fuel_type,
      fuel_consumption: this.props.fuel_consumption,
      distance: this.props.distance,
      total_emissions: this.props.total_emissions,
      is_baseline: this.props.is_baseline,
    };
  }
}