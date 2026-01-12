"use client";

import { useState } from "react";
import useSWR from "swr";
import { RefreshCw, Copy, Check, Server, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { PageLoading } from "@/components/ui/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ServerSettingsPage() {
    const { data, mutate, isLoading } = useSWR("/api/admin/settings/server-token", fetcher);
    const toast = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const token = data?.token;

    const handleGenerate = async () => {
        if (token && !confirm("Gerar um novo token invalidará o anterior e desconectará o servidor até que você atualize o config.lua. Continuar?")) {
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/admin/settings/server-token", { method: "POST" });
            if (!res.ok) throw new Error("Falha ao gerar");
            await mutate();
            toast.success("Token Gerado", "Atualize seu config.lua com o novo token.");
        } catch (e) {
            toast.error("Erro", "Não foi possível gerar o token.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!token) return;
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copiado", "Token copiado para a área de transferência.");
    };

    if (isLoading) return <PageLoading />;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Server className="w-8 h-8 text-primary" /> Integração com Servidor FiveM
                </h1>
                <p className="text-muted-foreground mt-2">
                    Conecte seu servidor FiveM ao painel para sincronizar jogadores, logs e banimentos.
                </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground mb-4">Token de Acesso (Secret)</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Este token autentica seu servidor FiveM. Coloque-o no arquivo <code className="bg-secondary px-1 py-0.5 rounded text-primary">config.lua</code> do resource.
                    </p>

                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                readOnly
                                value={token || "Nenhum token gerado"}
                                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary"
                                type="password" // Ocultar por segurança visual inicial? Ou deixar texto
                            />
                            {/* Make it togglable visible later? For now just text, assume admin access implies permission to see */}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            disabled={!token}
                            className="p-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors disabled:opacity-50"
                            title="Copiar Token"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    {!token && (
                        <div className="flex items-center gap-2 mt-3 text-yellow-500 text-sm bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Você precisa gerar um token para ativar a integração.</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-border pt-6">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <RefreshCw className="w-5 h-5" />
                        )}
                        {token ? "Redefinir Token" : "Gerar Token"}
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Instalação Manual</h2>
                <div className="space-y-4 text-sm text-muted-foreground">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Baixe a pasta <code className="text-primary">fivem-resource</code> do projeto.</li>
                        <li>Coloque na pasta <code className="text-primary">resources</code> do seu servidor.</li>
                        <li>Abra o arquivo <code className="text-primary">config.lua</code>.</li>
                        <li>Cole o token gerado acima na variável <code className="text-primary">Config.SecretToken</code>.</li>
                        <li>Adicione <code className="text-primary">ensure dashboard-sync</code> no seu server.cfg.</li>
                        <li>Reinicie o servidor.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
