"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert, Send, Trash2, AlertTriangle, FileText, User, Link as LinkIcon } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import useSWR from "swr";
import clsx from "clsx";

// --- Components ---

function ReasonSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const { data } = useSWR("/api/admin/config/reasons");
    const reasons = data?.reasons || [];

    const defaultReasons = [
        { value: "RDM", label: "RDM" },
        { value: "VDM", label: "VDM" },
        { value: "Dark RP", label: "Dark RP" },
        { value: "Power Gaming", label: "Power Gaming" },
        { value: "Combat Logging", label: "Combat Logging" },
        { value: "Metagaming", label: "Metagaming" },
        { value: "Bugs", label: "Bugs" },
        { value: "Insulto", label: "Insulto" },
        { value: "Outros", label: "Outros" }
    ];

    const displayReasons = reasons.length > 0 ? reasons : defaultReasons;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayReasons.map((r: any) => (
                <button
                    key={r.value}
                    type="button"
                    onClick={() => onChange(r.value)}
                    className={clsx(
                        "p-4 rounded-lg border text-left text-sm font-semibold transition-all duration-200 hover:scale-[1.02]",
                        value === r.value
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-muted/50 dark:bg-zinc-950/50 border-border text-muted-foreground hover:bg-muted dark:hover:bg-zinc-900 hover:text-foreground hover:border-border/80"
                    )}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}

function OrganizationSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const { data } = useSWR("/api/admin/config/organizations");
    const orgs = data?.organizations || [];

    const defaultOrgs = [
        { name: "LSPD" }, { name: "EMS" }, { name: "Ballas" }, { name: "Vagos" }, { name: "Mecânica" }
    ];

    const displayOrgs = orgs.length > 0 ? orgs : defaultOrgs;

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-muted/50 dark:bg-zinc-950/50 border border-border rounded-lg p-3 text-foreground placeholder-muted-foreground focus:border-primary outline-none transition-colors appearance-none"
        >
            <option value="" className="bg-background text-muted-foreground">Selecione uma organização (Opcional)</option>
            {displayOrgs.map((o: any) => (
                <option key={o.id || o.name} value={o.name} className="bg-background text-foreground">{o.name}</option>
            ))}
        </select>
    );
}

// --- Main Page ---

export default function NewPlayerReportPage() {
    const { status } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        accusedId: "",
        accusedName: "",
        accusedFamily: "",
        reason: "",
        description: "",
        evidence: [""],
    });

    const isLoadingAuth = status === "loading";
    const isAuthenticated = status === "authenticated";

    // Helpers
    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEvidenceChange = (index: number, value: string) => {
        setFormData(prev => {
            const newEvidence = [...prev.evidence];
            newEvidence[index] = value;
            return { ...prev, evidence: newEvidence };
        });
    };

    const addEvidenceField = () => {
        setFormData(prev => ({ ...prev, evidence: [...prev.evidence, ""] }));
    };

    const removeEvidenceField = (index: number) => {
        setFormData(prev => {
            if (prev.evidence.length > 1) {
                return { ...prev, evidence: prev.evidence.filter((_, i) => i !== index) };
            }
            return prev;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.reason) {
            toast.error("Erro", "Selecione um motivo.");
            return;
        }
        const validEvidence = formData.evidence.filter((link) => link.trim() !== "");
        if (validEvidence.length === 0) {
            toast.error("Erro", "Adicione pelo menos uma prova.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData, evidence: validEvidence };

            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    throw new Error(data.message || "Limite de denúncias atingido.");
                }
                throw new Error(data.message || data.error || "Erro ao enviar denúncia");
            }

            toast.success("Denúncia Enviada!", "Sua denúncia foi registrada com sucesso.");
            setTimeout(() => router.push("/player/reports"), 1500);
        } catch (err: any) {
            toast.error("Erro", err.message);
            setIsSubmitting(false);
        }
    };

    if (isLoadingAuth) return <PageLoading text="Carregando..." />;
    if (!isAuthenticated) return null; // Layout redirects

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="gta-card p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display uppercase tracking-wider flex items-center gap-3 text-foreground">
                        <span className="text-primary">NOVA</span> DENÚNCIA
                    </h1>
                    <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">
                        Preencha o formulário abaixo com as informações da infração.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Coluna Esquerda: Dados Principais */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Card: Motivo */}
                    <div className="gta-card p-6">
                        <h2 className="text-lg font-bold mb-5 flex items-center gap-3 text-foreground uppercase tracking-widest">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-primary" />
                            </div>
                            Motivo da Denúncia <span className="text-red-500 text-sm ml-1">*</span>
                        </h2>
                        <ReasonSelector
                            value={formData.reason}
                            onChange={(val) => updateField('reason', val)}
                        />
                    </div>

                    {/* Card: Descrição e Provas */}
                    <div className="gta-card p-6 space-y-6">
                        <div>
                            <h2 className="text-lg font-bold mb-5 flex items-center gap-3 text-foreground uppercase tracking-widest">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                Detalhes do Ocorrido
                            </h2>
                            <textarea
                                className="w-full h-40 bg-muted/50 dark:bg-zinc-950/50 border border-border rounded-lg p-4 text-foreground focus:border-primary outline-none resize-none placeholder-muted-foreground font-medium transition-all"
                                placeholder="Descreva exatamente o que aconteceu..."
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                    <LinkIcon className="w-4 h-4" /> Provas (Links) <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={addEvidenceField}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 font-bold transition-colors uppercase tracking-wider"
                                >
                                    + Adicionar Link
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.evidence.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 group">
                                        <input
                                            type="url"
                                            className="w-full bg-muted/50 dark:bg-zinc-950/50 border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none transition-all placeholder-muted-foreground"
                                            placeholder="https://youtube.com/..."
                                            value={link}
                                            onChange={(e) => handleEvidenceChange(idx, e.target.value)}
                                        />
                                        {formData.evidence.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeEvidenceField(idx)}
                                                className="px-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all opacity-50 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Coluna Direita: Acusado (Sticky) */}
                <div className="xl:col-span-1">
                    <div className="gta-card p-6 sticky top-24">
                        <h2 className="text-lg font-bold mb-5 flex items-center gap-3 text-foreground uppercase tracking-widest">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            Acusado
                        </h2>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">ID (Passaporte - Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-muted/50 dark:bg-zinc-950/50 border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none transition-colors placeholder-muted-foreground font-mono"
                                    placeholder="Ex: 12345"
                                    value={formData.accusedId}
                                    onChange={(e) => updateField('accusedId', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Nome (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-muted/50 dark:bg-zinc-950/50 border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none transition-colors placeholder-muted-foreground"
                                    placeholder="Ex: João Silva"
                                    value={formData.accusedName}
                                    onChange={(e) => updateField('accusedName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Organização</label>
                                <OrganizationSelector
                                    value={formData.accusedFamily}
                                    onChange={(val) => updateField('accusedFamily', val)}
                                />
                            </div>

                            <div className="pt-6 border-t border-border mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 hover:scale-[1.02] active:scale-95 text-sm tracking-wide uppercase"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" /> Confirmar Envio
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
                                    Ao enviar, você confirma sob pena de punição que todas as informações são verdadeiras.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
