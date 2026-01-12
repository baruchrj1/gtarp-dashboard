import { Settings, Database, Server, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Configuracoes</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-violet-600/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Super Admin</h2>
          </div>
          <p className="text-zinc-400 mb-4">
            Gerencie as configuracoes de super administrador da plataforma.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Emails de Super Admin</p>
                <p className="text-sm text-zinc-500">
                  Configurado via variavel de ambiente SUPER_ADMIN_EMAILS
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Banco de Dados</h2>
          </div>
          <p className="text-zinc-400 mb-4">
            Informacoes sobre o banco de dados da plataforma.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Provider</p>
                <p className="text-sm text-zinc-500">PostgreSQL (Prisma)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-600/20 p-2 rounded-lg">
              <Server className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Plataforma</h2>
          </div>
          <p className="text-zinc-400 mb-4">
            Configuracoes gerais da plataforma white label.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Dominio Principal</p>
                <p className="text-sm text-zinc-500">suaplataforma.com (exemplo)</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <p className="text-white font-medium">Modo</p>
                <p className="text-sm text-zinc-500">Multi-tenant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
