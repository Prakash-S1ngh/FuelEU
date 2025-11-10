// src/core/ports/CompliancePort.ts
import type { ComplianceBalance } from "../domains/ComplianceBalance";

export interface CompliancePort {
  getCB(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<ComplianceBalance>;
}