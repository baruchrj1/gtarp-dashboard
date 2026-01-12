"use client";

import { useState, useEffect } from "react";
import { Save, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface WebhookConfig {
    webhook_new_report: string;
    webhook_report_approved: string;
    webhook_punishment_applied: string;
    webhook_player_banned: string;
}

interface TestResult {
    success: boolean;
    message: string;
}

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<WebhookConfig>({
        webhook_new_report: "",
        webhook_report_approved: "",
        webhook_punishment_applied: "",
        webhook_player_banned: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setWebhooks({
                    webhook_new_report: data.webhook_new_report || "",
                    webhook_report_approved: data.webhook_report_approved || "",
                    webhook_punishment_applied: data.webhook_punishment_applied || "",
                    webhook_player_banned: data.webhook_player_banned || "",
                });
            }
        } catch (error) {
            console.error("Error fetching webhooks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhooks),
            });

            if (res.ok) {
                alert("Webhooks salvos com sucesso!");
            } else {
                alert("Erro ao salvar webhooks");
            }
        } catch (error) {
            console.error("Error saving webhooks:", error);
            alert("Erro ao salvar webhooks");
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async (key: keyof WebhookConfig) => {
        const url = webhooks[key];
        if (!url) {
            alert("Configure o webhook antes de testar");
            return;
        }

        setTestingWebhook(key);
        try {
            const res = await fetch("/api/webhooks/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: key, url }),
            });

            const data = await res.json();
            setTestResults({
                ...testResults,
                [key]: {
                    success: res.ok,
                    message: data.message || (res.ok ? "Webhook enviado com sucesso!" : "Erro ao enviar webhook"),
                },
            });

            setTimeout(() => {
                setTestResults((prev) => {
                    const newResults = { ...prev };
                    delete newResults[key];
                    return newResults;
                });
            }, 5000);
        } catch (error) {
            setTestResults({
                ...testResults,
                [key]: {
                    success: false,
                    message: "Erro de conexão",
                },
            });
        } finally {
            setTestingWebhook(null);
        }
    };

    const webhookLabels: Record<keyof WebhookConfig, string> = {
        webhook_new_report: "Nova Denúncia Criada",
        webhook_report_approved: "Denúncia Aprovada",
        webhook_punishment_applied: "Punição Aplicada",
        webhook_player_banned: "Jogador Banido",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Configuração de Webhooks</h1>
                <p className="text-muted-foreground">
                    Configure webhooks do Discord para receber notificações automáticas de eventos importantes.
                </p>
            </div>

            <div className="space-y-6">
                {(Object.keys(webhooks) as Array<keyof WebhookConfig>).map((key) => {
                    const testResult = testResults[key];
                    return (
                        <div key={key} className="bg-card border border-border rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block font-bold text-foreground">{webhookLabels[key]}</label>
                                {testResult && (
                                    <div
                                        className={`flex items-center gap-2 text-sm ${testResult.success ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {testResult.success ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                        {testResult.message}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={webhooks[key]}
                                    onChange={(e) => setWebhooks({ ...webhooks, [key]: e.target.value })}
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://discord.com/api/webhooks/..."
                                />
                                <button
                                    onClick={() => handleTest(key)}
                                    disabled={testingWebhook === key || !webhooks[key]}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    {testingWebhook === key ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <TestTube className="w-4 h-4" />
                                    )}
                                    Testar
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                {key === "webhook_new_report" &&
                                    "Enviado quando um jogador cria uma nova denúncia"}
                                {key === "webhook_report_approved" &&
                                    "Enviado quando um avaliador aprova uma denúncia"}
                                {key === "webhook_punishment_applied" &&
                                    "Enviado quando uma punição é aplicada a um jogador"}
                                {key === "webhook_player_banned" &&
                                    "Enviado quando um jogador é banido permanentemente"}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saving ? "Salvando..." : "Salvar Configurações"}
                </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">💡 Como configurar</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Acesse o servidor Discord e vá em Configurações do Servidor</li>
                    <li>Clique em "Integrações" → "Webhooks" → "Novo Webhook"</li>
                    <li>Escolha o canal onde deseja receber as notificações</li>
                    <li>Copie a URL do webhook e cole acima</li>
                    <li>Clique em "Testar" para verificar se está funcionando</li>
                    <li>Salve as configurações</li>
                </ol>
            </div>
        </div>
    );
}
