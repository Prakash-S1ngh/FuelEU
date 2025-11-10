// src/core/application/useCompliance.ts
import { useState } from "react";
import { ComplianceAPI } from "../../adapters/infrastructure/Compliance";
import type { ComplianceBalance } from "../domains/ComplianceBalance";



const api = new ComplianceAPI();

export function useCompliance() {
  const [cb, setCb] = useState<null | ComplianceBalance>(null);

  async function fetchCB(shipId: string, year: number) {
    const data = await api.getCB(shipId, year);
    setCb(data);
  }

  async function fetchAdjustedCB(shipId: string, year: number) {
    const data = await api.getAdjustedCB(shipId, year);
    setCb(data);
  }

  return { cb, fetchCB, fetchAdjustedCB };
}