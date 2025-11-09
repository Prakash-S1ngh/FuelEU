export interface RouteProps{
    id:string,
    route_id:string,
    year:number,
    ghg_intensity:number,
    is_baseline:boolean
}

export class RouteEntity{
    private props:RouteProps;
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
  return new RouteEntity({
    id: data.id,
    route_id: data.route_id,
    year: data.year,
    ghg_intensity: data.ghg_intensity,
    is_baseline: data.is_baseline,
  });
}
}