
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Globe, Palette, Shield, Disc, Check, Info } from "lucide-react";
import Link from "next/link";

import { TenantFeatures } from "@/lib/tenants/schema";

// UI Helper Type (extends the base Input type with ID which is generated on server)
type TenantFormData = {
    id?: string;
    name: string;
    slug: string;
    subdomain?: string; // Vercel subdomain
    // Branding
    primaryColor: string;
    secondaryColor: string;
    logo?: string | null;
    favicon?: string | null;
    customDomain?: string | null;
    // Features
    features: TenantFeatures;
    // Discord
    discordGuildId: string;
    discordClientId: string;
    discordClientSecret: string;
    discordRoleAdmin: string;
    discordRoleEvaluator?: string | null;
    discordRolePlayer?: string | null;
    isActive: boolean;
};

interface TenantFormProps {
    initialData?: TenantFormData;
    isEditing?: boolean;
}

const DEFAULT_DATA: TenantFormData = {
    name: "",
    slug: "",
    primaryColor: "#7c3aed", // Modern Violet
    secondaryColor: "#4f46e5", // Indigo
    features: {
        archive: true,
        punishments: true,
        discordNotify: true
    },
    discordGuildId: "",
    discordClientId: "",
    discordClientSecret: "",
    discordRoleAdmin: "",
    isActive: true
};

export function TenantForm({ initialData, isEditing = false }: TenantFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<TenantFormData>(initialData || DEFAULT_DATA);

    const handleChange = (field: keyof TenantFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureToggle = (feature: keyof TenantFeatures) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feature]: !prev.features[feature]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = isEditing ? `/api/tenants/${formData.id}` : "/api/tenants";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erro ao salvar");
            }

            // Updated redirect to master
            router.push("/master/tenants");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/master/tenants" className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {isEditing ? `Editar: ${formData.name}` : "Novo Cliente SaaS"}
                        </h1>
                        <p className="text-sm text-zinc-500">Configure os detalhes e integrações do painel.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/master/tenants"
                        className="px-6 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg disabled:opacity-50 transition-all font-medium text-sm shadow-lg shadow-violet-500/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditing ? "Salvar Alterações" : "Criar Painel"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-red-500 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (Main Config) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Basic Info */}
                    <div className="glass-card rounded-xl p-8 space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
                                <p className="text-sm text-zinc-500">Defina a identidade principal do projeto.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Input
                                label="Nome do Projeto"
                                value={formData.name}
                                onChange={(v: string) => handleChange("name", v)}
                                placeholder="Ex: Servidor Roleplay"
                                required
                                className="w-full"
                            />

                            <div className="space-y-2 w-full">
                                <label className="text-sm font-medium text-zinc-400">Slug (identificador interno)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => handleChange("slug", e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-800 transition-colors"
                                    placeholder="hell-de-janeiro"
                                    pattern="[a-z0-9-]+"
                                    required
                                />
                            </div>

                            <div className="space-y-2 w-full">
                                <label className="text-sm font-medium text-zinc-400">Subdomínio Vercel</label>
                                <div className="flex group w-full">
                                    <input
                                        type="text"
                                        value={formData.subdomain || ""}
                                        onChange={e => handleChange("subdomain", e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 border-r-0 rounded-l-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-800 transition-colors min-w-0"
                                        placeholder="painel-client-1"
                                        pattern="[a-z0-9-]+"
                                        required
                                    />
                                    <span className="bg-zinc-900 border border-zinc-800 border-l-0 rounded-r-lg px-4 flex items-center text-sm text-zinc-500 border-l border-white/5 shrink-0">
                                        .vercel.app
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-600">Será mapeado automaticamente (Ex: painel-client-1.vercel.app)</p>
                            </div>

                            <Input
                                label="Domínio Personalizado"
                                value={formData.customDomain || ""}
                                onChange={(v: string) => handleChange("customDomain", v)}
                                placeholder="painel.seuservidor.com"
                                className="w-full"
                                optional
                            />
                        </div>
                    </div>

                    {/* Discord Integration */}
                    <div className="glass-card rounded-xl p-8 space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <Disc className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Integração Discord</h3>
                                <p className="text-sm text-zinc-500">Conecte o bot e configure os cargos de acesso.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex gap-3 text-sm text-indigo-200">
                                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                                <p>O cliente deve criar uma aplicação no Discord Developer Portal e convidar o bot para o servidor antes de configurar.</p>
                            </div>

                            <Input label="Guild ID (Servidor)" value={formData.discordGuildId} onChange={(v: string) => handleChange("discordGuildId", v)} required mono />
                            <Input label="Role Admin ID" value={formData.discordRoleAdmin} onChange={(v: string) => handleChange("discordRoleAdmin", v)} required mono />

                            <Input label="Client ID (App)" value={formData.discordClientId} onChange={(v: string) => handleChange("discordClientId", v)} required mono />
                            <Input label="Client Secret" value={formData.discordClientSecret} onChange={(v: string) => handleChange("discordClientSecret", v)} required type="password" mono />
                        </div>

                        <div className="border-t border-white/5 pt-6">
                            <h4 className="text-sm font-medium text-white mb-4">Cargos Adicionais</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input label="Role Avaliador" value={formData.discordRoleEvaluator || ""} onChange={(v: string) => handleChange("discordRoleEvaluator", v)} mono optional />
                                <Input label="Role Player" value={formData.discordRolePlayer || ""} onChange={(v: string) => handleChange("discordRolePlayer", v)} mono optional />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Side Settings) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Status Card */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Status do Painel</h3>
                            <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                        </div>
                        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                            Desativar o painel impede imediatamente o acesso de todos os usuários deste cliente.
                        </p>

                        <label className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer group hover:border-zinc-700 transition-colors">
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Ativar Acesso</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => handleChange("isActive", e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-5' : ''}`} />
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Features */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-semibold text-white">Módulos Ativos</h3>
                        </div>
                        <div className="space-y-3">
                            <FeatureToggle
                                label="Punições"
                                active={formData.features.punishments}
                                onToggle={() => handleFeatureToggle("punishments")}
                            />
                            <FeatureToggle
                                label="Allowlist"
                                active={formData.features.archive}
                                onToggle={() => handleFeatureToggle("archive")}
                            />
                            <FeatureToggle
                                label="Notificações"
                                active={formData.features.discordNotify}
                                onToggle={() => handleFeatureToggle("discordNotify")}
                            />
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="glass-card rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                            <Palette className="w-5 h-5 text-pink-400" />
                            <h3 className="font-semibold text-white">Identidade Visual</h3>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Paleta de Cores</label>
                            <div className="grid grid-cols-2 gap-3">
                                <ColorPicker label="Primária" value={formData.primaryColor} onChange={(v: string) => handleChange("primaryColor", v)} />
                                <ColorPicker label="Secundária" value={formData.secondaryColor} onChange={(v: string) => handleChange("secondaryColor", v)} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Input label="URL do Logo" value={formData.logo || ""} onChange={(v: string) => handleChange("logo", v)} placeholder="https://..." optional />
                            <Input label="URL do Favicon" value={formData.favicon || ""} onChange={(v: string) => handleChange("favicon", v)} placeholder="https://..." optional />
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}

// --- Subcomponents ---

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    mono?: boolean;
    className?: string;
    optional?: boolean;
}

function Input({ label, value, onChange, placeholder, type = "text", required, mono, className, optional }: InputProps) {
    return (
        <div className={`space-y-2 ${className || ''}`}>
            <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-300">
                    {label} {required && <span className="text-violet-400">*</span>}
                </label>
                {optional && <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-wider">Opcional</span>}
            </div>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all ${mono ? 'font-mono text-sm tracking-tight' : ''}`}
            />
        </div>
    );
}

function ColorPicker({ label, value, onChange }: any) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-3 hover:border-zinc-700 transition-colors">
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="h-8 w-8 rounded bg-transparent cursor-pointer border-none p-0"
            />
            <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">{label}</span>
                <span className="text-xs font-mono text-zinc-300">{value}</span>
            </div>
        </div>
    );
}

function FeatureToggle({ label, active, onToggle }: any) {
    return (
        <div
            onClick={onToggle}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${active ? "bg-violet-500/5 border-violet-500/20" : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"}`}
        >
            <span className={`text-sm font-medium ${active ? "text-violet-200" : "text-zinc-400"}`}>{label}</span>
            {active ? (
                <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
            )}
        </div>
    );
}
