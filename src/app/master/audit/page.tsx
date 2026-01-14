
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/audit/service";
import { Activity, User, Settings, LogIn, LogOut, Plus, Edit, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

async function getAuditLogs() {
    const logs = await AuditService.getRecentLogs(100);
    return logs.map((log: any) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
    }));
}

export default async function AuditPage() {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.isSuperAdmin) {
        redirect("/login");
    }

    const logs = await getAuditLogs();

    const getActionIcon = (action: string) => {
        switch (action) {
            case "CREATE": return <Plus className="w-4 h-4 text-emerald-400" />;
            case "UPDATE": return <Edit className="w-4 h-4 text-blue-400" />;
            case "DELETE": return <Trash2 className="w-4 h-4 text-red-400" />;
            case "LOGIN": return <LogIn className="w-4 h-4 text-violet-400" />;
            case "LOGOUT": return <LogOut className="w-4 h-4 text-orange-400" />;
            default: return <Activity className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getEntityIcon = (entity: string) => {
        switch (entity) {
            case "TENANT": return <User className="w-4 h-4" />;
            case "SETTINGS": return <Settings className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Logs de Auditoria</h1>
                <p className="text-sm text-zinc-500 mt-1">Histórico de todas as ações realizadas no painel.</p>
            </div>

            {/* Logs Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">Nenhuma atividade registrada ainda.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Ação</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Entidade</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Admin</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Detalhes</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getActionIcon(log.action)}
                                            <span className="text-sm font-medium text-white">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            {getEntityIcon(log.entity)}
                                            <span className="text-sm">{log.entity}</span>
                                            {log.entityId && (
                                                <code className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-zinc-500">
                                                    {log.entityId.slice(0, 8)}...
                                                </code>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-300">{log.adminEmail}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.details ? (
                                            <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-400 max-w-xs truncate block">
                                                {JSON.stringify(log.details).slice(0, 50)}...
                                            </code>
                                        ) : (
                                            <span className="text-zinc-600 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-500">{formatDate(log.createdAt)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
