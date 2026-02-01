
"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";

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
        headers: { "x-api-key": "sk_ryw3jqn5b_ml1r6ge0" } // Simulating the key
      });
      
      const shopStatus = shopRes.status;
      const shopData = await shopRes.json();
      addLog(`Shop Response: ${shopStatus} ${shopRes.statusText}`);

      // 2. Simulate Services Request
      addLog(`Fetching Services: /api/external/v1/shops/${shopId}/services...`);
      const servicesRes = await fetch(`/api/external/v1/shops/${shopId}/services`, {
        headers: { "x-api-key": "sk_ryw3jqn5b_ml1r6ge0" }
      });

      const servicesStatus = servicesRes.status;
      const servicesData = await servicesRes.json();
      addLog(`Services Response: ${servicesStatus} ${servicesRes.statusText}`);

      setResults({
        shop: { status: shopStatus, data: shopData },
        services: { status: servicesStatus, data: servicesData },
        logs
      });

    } catch (error) {
      addLog(`CRITICAL ERROR: ${error}`);
      setResults({ error: String(error), logs });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Simulador do "Client App" (Barber Maps)</h1>
      <p className="text-muted-foreground mb-6">
        Esta página simula exatamente o que o site de clientes faz. Use isso para provar se a API está funcionando ou não.
      </p>

      <div className="flex gap-4">
        <Input 
          value={shopId} 
          onChange={(e) => setShopId(e.target.value)} 
          placeholder="Cole u ID ou Slug da loja aqui..." 
          className="flex-1"
        />
        <Button onClick={simulateRequests} disabled={loading}>
          {loading ? "Testando..." : "Simular Acesso do Cliente"}
        </Button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Shop Detail Result */}
          <Card className={results.shop.status === 200 ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                1. Detalhes da Loja
                <Badge variant={results.shop.status === 200 ? "default" : "destructive"}>
                  Status: {results.shop.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded overflow-auto max-h-[300px]">
                {JSON.stringify(results.shop.data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Services Result */}
          <Card className={results.services.status === 200 ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                2. Lista de Serviços
                <Badge variant={results.services.status === 200 ? "default" : "destructive"}>
                  Status: {results.services.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded overflow-auto max-h-[300px]">
                {JSON.stringify(results.services.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {results?.logs && (
        <Card>
          <CardHeader><CardTitle>Logs da Simulação</CardTitle></CardHeader>
          <CardContent>
            <ul className="text-sm font-mono space-y-1">
              {results.logs.map((log: string, i: number) => (
                <li key={i} className="border-b pb-1 last:border-0">{log}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
