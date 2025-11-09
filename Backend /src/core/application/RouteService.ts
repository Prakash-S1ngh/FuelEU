// src/core/application/RouteService.ts

import { RouteRepositoryPort } from "../ports/RouteRepositoryPort";
import { RouteEntity } from "../domain/routes";

export class RouteService {
  constructor(private repo: RouteRepositoryPort) {}

  async getRoutes(): Promise<RouteEntity[]> {
    const routes = await this.repo.findAll();
    return routes.map(RouteEntity.fromPrisma);
  }

  async setBaseline(id: string): Promise<void> {
    await this.repo.setBaseline(id);
  }

  async compareRoutes(): Promise<
    { route_id: string; percentDiff: number; compliant: boolean }[]
  > {
    const allRoutes = await this.repo.findAll();
    const baseline = await this.repo.findBaseline();

    if (!baseline) throw new Error("No baseline route found");

    const baselineEntity = RouteEntity.fromPrisma(baseline);
    const baselineIntensity = baselineEntity.props.ghg_intensity;

    return allRoutes
      .filter((r) => !r.is_baseline)
      .map((r) => RouteEntity.fromPrisma(r).compareToBaseline(baselineIntensity));
  }
}