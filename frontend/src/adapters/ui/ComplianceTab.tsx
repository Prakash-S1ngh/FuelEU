// src/adapters/ui/tabs/ComplianceTab.tsx
import React, { useState } from "react";
import { useCompliance } from "../../core/Application/useCompliance";



export default function ComplianceTab() {
  const { cb, fetchCB, fetchAdjustedCB } = useCompliance();
  const [shipId, setShipId] = useState("");
  const [year, setYear] = useState(2025);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Compliance Balance</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ship ID"
          value={shipId}
          onChange={(e) => setShipId(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2 rounded"
        />
        <button
          onClick={() => fetchCB(shipId, year)}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Fetch CB
        </button>
        <button
          onClick={() => fetchAdjustedCB(shipId, year)}
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          Fetch Adjusted CB
        </button>
      </div>

      {cb && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <p>Ship ID: <b>{cb.shipId}</b></p>
          <p>Year: <b>{cb.year}</b></p>
          <p>CB Before: <b className="text-blue-600">{cb.cbBefore}</b></p>
          {cb.cbAfter !== undefined && (
            <p>CB After: <b className="text-green-600">{cb.cbAfter}</b></p>
          )}
        </div>
      )}
    </div>
  );
}