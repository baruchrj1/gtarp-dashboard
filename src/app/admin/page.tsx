"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Report {
    id: number;
    accusedId: string;
    reason: string;
    status: string;
    createdAt: string;
    reporter: {
        username: string;
        avatar: string | null;
    };
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchReports();
        }
    }, [session]);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/admin/reports");
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "text-yellow-500 bg-yellow-500/10";
            case "APPROVED": return "text-green-500 bg-green-500/10";
            case "REJECTED": return "text-red-500 bg-red-500/10";
            default: return "text-gray-500 bg-gray-500/10";
        }
    };

    // @ts-ignore
    if (!session?.user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
                <p className="text-muted">Esta área é restrita para administradores.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Painel Administrativo
                    </h1>
                    <p className="text-muted mt-1">Gerencie as denúncias do servidor.</p>
                </div>
                <div className="flex gap-4">
                    <div className="card py-2 px-4 flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'PENDING').length}</span>
                        <span className="text-xs text-muted uppercase tracking-wider">Pendentes</span>
                    </div>
                    <div className="card py-2 px-4 flex flex-col items-center">
                        <span className="text-2xl font-bold text-primary">{reports.length}</span>
                        <span className="text-xs text-muted uppercase tracking-wider">Total</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-muted">Carregando denúncias...</div>
            ) : (
                <div className="card glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-surface-highlight/50">
                                    <th className="p-4 text-sm font-medium text-muted uppercase">ID</th>
                                    <th className="p-4 text-sm font-medium text-muted uppercase">Acusado</th>
                                    <th className="p-4 text-sm font-medium text-muted uppercase">Motivo</th>
                                    <th className="p-4 text-sm font-medium text-muted uppercase">Autor</th>
                                    <th className="p-4 text-sm font-medium text-muted uppercase">Data</th>
                                    <th className="p-4 text-sm font-medium text-muted uppercase">Status</th>
                                    <th className="p-4 text-sm font-medium text-muted uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-white/5 transition">
                                        <td className="p-4 text-sm text-muted">#{report.id}</td>
                                        <td className="p-4 font-medium">{report.accusedId}</td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/20">
                                                {report.reason}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {report.reporter.username}
                                        </td>
                                        <td className="p-4 text-sm text-muted">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-sm text-primary hover:text-primary-glow font-medium transition">
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted">
                                            Nenhuma denúncia encontrada no momento.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
