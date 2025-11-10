// src/adapters/infrastructure/ComplianceAPI.ts
import { api } from "./apiclient";
import type { CompliancePort } from "../../core/Ports/CompliancePort";
import type { ComplianceBalance } from "../../core/domains/ComplianceBalance";


export class ComplianceAPI implements CompliancePort {
  async getCB(shipId: string, year: number): Promise<ComplianceBalance> {
    const res = await api.get(`/compliance/cb?shipId=${shipId}&year=${year}`);
    return res.data.data;
  }

  async getAdjustedCB(shipId: string, year: number): Promise<ComplianceBalance> {
    const res = await api.get(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
    return res.data.data;
  }
}