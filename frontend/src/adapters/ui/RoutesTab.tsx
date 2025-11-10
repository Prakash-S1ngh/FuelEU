import React, { useMemo, useState } from "react";
import type { Route } from "../../core/domains/Route";
import { useRoutes as useRouteService } from "../../core/Application/RouteService";

export default function RoutesTab() {
  const { routes, loading, setBaseline } = useRouteService();

  const [routeIdFilter, setRouteIdFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<number | "">("");

  // ✅ Flatten data if backend returns { props: {...} }
  const flatRoutes: Route[] = useMemo(() => {
    if (!routes) return [];
    return (routes as any[]).map((r) => r.props ?? r);
  }, [routes]);

  // ✅ Unique years
  const years = useMemo(() => {
    return Array.from(new Set(flatRoutes.map((r) => r.year).filter(Boolean))).sort();
  }, [flatRoutes]);

  // ✅ Apply filters
  const filtered = flatRoutes.filter((r) => {
    if (routeIdFilter && !r.route_id.toLowerCase().includes(routeIdFilter.toLowerCase())) return false;
    if (yearFilter !== "" && r.year !== yearFilter) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        🚢 Route Management
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 bg-white p-4 rounded-xl shadow-sm sticky top-0 z-10 border border-gray-100">
        <input
          type="text"
          placeholder="🔍 Filter by Route ID"
          value={routeIdFilter}
          onChange={(e) => setRouteIdFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-60 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <select
          value={yearFilter}
          onChange={(e) =>
            setYearFilter(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">
            ⏳ Loading routes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No routes found 🚫</div>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-blue-50 text-gray-800 uppercase text-xs font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">Route ID</th>
                <th className="px-4 py-3 text-left">Vessel</th>
                <th className="px-4 py-3 text-left">Fuel</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Intensity (gCO₂e/MJ)</th>
                <th className="px-4 py-3 text-left">Consumption (t)</th>
                <th className="px-4 py-3 text-left">Distance (km)</th>
                <th className="px-4 py-3 text-left">Total Emissions (t)</th>
                <th className="px-4 py-3 text-left">Baseline</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-t hover:bg-blue-50 transition-all ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{r.route_id}</td>
                  <td className="px-4 py-3">{r.vessel_type ?? "—"}</td>
                  <td className="px-4 py-3">{r.fuel_type ?? "—"}</td>
                  <td className="px-4 py-3">{r.year}</td>
                  <td className="px-4 py-3">{Number(r.ghg_intensity).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {r.fuel_consumption
                      ? Number(r.fuel_consumption).toFixed(0)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.distance ? Number(r.distance).toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.total_emissions
                      ? Number(r.total_emissions).toFixed(0)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.is_baseline ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 font-semibold text-xs">
                        ✓ Baseline
                      </span>
                    ) : (
                      <button
                        onClick={() => setBaseline(r.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs transition-all"
                      >
                        Set as Baseline
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}