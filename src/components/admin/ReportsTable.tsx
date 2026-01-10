"use client";

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

interface ReportsTableProps {
    reports: Report[];
}

export default function ReportsTable({ reports }: ReportsTableProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "APPROVED":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "REJECTED":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            default:
                return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    };

    return (
        <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Denúncias Recentes</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Buscar ID ou Jogador..."
                        className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-zinc-200 placeholder-zinc-500"
                    />
                    <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/50 border-b border-zinc-800">
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">ID</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Acusado</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Detalhes</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Autor</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {reports.map((report) => (
                            <tr key={report.id} className="group hover:bg-zinc-800/30 transition-colors duration-200">
                                <td className="p-4 text-sm font-medium text-zinc-300">#{report.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                                            {report.accusedId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">ID {report.accusedId}</div>
                                            <div className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                        {report.reason}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {report.reporter.avatar ? (
                                            <img src={report.reporter.avatar} alt="" className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-zinc-800" />
                                        )}
                                        <span className="text-sm text-zinc-400">{report.reporter.username}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(report.status)}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${report.status === 'PENDING' ? 'bg-yellow-500' : report.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md transition-all">
                                        Analisar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <svg className="w-12 h-12 mb-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-medium text-zinc-400">Nenhuma denúncia encontrada</p>
                                        <p className="text-sm mt-1">Todas as denúncias foram processadas.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-400">
                <span>Mostrando {reports.length} resultados</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50" disabled>Anterior</button>
                    <button className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50" disabled>Próxima</button>
                </div>
            </div>
        </div>
    );
}
