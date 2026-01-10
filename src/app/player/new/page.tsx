"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import { ShieldAlert, Send } from "lucide-react";

export default function NewPlayerReportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        accusedId: "",
        reason: "",
        description: "",
        evidence: "",
        accusedName: "", // Added this field
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const isLoadingAuth = status === "loading";
    const isAuthenticated = status === "authenticated";

    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <p className="text-zinc-500">Você precisa estar autenticado para acessar esta área.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erro ao enviar denúncia");
            }

            router.push("/player/reports"); // Redirect to reports list
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar denúncia");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlayerSidebar />
            </aside>

            <main className="flex-1 min-w-0">
                <div className="bg-black/40 p-6 rounded border border-white/5 mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                        Nova <span className="text-primary">Denúncia</span>
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                        Preencha o formulário com detalhes precisos. Falsas denúncias são passíveis de punição.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="bg-black/40 border border-white/5 rounded p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    ID do Acusado (Passaporte) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Ex: 12345"
                                    value={formData.accusedId}
                                    onChange={(e) => setFormData({ ...formData, accusedId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Nome do Acusado (Opcional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Ex: João Silva"
                                    value={formData.accusedName}
                                    onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                Motivo da Denúncia <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-primary outline-none appearance-none cursor-pointer"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value="" className="bg-zinc-900 text-zinc-500">Selecione um motivo...</option>
                                    <option value="RDM" className="bg-zinc-900">RDM (Random Death Match)</option>
                                    <option value="VDM" className="bg-zinc-900">VDM (Vehicle Death Match)</option>
                                    <option value="Combat Logging" className="bg-zinc-900">Combat Logging</option>
                                    <option value="Metagaming" className="bg-zinc-900">Metagaming</option>
                                    <option value="Bugs" className="bg-zinc-900">Aproveitamento de Bugs</option>
                                    <option value="Toxidade" className="bg-zinc-900">Toxidade / Ofensa</option>
                                    <option value="Outros" className="bg-zinc-900">Outros</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                Descrição Detalhada
                            </label>
                            <textarea
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-primary outline-none min-h-[120px] placeholder-zinc-600"
                                placeholder="Descreva exatamente o que aconteceu, incluindo o contexto..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                Link das Provas (Vídeo/Print) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                                placeholder="https://youtube.com/..."
                                value={formData.evidence}
                                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                            />
                            <p className="text-xs text-zinc-500 mt-1 flex items-center">
                                <ShieldAlert className="w-3 h-3 mr-1" />
                                Denúncias sem provas verificáveis serão automaticamente rejeitadas.
                            </p>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full gta-btn h-14 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                        ENVIANDO...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Send className="w-5 h-5" />
                                        ENVIAR DENÚNCIA
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
