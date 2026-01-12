
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, UploadCloud, Info } from "lucide-react";

export default function NewReportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            accusedId: formData.get("accusedId"),
            accusedName: formData.get("accusedName"), // Optional
            accusedFamily: formData.get("accusedFamily"), // Optional
            reason: formData.get("reason"),
            description: formData.get("description"),
            evidence: formData.get("evidence"),
        };

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Erro ao criar denúncia");
            }

            router.push("/reports");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                href="/reports"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Denúncias
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-white mb-2">Nova Denúncia</h1>
                <p className="text-zinc-400">Preencha os dados abaixo com atenção. Falsas denúncias podem resultar em punição.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Acusado */}
                <section className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">1. Identificação do Acusado</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">ID do Jogador *</label>
                            <input
                                type="text"
                                name="accusedId"
                                required
                                placeholder="Ex: 1234"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Nome (Opcional)</label>
                            <input
                                type="text"
                                name="accusedName"
                                placeholder="Nome do personagem"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-700"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Organização/Família (Opcional)</label>
                            <input
                                type="text"
                                name="accusedFamily"
                                placeholder="Ex: The Lost MC, LSPD..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-700"
                            />
                        </div>
                    </div>
                </section>

                {/* Motivo e Provas */}
                <section className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">2. Detalhes e Provas</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Motivo da Denúncia *</label>
                            <select
                                name="reason"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled selected>Selecione um motivo...</option>
                                <option value="RDM">RDM (Morte Aleatória)</option>
                                <option value="VDM">VDM (Morte com Veículo)</option>
                                <option value="Combat Logging">Combat Logging (Sair no RP)</option>
                                <option value="Power Gaming">Power Gaming</option>
                                <option value="Metagaming">Metagaming</option>
                                <option value="Toxidade">Comportamento Tóxico</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Link da Prova (Vídeo/Imagem) *</label>
                            <div className="relative">
                                <UploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="url"
                                    name="evidence"
                                    required
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-700 font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Aceitamos YouTube, Streamable, Imgur ou Discord Links.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição Detalhada</label>
                            <textarea
                                name="description"
                                rows={4}
                                placeholder="Explique exatamente o que aconteceu..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-700 resize-none"
                            ></textarea>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Denúncia"}
                    </button>
                </div>
            </form>
        </div>
    );
}
