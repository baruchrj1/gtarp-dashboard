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
        <div className="max-w-2xl mx-auto">
            <div className="card glass">
                <h1 className="text-2xl font-bold mb-6 text-primary">Nova Denúncia</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            ID do Acusado (Passaporte)
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                            placeholder="Ex: 12345"
                            value={formData.accusedId}
                            onChange={(e) => setFormData({ ...formData, accusedId: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Motivo da Denúncia
                        </label>
                        <select
                            required
                            className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary outline-none"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        >
                            <option value="">Selecione um motivo...</option>
                            <option value="RDM">RDM (Random Death Match)</option>
                            <option value="VDM">VDM (Vehicle Death Match)</option>
                            <option value="Combat Logging">Combat Logging</option>
                            <option value="Metagaming">Metagaming</option>
                            <option value="Bugs">Aprovento de Bugs</option>
                            <option value="Toxidade">Toxidade / Ofensa</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Descrição Detalhada
                        </label>
                        <textarea
                            className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary outline-none min-h-[100px]"
                            placeholder="Descreva exatamente o que aconteceu..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Link das Provas (Vídeo/Print)
                        </label>
                        <input
                            type="url"
                            required
                            className="w-full bg-background border border-border rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="https://youtube.com/..."
                            value={formData.evidence}
                            onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                        />
                        <p className="text-xs text-muted mt-2">
                            ⚠️ Denúncias sem provas serão automaticamente rejeitadas.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
