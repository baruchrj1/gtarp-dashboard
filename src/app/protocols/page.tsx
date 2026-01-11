"use client";

import { useState } from "react";
import { Search, FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PublicProtocolsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setError("Digite um número de protocolo");
            return;
        }

        setIsLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch(`/api/protocols?id=${searchQuery.trim()}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Protocolo não encontrado");
                return;
            }

            setResult(data.report);
        } catch (err) {
            setError("Erro ao buscar protocolo");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "APPROVED":
                return { label: "Aprovada", icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
            case "REJECTED":
                return { label: "Rejeitada", icon: <XCircle className="w-5 h-5" />, color: "text-red-500 bg-red-500/10 border-red-500/20" };
            case "INVESTIGATING":
                return { label: "Em Investigação", icon: <AlertCircle className="w-5 h-5" />, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
            default:
                return { label: "Pendente", icon: <Clock className="w-5 h-5" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground font-display tracking-wide uppercase">
                        Consulta de <span className="text-primary">Protocolos</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Digite o número do protocolo para verificar o status da denúncia
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ex: 12345"
                                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Buscar
                        </button>
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center mb-6">
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        {/* Status Header */}
                        <div className={`p-4 flex items-center justify-between border-b border-border ${getStatusInfo(result.status).color}`}>
                            <div className="flex items-center gap-3">
                                {getStatusInfo(result.status).icon}
                                <span className="font-bold uppercase tracking-wider">
                                    {getStatusInfo(result.status).label}
                                </span>
                            </div>
                            <span className="font-mono text-sm">
                                Protocolo #{result.id}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Denunciado</p>
                                    <p className="font-bold text-foreground">{result.accusedName || result.accusedId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data</p>
                                    <p className="text-foreground">
                                        {new Date(result.createdAt).toLocaleDateString("pt-BR", { dateStyle: "long" })}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Motivo</p>
                                <p className="text-foreground">{result.reason}</p>
                            </div>

                            {result.accusedFamily && (
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Organização</p>
                                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
                                        {result.accusedFamily}
                                    </span>
                                </div>
                            )}

                            {result.adminNotes && (
                                <div className="mt-4 p-4 bg-secondary rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observações do Avaliador</p>
                                    <p className="text-foreground text-sm">{result.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
