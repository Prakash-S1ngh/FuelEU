import { useEffect, useState } from "react";
import { api } from "../infrastructure/apiclient";
import type { ComplianceBalance } from "../../core/domains/ComplianceBalance";

export default function BankingTab() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [records, setRecords] = useState<ComplianceBalance[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [applyAmount, setApplyAmount] = useState<Record<string, string>>({});

  async function fetchCBs() {
    setLoading(true);
    try {
      const res = await api.get(`/compliance/cb?year=${year}`);
      const data: ComplianceBalance[] = res.data?.data ?? [];
      setRecords(data);
        // fetch available bank balance per ship (best-effort)
        try {
          const bals = await Promise.all(
            data.map(async (d) => {
              const r = await api.get(`/banking/balance?shipId=${d.shipId}&year=${year}`);
              return { shipId: d.shipId, available: r.data?.data?.available ?? 0 };
            })
          );
          const map: Record<string, number> = {};
          for (const b of bals) map[b.shipId] = b.available;
          setBalances(map);
        } catch (e) {
          console.warn("Failed to fetch balances", e);
        }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Failed to fetch compliance balances");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCBs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cbApplied(before?: number, after?: number) {
    if (typeof before !== "number") return 0;
    if (typeof after !== "number") return 0;
    return after - before;
  }

  async function bank(shipId: string, amount: number) {
    setActionLoading((s) => ({ ...s, [shipId]: true }));
    try {
      await api.post(`/banking/bank`, { shipId, year, amount });
      await fetchCBs();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Failed to bank CB");
    } finally {
      setActionLoading((s) => ({ ...s, [shipId]: false }));
    }
  }

  async function applyToDeficit(shipId: string, amount: number) {
    setActionLoading((s) => ({ ...s, [shipId]: true }));
    try {
      await api.post(`/banking/apply`, { shipId, year, amount });
      await fetchCBs();
      setApplyAmount((s) => ({ ...s, [shipId]: "" }));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Failed to apply banked amount");
    } finally {
      setActionLoading((s) => ({ ...s, [shipId]: false }));
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Banking (Article 20)</h2>

      <div className="flex gap-2 items-center mb-4">
        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-2 py-1 rounded w-24"
        />
        <button onClick={fetchCBs} className="bg-blue-500 text-white px-3 py-1 rounded" disabled={loading}>
          {loading ? "Loading..." : "Fetch CBs"}
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Ship ID</th>
            <th>CB Before</th>
            <th>Applied</th>
            <th>CB After</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const before = r.cbBefore;
            const after = r.cbAfter ?? r.cbBefore;
            const applied = cbApplied(before, r.cbAfter);
            const canBank = (before ?? 0) > 0;
            const canApply = (before ?? 0) < 0;
            return (
              <tr key={r.shipId} className="border-t">
                <td className="p-2">{r.shipId}</td>
                <td>{(before ?? 0).toFixed(2)}</td>
                <td className={applied > 0 ? "text-green-600" : applied < 0 ? "text-blue-600" : ""}>
                  {applied.toFixed(2)}
                </td>
                <td className={after < 0 ? "text-red-600" : "text-green-600"}>{after.toFixed(2)}</td>
                <td className="p-2">
                  <div className="flex gap-2 items-center">
                    <div className="text-sm mr-2">Available: {(balances[r.shipId] ?? 0).toFixed(2)}</div>
                    <button
                      onClick={() => bank(r.shipId, Math.max(before ?? 0, 0))}
                      disabled={!canBank || !!actionLoading[r.shipId]}
                      className={`px-3 py-1 rounded text-white ${!canBank ? "bg-gray-400" : "bg-indigo-600"}`}
                    >
                      {actionLoading[r.shipId] ? "..." : "Bank"}
                    </button>

                    {canApply && (
                      <>
                        <input
                          type="number"
                          value={applyAmount[r.shipId] ?? ""}
                          onChange={(e) => setApplyAmount((s) => ({ ...s, [r.shipId]: e.target.value }))}
                          placeholder="amount"
                          className="border px-2 py-1 rounded w-24"
                        />
                        <button
                          onClick={() => applyToDeficit(r.shipId, Number(applyAmount[r.shipId] ?? 0))}
                          disabled={
                            !!actionLoading[r.shipId] ||
                            !(Number(applyAmount[r.shipId] ?? 0) > 0) ||
                            Number(applyAmount[r.shipId] ?? 0) > (balances[r.shipId] ?? 0)
                          }
                          className={`px-3 py-1 rounded text-white ${!(Number(applyAmount[r.shipId] ?? 0) > 0) ? "bg-gray-400" : "bg-green-600"}`}
                        >
                          {actionLoading[r.shipId] ? "..." : "Apply"}
                        </button>
                        {Number(applyAmount[r.shipId] ?? 0) > (balances[r.shipId] ?? 0) && (
                          <div className="text-sm text-red-600 ml-2">Insufficient banked credits</div>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
