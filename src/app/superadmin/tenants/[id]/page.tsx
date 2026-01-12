"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import useSWR from "swr";

export default function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const { data: tenant, isLoading } = useSWR(id ? `/api/superadmin/tenants/${id}` : null, (url) =>
        fetch(url).then((res) => {
            if (!res.ok) throw new Error("Erro ao carregar tenant");
            return res.json();
        })
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            slug: formData.get("slug"),
            discordGuildId: formData.get("discordGuildId"),
            discordClientId: formData.get("discordClientId"),
            discordClientSecret: formData.get("discordClientSecret"),
            discordRoleAdmin: formData.get("discordRoleAdmin"),
            discordRoleEvaluator: formData.get("discordRoleEvaluator") || undefined,
            discordRolePlayer: formData.get("discordRolePlayer") || undefined,
            primaryColor: formData.get("primaryColor"),
            secondaryColor: formData.get("secondaryColor"),
            isActive: formData.get("isActive") === "on",
            customDomain: formData.get("customDomain"),
        };

        try {
            const res = await fetch(`/api/superadmin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Erro ao atualizar tenant");
            }

            router.refresh();
            alert("Tenant atualizado com sucesso!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm("TEM CERTEZA? Essa ação não pode ser desfeita e apagará todos os dados vinculados!")) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/superadmin/tenants/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Erro ao deletar tenant");

            router.push("/superadmin/tenants");
            router.refresh();
        } catch (err: any) {
            alert(err.message || "Erro ao deletar");
            setDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-white font-bold">Tenant não encontrado</h2>
                <Link href="/superadmin/tenants" className="text-violet-500 hover:underline mt-2 inline-block">
                    Voltar para lista
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/superadmin/tenants"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-900/20 text-red-500 hover:bg-red-900/30 rounded-lg text-sm transition-colors border border-red-900/50"
                >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? "Deletando..." : "Excluir Tenant"}
                </button>
            </div>

            <h1 className="text-3xl font-bold text-white mb-8">Editar Tenant: {tenant.name}</h1>

            {error && (
                <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Status do Tenant</h2>
                            <p className="text-sm text-zinc-500">Desativar impede o acesso ao dashboard</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isActive" className="sr-only peer" defaultChecked={tenant.isActive} />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                    </div>
                </div>

                {/* Informacoes Basicas */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Informacoes Basicas
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Nome do Servidor *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                defaultValue={tenant.name}
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Slug (subdominio) *
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    name="slug"
                                    required
                                    pattern="[a-z0-9-]+"
                                    defaultValue={tenant.slug}
                                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                />
                                <span className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-r-lg text-zinc-400">
                                    .suaplataforma.com
                                </span>
                            </div>
                            <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Alterar o slug mudará a URL de acesso!
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Domínio Personalizado (Vercel/Outros)
                            </label>
                            <input
                                type="text"
                                name="customDomain"
                                defaultValue={tenant.customDomain || ""}
                                placeholder="Ex: painel-client-1.vercel.app"
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                                Use este campo para links externos como Vercel. Não inclua "https://".
                            </p>
                        </div>
                    </div>
                </div>

                {/* Discord OAuth */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Discord OAuth
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Guild ID (ID do Servidor) *
                            </label>
                            <input
                                type="text"
                                name="discordGuildId"
                                required
                                defaultValue={tenant.discordGuildId}
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Client ID *
                                </label>
                                <input
                                    type="text"
                                    name="discordClientId"
                                    required
                                    defaultValue={tenant.discordClientId}
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Client Secret *
                                </label>
                                <input
                                    type="password"
                                    name="discordClientSecret"
                                    required
                                    defaultValue={tenant.discordClientSecret}
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cargos do Discord */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Cargos do Discord
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                ID do Cargo Admin * (Separe múltiplos por vírgula)
                            </label>
                            <input
                                type="text"
                                name="discordRoleAdmin"
                                required
                                defaultValue={tenant.discordRoleAdmin}
                                placeholder="123456789, 987654321"
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    ID do Cargo Avaliador
                                </label>
                                <input
                                    type="text"
                                    name="discordRoleEvaluator"
                                    defaultValue={tenant.discordRoleEvaluator || ""}
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    ID do Cargo Player
                                </label>
                                <input
                                    type="text"
                                    name="discordRolePlayer"
                                    defaultValue={tenant.discordRolePlayer || ""}
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Branding</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Cor Primaria
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="primaryColor"
                                    defaultValue={tenant.primaryColor}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    defaultValue={tenant.primaryColor}
                                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                                    readOnly
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Cor Secundaria
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="secondaryColor"
                                    defaultValue={tenant.secondaryColor}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    defaultValue={tenant.secondaryColor}
                                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/superadmin/tenants"
                        className="px-6 py-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}
