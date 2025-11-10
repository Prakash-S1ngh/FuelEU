import { api } from "./apiclient";
import type { Route } from "../../core/domains/Route";
import type { RoutePort } from "../../core/Ports/RoutePort";

export class RouteAPI implements RoutePort {
  async getAllRoutes(): Promise<Route[]> {
    const res = await api.get("/routes");
    console.log("Data ",res.data.data);
    return res.data.data;
  }

  async setBaseline(id: string): Promise<void> {
    await api.post(`/routes/${id}/baseline`);
  }

  async getComparison(): Promise<any[]> {
    const res = await api.get("/routes/comparison");
    return res.data.data;
  }
}