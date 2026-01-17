"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Trash2, FileText, Search, XCircle, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import clsx from "clsx";

interface Template {
    id: string;
    title: string;
    content: string;
    category: "APPROVAL" | "REJECTION" | "INVESTIGATION" | "OTHER";
    createdAt: string;
}

const CATEGORY_LABELS = {
    APPROVAL: { label: "Aprovação", color: "bg-green-500/20 text-green-500 border-green-500/30" },
    REJECTION: { label: "Rejeição", color: "bg-red-500/20 text-red-500 border-red-500/30" },
    INVESTIGATION: { label: "Investigação", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    OTHER: { label: "Outros", color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
};

export default function TemplatesTab() {
    const { data, error, mutate } = useSWR<{ templates: Template[] }>("/api/admin/settings/templates", (url: string) => fetch(url).then(res => res.json()));
    const toast = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState("");

    const [newTemplate, setNewTemplate] = useState({
        title: "",
        content: "",
        category: "APPROVAL" as Template["category"],
    });

    const isLoading = !data && !error;
    const templates = data?.templates || [];

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(filter.toLowerCase()) ||
        t.content.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/settings/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTemplate),
            });

            if (!res.ok) throw new Error("Erro ao criar template");

            toast.success("Template criado!", "O modelo de resposta foi salvo com sucesso.");
            setNewTemplate({ title: "", content: "", category: "APPROVAL" });
            setIsCreating(false);
            mutate(); // Refresh list
        } catch (err) {
            toast.error("Erro", "Não foi possível salvar o template.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este template?")) return;

        try {
            const res = await fetch(`/api/admin/settings/templates?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Erro ao deletar");

            toast.success("Sucesso", "Template removido.");
            mutate();
        } catch (err) {
            toast.error("Erro", "Não foi possível remover o template.");
        }
    };

    if (isLoading) return <div className="py-12"><PageLoading /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar templates..."
                        className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wide text-xs"
                >
                    {isCreating ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isCreating ? "Cancelar" : "Novo Template"}
                </button>
            </div>

            {isCreating && (
                <div className="bg-card border border-border rounded-lg p-6 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Criar Novo Template
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none"
                                    placeholder="Ex: Aprovado - RDM Padrão"
                                    value={newTemplate.title}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoria</label>
                                <select
                                    className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none"
                                    value={newTemplate.category}
                                    onChange={(e: any) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                >
                                    <option value="APPROVAL">Aprovação</option>
                                    <option value="REJECTION">Rejeição</option>
                                    <option value="INVESTIGATION">Investigação</option>
                                    <option value="OTHER">Outros</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conteúdo da Mensagem</label>
                            <textarea
                                required
                                className="w-full h-32 bg-secondary border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none resize-none"
                                placeholder="Ex: Sua denúncia foi aprovada e o jogador punido conforme as regras."
                                value={newTemplate.content}
                                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 uppercase tracking-wide text-xs"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Salvar Template
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <div key={template.id} className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between group hover:border-primary/50 transition-all">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <span className={clsx("px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide", CATEGORY_LABELS[template.category].color)}>
                                    {CATEGORY_LABELS[template.category].label}
                                </span>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground mb-2 line-clamp-1 uppercase tracking-wide">{template.title}</h3>
                                <p className="text-muted-foreground text-xs line-clamp-3 bg-secondary/50 p-3 rounded border border-border/50 font-mono">
                                    {template.content}
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 mt-4 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <FileText className="w-3 h-3" />
                            Pronto para uso
                        </div>
                    </div>
                ))}

                {filteredTemplates.length === 0 && !isCreating && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-secondary/20 rounded-lg border border-dashed border-border text-center">
                        <div className="bg-secondary p-4 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg">Nenhum template encontrado</h3>
                        <p className="text-muted-foreground mb-4">Crie modelos para padronizar suas respostas.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-primary font-bold hover:underline uppercase tracking-wide text-xs"
                        >
                            Criar meu primeiro template
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
