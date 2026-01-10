"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import ReportsTable from "@/components/admin/ReportsTable";
import { ShieldAlert, CheckCircle, Clock } from "lucide-react";

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

    const stats = [
        {
            title: "Total de Ocorrências",
            value: reports.length,
            icon: <ShieldAlert className="w-6 h-6 text-primary" />,
            trend: "+12% esta semana",
            description: "Total acumulado"
        },
        {
            title: "Em Análise",
            value: reports.filter(r => r.status === 'PENDING').length,
            icon: <Clock className="w-6 h-6 text-yellow-500" />,
            description: "Aguardando veredito"
        },
        {
            title: "Casos Encerrados",
            value: reports.filter(r => r.status !== 'PENDING').length,
            icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
            trend: "+5 hoje",
            description: "Aprovadas ou Arquivadas"
        },
    ];

    if (!session?.user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide">Acesso Negado</h2>
                <p className="text-zinc-500 max-w-md text-center">Protocolo de segurança: Nível 4 exigido. <br /> Contate a administração superior.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded border border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                            Painel <span className="text-primary">Administrativo</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Operador: <span className="text-white">{session.user.name}</span> | ID: 329-Alpha
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="gta-btn bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                            Exportar Database
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="grid place-items-center h-64 border border-zinc-800 rounded bg-black/20">
                            <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <ReportsTable reports={reports} />
                    )}
                </div>
            </main>
        </div>
    );
}
