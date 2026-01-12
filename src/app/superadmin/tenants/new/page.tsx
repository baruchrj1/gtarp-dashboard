"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
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
      primaryColor: formData.get("primaryColor") || "#6366f1",
      secondaryColor: formData.get("secondaryColor") || "#4f46e5",
    };

    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao criar tenant");
      }

      router.push("/superadmin/tenants");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/superadmin/tenants"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Novo Tenant</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Ex: Cidade Alta RP"
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
                  placeholder="cidadealta"
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
                <span className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-r-lg text-zinc-400">
                  .suaplataforma.com
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Apenas letras minusculas, numeros e hifens
              </p>
            </div>
          </div>
        </div>

        {/* Discord OAuth */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Discord OAuth
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            O cliente deve criar um app no{" "}
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              className="text-violet-500 hover:underline"
            >
              Discord Developer Portal
            </a>{" "}
            e fornecer essas informacoes.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Guild ID (ID do Servidor) *
              </label>
              <input
                type="text"
                name="discordGuildId"
                required
                placeholder="123456789012345678"
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
                  placeholder="Client ID do Discord App"
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
                  placeholder="Client Secret do Discord App"
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
                ID do Cargo Admin *
              </label>
              <input
                type="text"
                name="discordRoleAdmin"
                required
                placeholder="ID do cargo de administrador"
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
                  placeholder="Opcional"
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
                  placeholder="Opcional"
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
                  defaultValue="#6366f1"
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue="#6366f1"
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
                  defaultValue="#4f46e5"
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue="#4f46e5"
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
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar Tenant
          </button>
        </div>
      </form>
    </div>
  );
}
