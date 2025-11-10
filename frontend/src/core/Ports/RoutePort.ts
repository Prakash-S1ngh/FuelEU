import type { Route } from "../domains/Route";

export interface RoutePort {
  getAllRoutes(): Promise<Route[]>;
  setBaseline(id: string): Promise<void>;
  getComparison(): Promise<any[]>;
}