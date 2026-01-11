"use client";

import Image from "next/image";
import { CheckCircle, XCircle, Clock, Activity } from "lucide-react";

interface EvaluatorStats {
    totalHandled: number;
    approved: number;
    rejected: number;
    investigating: number;
    lastActivity: string | null;
}

interface Evaluator {
    id: string;
    username: string;
    avatar: string | null;
    joinedAt: string;
    stats: EvaluatorStats;
}

interface EvaluatorsTableProps {
    evaluators: Evaluator[];
}

export default function EvaluatorsTable({ evaluators }: EvaluatorsTableProps) {
    const isActive = (lastActivity: string | null) => {
        if (!lastActivity) return false;
        const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActivity <= 7;
    };

    const formatDate = (date: string | null) => {
        if (!date) return "Nunca";
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (evaluators.length === 0) {
        return (
            <div className="bg-card dark:bg-black/40 border border-border dark:border-white/5 rounded p-12 text-center">
                <Activity className="w-12 h-12 text-muted-foreground dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-muted-foreground dark:text-zinc-400 text-sm">Nenhum avaliador encontrado no sistema.</p>
            </div>
        );
    }

    return (
        <div className="gta-card overflow-hidden bg-card/50 backdrop-blur-sm border-border">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Avaliador
                            </th>
                            <th className="text-center p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-center p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Total Processado
                            </th>
                            <th className="text-center p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Aprovadas
                            </th>
                            <th className="text-center p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Rejeitadas
                            </th>
                            <th className="text-center p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Investigando
                            </th>
                            <th className="text-left p-4 text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
                                Última Atividade
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {evaluators.map((evaluator, index) => {
                            const active = isActive(evaluator.stats.lastActivity);
                            return (
                                <tr
                                    key={evaluator.id}
                                    className={`border-b border-border/50 hover:bg-muted/50 transition-colors`}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                {evaluator.avatar ? (
                                                    <Image
                                                        src={evaluator.avatar}
                                                        alt={evaluator.username}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border-2 border-primary/20"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center">
                                                        <span className="text-primary font-bold text-sm">
                                                            {evaluator.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-zinc-900 dark:text-white font-medium text-sm">
                                                    {evaluator.username}
                                                </p>
                                                <p className="text-zinc-500 dark:text-zinc-500 text-xs font-mono">
                                                    ID: {evaluator.id.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`relative flex h-2 w-2`}>
                                                {active && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                )}
                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? "bg-emerald-500" : "bg-zinc-600"
                                                    }`}></span>
                                            </span>
                                            <span className={`text-xs font-medium ${active ? "text-emerald-400" : "text-zinc-500"
                                                }`}>
                                                {active ? "ATIVO" : "INATIVO"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-zinc-900 dark:text-white font-bold text-lg">
                                            {evaluator.stats.totalHandled}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1">
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            <span className="text-emerald-400 font-bold text-sm">
                                                {evaluator.stats.approved}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-3 py-1">
                                            <XCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-red-400 font-bold text-sm">
                                                {evaluator.stats.rejected}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-1">
                                            <Clock className="w-3 h-3 text-yellow-500" />
                                            <span className="text-yellow-400 font-bold text-sm">
                                                {evaluator.stats.investigating}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-muted-foreground dark:text-zinc-400 text-xs font-mono">
                                            {formatDate(evaluator.stats.lastActivity)}
                                        </p>
                                    </td>
                                </tr >
                            );
                        })}
                    </tbody >
                </table >
            </div >
        </div >
    );
}
