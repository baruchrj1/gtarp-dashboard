"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import PlayerSidebar from "@/components/player/PlayerSidebar";
import { ShieldAlert, Send, Plus, Trash2 } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { PageTransition } from "@/components/ui/PageTransition";
import useSWR from "swr"; // Added import

// Component for dynamic fetching
function ReasonSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const { data, isLoading } = useSWR("/api/admin/config/reasons");
    const reasons = data?.reasons || [];

    // Fallback options
    const defaultReasons = [
        { value: "RDM", label: "RDM (Random Death Match)" },
        { value: "VDM", label: "VDM (Vehicle Death Match)" },
        { value: "Dark RP", label: "Dark RP" },
        { value: "Power Gaming", label: "Power Gaming" },
        { value: "Combat Logging", label: "Combat Logging" },
        { value: "Metagaming", label: "Metagaming" },
        { value: "Bugs", label: "Aproveitamento de Bugs" },
        { value: "Insulto", label: "Ofensas/Xingamentos" },
        { value: "Outros", label: "Outros" }
    ];

    const displayReasons = reasons.length > 0 ? reasons : defaultReasons;

    return (
        <div className="relative">
            <select
                id="reason"
                name="reason"
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg pl-12 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
                <option value="" className="bg-card text-muted-foreground">
                    {isLoading ? "Carregando motivos..." : "Selecione um motivo..."}
                </option>
                {displayReasons.map((r: any) => (
                    <option key={r.value} value={r.value} className="bg-card">
                        {r.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}


// Component for dynamic fetching
function OrganizationSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const { data, isLoading } = useSWR("/api/admin/config/organizations");
    const orgs = data?.organizations || [];

    // Fallback options
    const defaultOrgs = [
        { name: "LSPD" },
        { name: "EMS" },
        { name: "Ballas" },
        { name: "Vagos" },
        { name: "Mecânica" }
    ];

    const displayOrgs = orgs.length > 0 ? orgs : defaultOrgs;

    return (
        <div className="relative">
            <select
                id="accusedFamily"
                name="accusedFamily"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg pl-12 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
                <option value="" className="bg-card text-muted-foreground">
                    {isLoading ? "Carregando organizações..." : "Selecione uma organização (Opcional)..."}
                </option>
                {displayOrgs.map((o: any) => (
                    <option key={o.id || o.name} value={o.name} className="bg-card">
                        {o.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
        </div>
    );
}

export default function NewPlayerReportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();

    const [formData, setFormData] = useState({
        accusedId: "",
        accusedName: "",
        accusedFamily: "",
        reason: "",
        description: "",
        evidence: [""],
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
                throw new Error(data.message || data.error || "Erro ao enviar denuncia");
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
                    <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-foreground">
                        Acesso Negado
                    </h2>
                    <p className="text-muted-foreground">Voce precisa estar autenticado para acessar esta area.</p>
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
                    <div className="bg-card p-6 rounded border border-border mb-8 fade-in">
                        <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                            Nova <span className="text-primary">Denuncia</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                            Preencha o formulario com detalhes precisos. Falsas denuncias sao passiveis de punicao.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="gta-card p-6 fade-in" style={{ animationDelay: "100ms" }}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                        ID do Acusado (Passaporte)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ex: 12345 (Opcional)"
                                        value={formData.accusedId}
                                        onChange={(e) => setFormData({ ...formData, accusedId: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                        Nome do Acusado (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ex: Joao Silva"
                                        value={formData.accusedName}
                                        onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                        Organização / Família (Opcional)
                                    </label>
                                    <OrganizationSelector
                                        value={formData.accusedFamily}
                                        onChange={(val) => setFormData({ ...formData, accusedFamily: val })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Motivo da Denuncia <span className="text-red-500">*</span>
                                </label>
                                <ReasonSelector
                                    value={formData.reason}
                                    onChange={(val) => setFormData({ ...formData, reason: val })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Descricao Detalhada
                                </label>
                                <textarea
                                    className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground focus:border-primary outline-none min-h-[120px] placeholder-muted-foreground transition-all focus:ring-2 focus:ring-primary/20 resize-y"
                                    placeholder="Descreva exatamente o que aconteceu, incluindo o contexto..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
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
                                                className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://youtube.com/..."
                                                value={link}
                                                onChange={(e) => handleEvidenceChange(index, e.target.value)}
                                            />
                                            {formData.evidence.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeEvidenceField(index)}
                                                    className="px-4 py-2 bg-secondary text-muted-foreground rounded border border-border hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group-hover:border-red-500/30 active:scale-95"
                                                    title="Remover link"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs text-muted-foreground mt-2 flex items-center">
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
