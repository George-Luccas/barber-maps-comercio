
"use client";

import { useState } from "react";

export default function ClientSimulationPage() {
  const [shopId, setShopId] = useState("a4061b12-3c70-42d0-bb19-f5f0d6a12d68");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const simulateRequests = async () => {
    setLoading(true);
    setResults(null);

    const logs: string[] = [];
    const addLog = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

    try {
      // 1. Simulate Shop Detail Request
      addLog(`Fetching Shop Details: /api/external/v1/shops/${shopId}...`);
      const shopRes = await fetch(`/api/external/v1/shops/${shopId}`, {
        headers: { "Authorization": "Bearer sk_ryw3jqn5b_ml1r6ge0" } // Fixed header
      });
      
      const shopStatus = shopRes.status;
      const shopData = await shopRes.json();
      addLog(`Shop Response: ${shopStatus} ${shopRes.statusText}`);

      // 2. Simulate Services Request
      addLog(`Fetching Services: /api/external/v1/shops/${shopId}/services...`);
      const servicesRes = await fetch(`/api/external/v1/shops/${shopId}/services`, {
        headers: { "Authorization": "Bearer sk_ryw3jqn5b_ml1r6ge0" }
      });

      const servicesStatus = servicesRes.status;
      let servicesData;
      const servicesText = await servicesRes.text();
      try {
        servicesData = JSON.parse(servicesText);
      } catch (e) {
        servicesData = { error: "Failed to parse JSON", rawResponse: servicesText.slice(0, 500) };
      }
      addLog(`Services Response: ${servicesStatus} ${servicesRes.statusText}`);

      setResults((prev: any) => ({
        ...prev,
        services: { status: servicesStatus, data: servicesData },
        logs
      }));

    } catch (error) {
      addLog(`CRITICAL ERROR: ${error}`);
      setResults((prev: any) => ({ ...prev, error: String(error), logs }));
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setLoading(true);
    const logs: string[] = [];
    const addLog = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    
    try {
      addLog("Checking System Health...");
      const res = await fetch("/api/external/v1/health");
      const status = res.status;
      const data = await res.json();
      addLog(`Health Status: ${status}`);
      setResults({ health: { status, data }, logs });
    } catch (e) {
      addLog(`HEALTH CHECK FAILED: ${e}`);
      setResults({ error: String(e), logs });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Simulador do "Client App" (Barber Maps)</h1>
      <p className="text-gray-500 mb-6">
        Esta página simula exatamente o que o site de clientes faz. Use isso para provar se a API está funcionando ou não.
      </p>

      <div className="flex gap-4">
        <input 
          value={shopId} 
          onChange={(e) => setShopId(e.target.value)} 
          placeholder="Cole u ID ou Slug da loja aqui..." 
          className="flex-1 p-2 border rounded border-gray-300 dark:bg-slate-800 dark:border-slate-700"
        />
        <button 
          onClick={simulateRequests} 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testando..." : "Simular Acesso"}
        </button>
        <button 
          onClick={checkHealth} 
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          Testar Saúde (DB)
        </button>
      </div>

      {results?.error && (
        <div className="border rounded-lg p-4 border-red-500 bg-red-50/10 text-red-600">
           <h3 className="font-bold">❌ Erro Crítico na Execução do Teste</h3>
           <p>{results.error}</p>
        </div>
      )}

      {results && results.health && (
        <div className={`border rounded-lg p-4 ${results.health.status === 200 ? "border-green-500 bg-green-50/10" : "border-red-500 bg-red-50/10"}`}>
            <h3 className="font-semibold mb-2">Relatório de Saúde do Sistema</h3>
            <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded overflow-auto">
              {JSON.stringify(results.health.data, null, 2)}
            </pre>
        </div>
      )}

      {results && !results.health && !results.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Shop Detail Result */}
          {results.shop && (
          <div className={`border rounded-lg p-4 ${results.shop.status === 200 ? "border-green-500 bg-green-50/10" : "border-red-500 bg-red-50/10"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">1. Detalhes da Loja</h3>
              <span className={`px-2 py-1 rounded text-xs ${results.shop.status === 200 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                Status: {results.shop.status}
              </span>
            </div>
            <div className="overflow-auto max-h-[300px]">
              <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded">
                {JSON.stringify(results.shop.data, null, 2)}
              </pre>
            </div>
          </div>
          )}

          {/* Services Result */}
          {results.services && (
          <div className={`border rounded-lg p-4 ${results.services.status === 200 ? "border-green-500 bg-green-50/10" : "border-red-500 bg-red-50/10"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">2. Lista de Serviços</h3>
              <span className={`px-2 py-1 rounded text-xs ${results.services.status === 200 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                Status: {results.services.status}
              </span>
            </div>
            <div className="overflow-auto max-h-[300px]">
              <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded">
                {JSON.stringify(results.services.data, null, 2)}
              </pre>
            </div>
          </div>
          )}
        </div>
      )}

      {results?.logs && (
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold mb-2">Logs da Simulação</h3>
          <div className="overflow-auto max-h-[200px]">
            <ul className="text-sm font-mono space-y-1">
              {results.logs.map((log: string, i: number) => (
                <li key={i} className="border-b pb-1 last:border-0 border-gray-100 dark:border-slate-800">{log}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
