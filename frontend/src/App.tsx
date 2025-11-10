import { useState } from "react";
import "./App.css";
import RoutesTab from "./adapters/ui/RoutesTab";
import ComplianceTab from "./adapters/ui/ComplianceTab";
import PoolingTab from "./adapters/ui/PoolingTab";
import BankingTab from "./adapters/ui/BankingTab";
import CompareTab from "./adapters/ui/CompareTab";

type TabKey = "routes" | "compliance" | "pooling" | "banking" | "compare";

function App() {
  const [tab, setTab] = useState<TabKey>("routes");

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">FuelEU — Admin</h1>
      </header>

      <nav className="flex gap-2 mb-4">
        <button onClick={() => setTab("routes")} className={`px-3 py-1 rounded ${tab === "routes" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Routes
        </button>
        <button onClick={() => setTab("compliance")} className={`px-3 py-1 rounded ${tab === "compliance" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Compliance
        </button>
        <button onClick={() => setTab("pooling")} className={`px-3 py-1 rounded ${tab === "pooling" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Pooling
        </button>
        <button onClick={() => setTab("compare")} className={`px-3 py-1 rounded ${tab === "compare" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Compare
        </button>
        <button onClick={() => setTab("banking")} className={`px-3 py-1 rounded ${tab === "banking" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Banking
        </button>
      </nav>

      <main>
        {tab === "routes" && <RoutesTab />}
        {tab === "compliance" && <ComplianceTab />}
  {tab === "pooling" && <PoolingTab />}
  {tab === "compare" && <CompareTab />}
        {tab === "banking" && <BankingTab />}
      </main>
    </div>
  );
}

export default App;
