"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, Gavel, TrendingUp, UserX, AlertTriangle, Send, CheckCircle } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PunishmentsPage() {
    const { data: session, status } = useSession();
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [reason, setReason] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [duration, setDuration] = useState("");
    const [notifyPlayer, setNotifyPlayer] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingCall, setIsSendingCall] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [callTime, setCallTime] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN";

    // Fetch players data
    const { data, isLoading: isLoadingPlayers } = useSWR(
        isAuthenticated && isAdmin ? "/api/admin/players" : null,
        fetcher
    );

    const allPlayers = data?.players || [];

    // Filter players based on search query (name or ID)
    const players = allPlayers.filter((player: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            player.name.toLowerCase().includes(query) ||
            player.id.toLowerCase().includes(query)
        );
    });

    // Calculate statistics
    const totalPunishments = players.filter((p: any) => p.status !== "active").length;
    const activeWarnings = players.filter((p: any) => p.status === "warned").length;
    const activeSuspensions = players.filter((p: any) => p.status === "suspended").length;

    const handleCallNotification = async () => {
        if (!selectedPlayer) {
            alert("Por favor, selecione um jogador");
            return;
        }

        if (!callTime) {
            alert("Por favor, informe o horário da call");
            return;
        }

        setIsSendingCall(true);
        setSuccessMessage("");

        try {
            const player = players.find((p: any) => p.id === selectedPlayer);
            if (!player) {
                alert("Jogador não encontrado");
                return;
            }

            const notifyResponse = await fetch("/api/admin/punishments/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerId: player.id,
                    playerName: player.name,
                    punishmentType: "custom",
                    reason: `Convocação para Call de Alinhamento - Horário: ${callTime}`,
                    customMessage: `🎯 **CONVOCAÇÃO PARA CALL DE ALINHAMENTO**\n\n` +
                        `Você está sendo convocado(a) para comparecer a uma call de alinhamento com a administração.\n\n` +
                        `⏰ **Horário Agendado:** ${callTime}\n\n` +
                        `⚠️ **IMPORTANTE:** Sua whitelist ficará **retida** até que você compareça à call e resolva os pendências.\n\n` +
                        `📞 Entre no canal de voz indicado pela administração no horário marcado.\n\n` +
                        `Caso não possa comparecer, entre em contato com a administração **IMEDIATAMENTE** para reagendar.`,
                })
            });

            const notifyData = await notifyResponse.json();

            if (!notifyData.success) {
                alert("Erro ao enviar notificação: " + notifyData.error);
                return;
            }

            setSuccessMessage(`✅ Notificação de call enviada para ${player.name}!`);
            setCallTime("");
            setTimeout(() => setSuccessMessage(""), 5000);

        } catch (error) {
            console.error("Error sending call notification:", error);
            alert("Erro ao enviar notificação");
        } finally {
            setIsSendingCall(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage("");

        try {
            const player = players.find((p: any) => p.id === selectedPlayer);
            if (!player) {
                alert("Jogador não encontrado");
                return;
            }

            // Send Discord notification if enabled
            if (notifyPlayer) {
                let punishmentType: "warning" | "suspension" | "reactivation" | "custom" = "custom";

                if (newStatus === "warned") punishmentType = "warning";
                else if (newStatus === "suspended") punishmentType = "suspension";
                else if (newStatus === "active" && player.status !== "active") punishmentType = "reactivation";

                const notifyResponse = await fetch("/api/admin/punishments/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        playerId: player.id,
                        playerName: player.name,
                        punishmentType,
                        reason,
                        customMessage: customMessage || undefined,
                        duration: duration || undefined
                    })
                });

                const notifyData = await notifyResponse.json();

                if (!notifyData.success) {
                    alert("Erro ao enviar notificação: " + notifyData.error);
                    return;
                }
            }

            setSuccessMessage(`Punição aplicada com sucesso para ${player.name}!`);

            // Reset form
            setSelectedPlayer("");
            setNewStatus("");
            setReason("");
            setCustomMessage("");
            setDuration("");

            setTimeout(() => setSuccessMessage(""), 5000);

        } catch (error) {
            console.error("Error applying punishment:", error);
            alert("Erro ao aplicar punição");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while checking session
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect or show denied if not authorized
    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-white">
                    Acesso Negado
                </h2>
                <div className="text-zinc-500 max-w-md text-center">
                    <p className="mb-2">Apenas administradores podem acessar esta área.</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "Total de Punições",
            value: totalPunishments,
            icon: <Gavel className="w-6 h-6 text-primary" />,
            description: "Ativas no sistema"
        },
        {
            title: "Advertências",
            value: activeWarnings,
            icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
            description: "Jogadores advertidos"
        },
        {
            title: "Suspensões",
            value: activeSuspensions,
            icon: <UserX className="w-6 h-6 text-red-500" />,
            description: "Jogadores suspensos"
        },
    ];

    const selectedPlayerData = players.find((p: any) => p.id === selectedPlayer);

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded border border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-display">
                            Sistema de <span className="text-primary">Punições</span>
                        </h1>
                        <p className="text-zinc-400 mt-1 text-sm font-mono uppercase tracking-wider">
                            Gerencie punições e notifique jogadores
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <p className="text-emerald-400 font-medium">{successMessage}</p>
                    </div>
                )}

                <div className="bg-black/40 border border-white/5 rounded p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-primary/20 pb-4">
                        <Gavel className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                            Aplicar Punição
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Search Field */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                🔍 Buscar Jogador (Nome ou ID do Discord)
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Digite o nome ou ID do jogador..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                            />
                            {searchQuery && (
                                <p className="text-xs text-zinc-500 mt-2">
                                    {players.length} jogador(es) encontrado(s)
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Player Selection */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Selecionar Jogador
                                </label>
                                <select
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="">Escolha um jogador...</option>
                                    {players.map((player: any) => (
                                        <option key={player.id} value={player.id}>
                                            {player.name} (ID: {player.id.slice(0, 8)}...) - {player.status === "active" ? "Ativo" : player.status === "warned" ? "Advertido" : "Suspenso"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Selection */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Novo Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="">Escolha o status...</option>
                                    <option value="active">✅ Ativo (Remover Punição)</option>
                                    <option value="warned">⚠️ Advertido</option>
                                    <option value="suspended">🚫 Suspenso</option>
                                </select>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                Motivo da Punição
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                placeholder="Ex: Comportamento inadequado, uso de linguagem ofensiva..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                            />
                        </div>

                        {/* Duration (only for suspensions) */}
                        {newStatus === "suspended" && (
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Duração da Suspensão
                                </label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="Ex: 7 dias, 1 mês, permanente..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none"
                                />
                            </div>
                        )}

                        {/* Custom Message */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                Mensagem Personalizada (Opcional)
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                rows={4}
                                placeholder="Adicione uma mensagem personalizada para o jogador..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        {/* Notify Checkbox */}
                        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded p-4">
                            <input
                                type="checkbox"
                                id="notifyPlayer"
                                checked={notifyPlayer}
                                onChange={(e) => setNotifyPlayer(e.target.checked)}
                                className="w-5 h-5 accent-primary"
                            />
                            <label htmlFor="notifyPlayer" className="text-sm text-zinc-300 flex items-center gap-2">
                                <Send className="w-4 h-4 text-primary" />
                                Notificar jogador via Discord
                            </label>
                        </div>

                        {/* Preview */}
                        {selectedPlayerData && newStatus && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                    Prévia da Ação
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">Jogador:</span> <span className="text-white font-bold">{selectedPlayerData.name}</span>
                                    </p>
                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">Status Atual:</span> <span className="text-yellow-400">{selectedPlayerData.status === "active" ? "Ativo" : selectedPlayerData.status === "warned" ? "Advertido" : "Suspenso"}</span>
                                    </p>
                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">Novo Status:</span> <span className="text-primary font-bold">{newStatus === "active" ? "Ativo" : newStatus === "warned" ? "Advertido" : "Suspenso"}</span>
                                    </p>
                                    {notifyPlayer && (
                                        <p className="text-emerald-400 text-xs flex items-center gap-2 mt-2">
                                            <CheckCircle className="w-3 h-3" />
                                            Notificação será enviada via Discord
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Gavel className="w-5 h-5" />
                                    Aplicar Punição
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Call Notification Section */}
                <div className="bg-black/40 border border-white/5 rounded p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-blue-500/20 pb-4">
                        <Send className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                            Convocar para Call de Alinhamento
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
                            <p className="text-blue-300 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Esta opção envia uma notificação ao jogador informando que ele deve comparecer a uma call de alinhamento e que sua whitelist ficará retida.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Player Selection for Call */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Selecionar Jogador
                                </label>
                                <select
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Escolha um jogador...</option>
                                    {players.map((player: any) => (
                                        <option key={player.id} value={player.id}>
                                            {player.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Call Time */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Horário da Call
                                </label>
                                <input
                                    type="text"
                                    value={callTime}
                                    onChange={(e) => setCallTime(e.target.value)}
                                    placeholder="Ex: Hoje às 20h, Amanhã 15h, Segunda 18h..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Preview for Call */}
                        {selectedPlayer && callTime && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                    Prévia da Notificação
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">Jogador:</span>{" "}
                                        <span className="text-white font-bold">
                                            {players.find((p: any) => p.id === selectedPlayer)?.name}
                                        </span>
                                    </p>
                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">Horário:</span>{" "}
                                        <span className="text-blue-400 font-bold">{callTime}</span>
                                    </p>
                                    <p className="text-yellow-400 text-xs flex items-center gap-2 mt-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Whitelist será retida até comparecimento
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Send Call Button */}
                        <button
                            type="button"
                            onClick={handleCallNotification}
                            disabled={isSendingCall || !selectedPlayer || !callTime}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSendingCall ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Convocação
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
