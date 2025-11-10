import { useEffect, useState } from "react";
import { api } from "../infrastructure/apiclient";

const TARGET = 89.3368; // gCO2e/MJ (2% below 91.16)

type RawItem = Record<string, any>;

function pickNumber(item: RawItem, keys: string[]) {
  for (const k of keys) {
    const v = item[k];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

export default function CompareTab() {
  const [items, setItems] = useState<RawItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchComparison() {
    setLoading(true);
    try {
      const res = await api.get("/routes/comparison");
      const data: RawItem[] = res.data?.data ?? [];
      setItems(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch comparison data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComparison();
  }, []);

  // normalize
  const normalized = items.map((it) => {
    const routeId = it.routeId ?? it.id ?? it.route_id ?? String(it.route || "");
    const baseline = pickNumber(it, ["baseline", "baselineIntensity", "ghgBaseline", "ghgIntensityBaseline", "ghgIntensity", "baseline_ghg", "base"]);
    const comparison = pickNumber(it, ["comparison", "comparisonIntensity", "ghgComparison", "ghgIntensityComparison", "comp", "comparison_ghg"]);

    // fallback: some APIs return objects like { baseline: { ghgIntensity: ... }, comparison: { ghgIntensity: ... } }
    const baselineFallback = baseline ?? pickNumber(it.baseline ?? {}, ["ghgIntensity", "ghgIntensityValue", "value"]);
    const comparisonFallback = comparison ?? pickNumber(it.comparison ?? {}, ["ghgIntensity", "ghgIntensityValue", "value"]);

    const b = baselineFallback ?? 0;
    const c = comparisonFallback ?? 0;
    const percentDiff = b === 0 ? 0 : ((c / b - 1) * 100);
    const compliant = c <= TARGET;

    return { routeId, baseline: b, comparison: c, percentDiff, compliant };
  });

  const maxVal = Math.max(1, ...normalized.flatMap((n) => [n.baseline, n.comparison]));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Compare Routes</h2>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={fetchComparison} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
        <div className="text-sm text-gray-600">Target: <b>{TARGET.toFixed(4)} gCO₂e/MJ</b></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Route</th>
                <th>Baseline</th>
                <th>Comparison</th>
                <th>% Diff</th>
                <th>Compliant</th>
              </tr>
            </thead>
            <tbody>
              {normalized.map((n) => (
                <tr key={n.routeId} className="border-t">
                  <td className="p-2">{n.routeId}</td>
                  <td>{n.baseline.toFixed(4)}</td>
                  <td>{n.comparison.toFixed(4)}</td>
                  <td className={n.percentDiff > 0 ? "text-red-600" : "text-green-600"}>{n.percentDiff.toFixed(2)}%</td>
                  <td>{n.compliant ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">GHG Intensity Comparison</h3>
          <svg width="100%" height="240" viewBox={`0 0 600 240`} preserveAspectRatio="xMidYMid meet">
            {/* simple bars: two bars per route */}
            {normalized.map((n, i) => {
              const gap = 8;
              const barWidth = 12;
              const x = 40 + i * (barWidth * 2 + gap + 12);
              const baseY = 200;
              const scale = 160 / maxVal;
              const h1 = n.baseline * scale;
              const h2 = n.comparison * scale;
              return (
                <g key={n.routeId}>
                  <rect x={x} y={baseY - h1} width={barWidth} height={h1} fill="#60a5fa" />
                  <rect x={x + barWidth + 2} y={baseY - h2} width={barWidth} height={h2} fill="#34d399" />
                  <text x={x} y={baseY + 14} fontSize={10}>{n.routeId}</text>
                </g>
              );
            })}
            {/* axis */}
            <line x1={20} y1={200} x2={580} y2={200} stroke="#333" strokeWidth={1} />
          </svg>
        </div>
      </div>
    </div>
  );
}
