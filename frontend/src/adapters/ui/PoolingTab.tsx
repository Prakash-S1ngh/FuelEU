import { useEffect, useMemo, useState } from "react";
import { api } from "../infrastructure/apiclient";
import type { ComplianceBalance } from "../../core/domains/ComplianceBalance";

type PoolMember = ComplianceBalance & { selected?: boolean };

function computePooling(members: PoolMember[]) {
  // Work only with selected members
  const selected = members.filter((m) => m.selected);

  // start with cbBefore for selected
  const poolSum = selected.reduce((s, m) => s + (m.cbBefore ?? 0), 0);

  // initialize cbAfter to cbBefore
  const results: Record<string, { cbBefore: number; cbAfter: number }> = {};
  selected.forEach((m) => (results[m.shipId] = { cbBefore: m.cbBefore, cbAfter: m.cbBefore }));

  if (selected.length === 0) {
    return { results, poolSum, valid: false, reason: "No members selected" };
  }

  if (poolSum < 0) {
    return { results, poolSum, valid: false, reason: "Pool sum is negative" };
  }

  // separate surpluses and deficits
  const surplusShips = selected
    .map((m) => ({ ...m }))
    .filter((m) => m.cbBefore > 0)
    .map((m) => ({ shipId: m.shipId, remaining: m.cbBefore }));

  const deficitShips = selected
    .map((m) => ({ ...m }))
    .filter((m) => m.cbBefore < 0)
    .map((m) => ({ shipId: m.shipId, need: -m.cbBefore }));

  // Greedy allocation from surpluses to deficits
  for (const d of deficitShips) {
    let need = d.need;
    for (const s of surplusShips) {
      if (need <= 0) break;
      if (s.remaining <= 0) continue;
      const take = Math.min(s.remaining, need);
      s.remaining -= take;
      need -= take;
      results[d.shipId].cbAfter = results[d.shipId].cbAfter + take;
      results[s.shipId].cbAfter = results[s.shipId].cbAfter - take;
    }
    // After iterating surpluses, need should be 0 because poolSum >=0
    if (need > 1e-9) {
      // not fully covered -> invalid
      return { results, poolSum, valid: false, reason: "Could not cover deficits" };
    }
  }

  // Final checks
  for (const s of surplusShips) {
    if ((results[s.shipId].cbAfter ?? 0) < 0) {
      return { results, poolSum, valid: false, reason: "Surplus ship became negative" };
    }
  }

  for (const d of deficitShips) {
    if ((results[d.shipId].cbAfter ?? 0) < results[d.shipId].cbBefore) {
      return { results, poolSum, valid: false, reason: "Deficit ship exited worse" };
    }
  }

  return { results, poolSum, valid: true, reason: "OK" };
}

export default function PoolingTab() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const poolComputation = useMemo(() => computePooling(members), [members]);

  async function fetchAdjustedCBs() {
    setLoading(true);
    try {
      const res = await api.get(`/compliance/adjusted-cb?year=${year}`);
      // Expecting an array of ComplianceBalance
      const data: ComplianceBalance[] = res.data?.data ?? [];
      setMembers(data.map((d) => ({ ...d, selected: false })));
    } catch (err) {
      console.error(err);
      alert("Failed to fetch adjusted CBs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // fetch on mount
    fetchAdjustedCBs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSelect(shipId: string) {
    setMembers((m) => m.map((it) => (it.shipId === shipId ? { ...it, selected: !it.selected } : it)));
  }

  async function createPool() {
    if (!poolComputation.valid) {
      alert(`Pool invalid: ${poolComputation.reason}`);
      return;
    }
    const selectedIds = members.filter((m) => m.selected).map((m) => m.shipId);
    setCreating(true);
    try {
      await api.post(`/pools`, { year, members: selectedIds });
      alert("Pool created");
      // optionally refresh
      fetchAdjustedCBs();
      setMembers((m) => m.map((it) => ({ ...it, selected: false })));
    } catch (err) {
      console.error(err);
      alert("Failed to create pool");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pooling (Article 21)</h2>

      <div className="flex gap-2 items-center mb-4">
        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-2 py-1 rounded w-24"
        />
        <button
          onClick={fetchAdjustedCBs}
          className="bg-blue-500 text-white px-3 py-1 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Adjusted CBs"}
        </button>
      </div>

      <div className="mb-4">
        <strong>Pool Sum:</strong>{" "}
        <span className={poolComputation.poolSum < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
          {poolComputation.poolSum.toFixed(2)}
        </span>
        {" "}
        {!poolComputation.valid && <span className="ml-2 text-sm text-red-600">{poolComputation.reason}</span>}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Select</th>
            <th>Ship ID</th>
            <th>Year</th>
            <th>CB Before</th>
            <th>CB After (projected)</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const after = poolComputation.results[m.shipId]?.cbAfter ?? m.cbBefore;
            return (
              <tr key={m.shipId} className="border-t">
                <td className="p-2">
                  <input type="checkbox" checked={!!m.selected} onChange={() => toggleSelect(m.shipId)} />
                </td>
                <td>{m.shipId}</td>
                <td>{m.year}</td>
                <td>{m.cbBefore.toFixed(2)}</td>
                <td className={after < 0 ? "text-red-600" : "text-green-600"}>{after.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={createPool}
          disabled={!poolComputation.valid || creating || members.filter((m) => m.selected).length === 0}
          className={`px-4 py-2 rounded text-white ${!poolComputation.valid || members.filter((m) => m.selected).length === 0 ? "bg-gray-400" : "bg-green-600"}`}
        >
          {creating ? "Creating..." : "Create Pool"}
        </button>
      </div>
    </div>
  );
}
