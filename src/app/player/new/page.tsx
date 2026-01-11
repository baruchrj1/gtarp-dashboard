"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import { ShieldAlert, Send, Plus, Trash2 } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { PageTransition } from "@/components/ui/PageTransition";

export default function NewPlayerReportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();

    const [formData, setFormData] = useState({
        accusedId: "",
        reason: "",
        description: "",
        evidence: [""],
        accusedName: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoadingAuth = status === "loading";
    const isAuthenticated = status === "authenticated";

    const handleEvidenceChange = useCallback((index: number, value: string) => {
        setFormData((prev) => {
            const newEvidence = [...prev.evidence];
            newEvidence[index] = value;
            return { ...prev, evidence: newEvidence };
        });
    }, []);

    const addEvidenceField = useCallback(() => {
        setFormData((prev) => ({ ...prev, evidence: [...prev.evidence, ""] }));
    }, []);

    const removeEvidenceField = useCallback((index: number) => {
        setFormData((prev) => {
            if (prev.evidence.length > 1) {
                return { ...prev, evidence: prev.evidence.filter((_, i) => i !== index) };
            }
            return prev;
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Filter out empty evidence links
            const validEvidence = formData.evidence.filter((link) => link.trim() !== "");

            if (validEvidence.length === 0) {
                toast.error("Erro de validacao", "Voce deve fornecer pelo menos um link de prova.");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                ...formData,
                evidence: validEvidence,
            };

            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erro ao enviar denuncia");
            }

            toast.success("Denuncia enviada!", "Sua denuncia foi registrada com sucesso.");

            // Small delay for user to see the success message
            setTimeout(() => {
                router.push("/player/reports");
            }, 1000);
        } catch (err) {
            toast.error("Erro", err instanceof Error ? err.message : "Erro ao enviar denuncia");
            setIsSubmitting(false);
        }
    };

    if (isLoadingAuth) {
        return <PageLoading text="Verificando autenticacao..." />;
    }

    if (!isAuthenticated) {
        return (
            <PageTransition>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                        Acesso Negado
                    </h2>
                    <p className="text-zinc-500">Voce precisa estar autenticado para acessar esta area.</p>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <PlayerSidebar />
                </aside>

                <main className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="bg-black/40 p-6 rounded border border-white/5 mb-8 fade-in">
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                            Nova <span className="text-primary">Denuncia</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Preencha o formulario com detalhes precisos. Falsas denuncias sao passiveis de punicao.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-black/40 border border-white/5 rounded p-6 fade-in" style={{ animationDelay: "100ms" }}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                        ID do Acusado (Passaporte) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-all focus:ring-2 focus:ring-primary/20"
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
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ex: Joao Silva"
                                        value={formData.accusedName}
                                        onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Motivo da Denuncia <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-primary outline-none appearance-none cursor-pointer transition-all focus:ring-2 focus:ring-primary/20"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    >
                                        <option value="" className="bg-zinc-900 text-zinc-500">
                                            Selecione um motivo...
                                        </option>
                                        <option value="RDM" className="bg-zinc-900">
                                            RDM (Random Death Match)
                                        </option>
                                        <option value="VDM" className="bg-zinc-900">
                                            VDM (Vehicle Death Match)
                                        </option>
                                        <option value="Combat Logging" className="bg-zinc-900">
                                            Combat Logging
                                        </option>
                                        <option value="Metagaming" className="bg-zinc-900">
                                            Metagaming
                                        </option>
                                        <option value="Bugs" className="bg-zinc-900">
                                            Aproveitamento de Bugs
                                        </option>
                                        <option value="Toxidade" className="bg-zinc-900">
                                            Toxidade / Ofensa
                                        </option>
                                        <option value="Outros" className="bg-zinc-900">
                                            Outros
                                        </option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Descricao Detalhada
                                </label>
                                <textarea
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-primary outline-none min-h-[120px] placeholder-zinc-600 transition-all focus:ring-2 focus:ring-primary/20 resize-y"
                                    placeholder="Descreva exatamente o que aconteceu, incluindo o contexto..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                        Links das Provas <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addEvidenceField}
                                        className="text-xs font-bold text-primary hover:text-white uppercase tracking-wider flex items-center gap-1 transition-all px-2 py-1 rounded hover:bg-white/5 active:scale-95"
                                    >
                                        <Plus className="w-3 h-3" /> Adicionar Link
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.evidence.map((link, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 group fade-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <input
                                                type="url"
                                                required
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://youtube.com/..."
                                                value={link}
                                                onChange={(e) => handleEvidenceChange(index, e.target.value)}
                                            />
                                            {formData.evidence.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeEvidenceField(index)}
                                                    className="px-4 py-2 bg-zinc-900 text-zinc-500 rounded border border-zinc-800 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group-hover:border-red-500/30 active:scale-95"
                                                    title="Remover link"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs text-zinc-500 mt-2 flex items-center">
                                    <ShieldAlert className="w-3 h-3 mr-1" />
                                    Links aceitos: YouTube, Imgur, Discord, Medal.tv.
                                </p>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full gta-btn h-14 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                            ENVIANDO...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Send className="w-5 h-5" />
                                            ENVIAR DENUNCIA
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}
