"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewReportPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        accusedId: "",
        reason: "",
        description: "",
        evidence: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
                <p className="text-muted mb-8">Você precisa estar logado para fazer uma denúncia.</p>
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

            router.push("/reports/success");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="glass-card p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Nova Denúncia</h1>
                    <p className="text-zinc-400">Preencha o formulário abaixo com detalhes precisos. Falsas denúncias são passíveis de punição.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-300">
                            ID do Acusado (Passaporte) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition placeholder:text-zinc-600"
                            placeholder="Ex: 12345"
                            value={formData.accusedId}
                            onChange={(e) => setFormData({ ...formData, accusedId: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-300">
                            Motivo da Denúncia <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                required
                                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 text-white focus:border-primary outline-none appearance-none"
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
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-300">
                            Descrição Detalhada
                        </label>
                        <textarea
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 text-white focus:border-primary outline-none min-h-[120px] placeholder:text-zinc-600"
                            placeholder="Descreva exatamente o que aconteceu, incluindo o contexto..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-300">
                            Link das Provas (Vídeo/Print) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            required
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 text-white focus:border-primary outline-none placeholder:text-zinc-600"
                            placeholder="https://youtube.com/..."
                            value={formData.evidence}
                            onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                        />
                        <p className="text-xs text-zinc-500 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Denúncias sem provas verificáveis serão automaticamente rejeitadas.
                        </p>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn bg-primary hover:bg-primary/90 text-white font-medium py-4 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] hover:shadow-primary/40 active:scale-[0.99]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando Denúncia...
                                </span>
                            ) : "Enviar Denúncia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
