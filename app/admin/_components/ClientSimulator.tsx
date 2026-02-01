
"use client";

import { useState } from "react";
import { Copy, Activity, Server, Smartphone, Calendar } from "lucide-react";

export function ClientSimulator() {
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
                headers: { "Authorization": "Bearer sk_ryw3jqn5b_ml1r6ge0" }
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

    const simulateBooking = async () => {
        setLoading(true);
        const logs: string[] = [];
        const addLog = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

        try {
            addLog("Preparing Booking Test...");
            const date = new Date();
            date.setDate(date.getDate() + 1); // Tomorrow
            date.setHours(10, 0, 0, 0);
            const dateStr = date.toISOString();

            // 1. Get Service ID (Need one to book)
            addLog(`Fetching Services to pick one...`);
            const servicesRes = await fetch(`/api/external/v1/shops/${shopId}/services`, {
                headers: { "Authorization": "Bearer sk_ryw3jqn5b_ml1r6ge0" }
            });
            const services = await servicesRes.json();
            if (!services || services.length === 0) throw new Error("No services found to book");
            const serviceId = services[0].id;
            addLog(`Selected Service: ${serviceId}`);

            // 2. Send Booking Request
            const payload = {
                serviceId,
                date: dateStr,
                user: {
                    name: "Simulador Admin",
                    email: "simulador@admin.com",
                    phone: "99999999999"
                }
            };
            addLog(`POST /api/external/v1/bookings...`);
            
            const res = await fetch("/api/external/v1/bookings", {
                method: "POST",
                headers: { 
                    "Authorization": "Bearer sk_ryw3jqn5b_ml1r6ge0",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const status = res.status;
            const data = await res.json();
            addLog(`Booking Response: ${status}`);

            setResults({ booking: { status, data }, logs });

        } catch (e) {
            addLog(`BOOKING TEST FAILED: ${e}`);
            setResults({ error: String(e), logs });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <Smartphone size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Simulador de <span className="text-purple-500">Cliente</span></h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Teste de Acesso Externo</p>
                </div>
            </header>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                <p className="text-sm text-muted-foreground">
                    Simule como o aplicativo do cliente enxerga a API. Use isso para diagnosticar erros de conexão ou validação.
                </p>

                <div className="flex gap-4 flex-col md:flex-row">
                    <input
                        value={shopId}
                        onChange={(e) => setShopId(e.target.value)}
                        placeholder="ID ou Slug da loja..."
                        className="flex-1 p-2 border rounded-lg bg-background border-border"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={simulateRequests}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            <Smartphone size={16} />
                            {loading ? "Testando..." : "Simular App"}
                        </button>
                        <button
                            onClick={checkHealth}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            <Activity size={16} />
                            Check DB
                        </button>
                        <button
                            onClick={simulateBooking}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            <Calendar size={16} />
                            Agendar Teste
                        </button>
                    </div>
                </div>

                {/* ERROR DISPLAY */}
                {results?.error && (
                    <div className="border rounded-lg p-4 border-red-500 bg-red-500/10 text-red-500">
                        <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                            <Activity size={16} /> Erro Crítico
                        </h3>
                        <p className="text-xs font-mono mt-2">{results.error}</p>
                    </div>
                )}

                {/* BOOKING RESULT */}
                {results?.booking && (
                     <div className={`border rounded-xl p-4 ${results.booking.status === 201 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Resultado do Agendamento
                            </h3>
                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${results.booking.status === 201 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                HTTP {results.booking.status}
                            </span>
                        </div>
                        <div className="overflow-auto max-h-[300px]">
                            <pre className="text-[10px] bg-black/5 dark:bg-black/50 p-4 rounded-lg font-mono">
                                {JSON.stringify(results.booking.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* HEALTH REPORT */}
                {results && results.health && (
                    <div className={`border rounded-xl p-4 ${results.health.status === 200 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                        <h3 className={`font-bold text-xs uppercase tracking-widest mb-2 ${results.health.status === 200 ? "text-green-500" : "text-red-500"}`}>Relatório de Saúde</h3>
                        <pre className="text-[10px] bg-black/5 dark:bg-black/50 p-4 rounded-lg overflow-auto max-h-[200px] font-mono">
                            {JSON.stringify(results.health.data, null, 2)}
                        </pre>
                    </div>
                )}

                {/* API SIMULATION REPORT */}
                {results && !results.health && !results.error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Shop Detail Result */}
                        {results.shop && (
                            <div className={`border rounded-xl p-4 ${results.shop.status === 200 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Server size={14} /> 1. Detalhes da Loja
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${results.shop.status === 200 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                        HTTP {results.shop.status}
                                    </span>
                                </div>
                                <div className="overflow-auto max-h-[300px]">
                                    <pre className="text-[10px] bg-black/5 dark:bg-black/50 p-4 rounded-lg font-mono">
                                        {JSON.stringify(results.shop.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Services Result */}
                        {results.services && (
                            <div className={`border rounded-xl p-4 ${results.services.status === 200 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Copy size={14} /> 2. Lista de Serviços
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${results.services.status === 200 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                        HTTP {results.services.status}
                                    </span>
                                </div>
                                <div className="overflow-auto max-h-[300px]">
                                    <pre className="text-[10px] bg-black/5 dark:bg-black/50 p-4 rounded-lg font-mono">
                                        {JSON.stringify(results.services.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* LOGS */}
                {results?.logs && (
                    <div className="bg-muted/50 p-4 rounded-xl border border-border">
                         <h3 className="font-bold text-[10px] uppercase tracking-widest mb-2 text-muted-foreground">Logs de Execução</h3>
                         <ul className="text-[10px] font-mono space-y-1 text-muted-foreground">
                            {results.logs.map((log: string, i: number) => (
                                <li key={i} className="border-b border-border/50 pb-1 last:border-0">{log}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
