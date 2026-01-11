"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ShieldAlert, Gavel, TrendingUp, UserX, AlertTriangle, Send, CheckCircle } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StatsCard from "@/components/admin/StatsCard";
import Modal from "@/components/ui/Modal";
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
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [isCustomDuration, setIsCustomDuration] = useState(false);

    const isAuthenticated = status === "authenticated";
    const isLoadingAuth = status === "loading";
    const role = session?.user?.role || "PLAYER";
    const isAdmin = role === "ADMIN" || session?.user?.isAdmin === true;
    const isEvaluator = role === "EVALUATOR";
    const hasAccess = isAdmin || isEvaluator;

    const { data: durationsData } = useSWR(isAuthenticated && hasAccess ? "/api/admin/config/durations" : null, fetcher);

    // Fetch players data
    const { data, isLoading: isLoadingPlayers } = useSWR(
        isAuthenticated && hasAccess ? "/api/admin/players" : null,
        fetcher
    );

    const allPlayers = data?.players || [];
    const durations = durationsData || [];

    // MOCK DATA FOR VISUALIZATION
    const mockWarnedPlayers = [
        { id: "948372", name: "Pedro_Santos", status: "warned", avatar: null, reason: "Uso indevido do chat de voz" },
        { id: "283746", name: "Ana_Costa", status: "warned", avatar: null, reason: "Desrespeito à staff" },
        { id: "192837", name: "Lucas_Lima", status: "warned", avatar: null, reason: "Anti-RP em área segura" },
    ];

    const mockSuspendedPlayers = [
        { id: "102938", name: "Marcos_Silva", status: "suspended", avatar: null, reason: "Uso de Hack/Cheats", duration: "Permanente" },
        { id: "594832", name: "Joao_Souza", status: "suspended", avatar: null, reason: "RDM em massa", duration: "30 dias" },
        { id: "847382", name: "Ana_Pereira", status: "suspended", avatar: null, reason: "Combat Logging", duration: "7 dias" },
    ];

    // Combine for display
    const displayWarned = [...allPlayers.filter((p: any) => p.status === 'warned'), ...mockWarnedPlayers];
    const displaySuspended = [...allPlayers.filter((p: any) => p.status === 'suspended'), ...mockSuspendedPlayers];


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
    const activeWarnings = displayWarned.length;
    const activeSuspensions = displaySuspended.length;
    const totalPunishments = activeWarnings + activeSuspensions;

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
    if (!isAuthenticated || !hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-wide text-foreground">
                    Acesso Negado
                </h2>
                <div className="text-muted-foreground max-w-md text-center">
                    <p className="mb-2">Apenas membros da staff podem acessar esta área.</p>
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
            description: "Jogadores advertidos",
            onClick: () => setWarningModalOpen(true)
        },
        {
            title: "Banimento Permanente",
            value: activeSuspensions,
            icon: <UserX className="w-6 h-6 text-red-500" />,
            description: "Jogadores banidos",
            onClick: () => setSuspensionModalOpen(true)
        },
    ];

    const selectedPlayerData = players.find((p: any) => p.id === selectedPlayer);

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto pb-12">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </aside>

            <main className="flex-1 space-y-8 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded border border-border">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-widest uppercase font-display">
                            Sistema de <span className="text-primary">Punições</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                            Gerencie punições e notifique jogadores
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                {/* Warning Modal */}
                <Modal
                    isOpen={warningModalOpen}
                    onClose={() => setWarningModalOpen(false)}
                    title="Jogadores Advertidos"
                >
                    <div className="space-y-4">
                        {displayWarned.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhum jogador advertido no momento.</p>
                            </div>
                        ) : (
                            displayWarned.map((player: any) => (
                                <div key={player.id} className="p-3 bg-muted/50 rounded border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {player.avatar ? (
                                                <Image src={player.avatar} alt={player.name} width={32} height={32} className="rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                                    {player.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{player.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {player.id}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 uppercase">
                                            Advertido
                                        </span>
                                    </div>
                                    <div className="pl-11">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-bold uppercase tracking-wide">Motivo:</span> {player.reason || "Não especificado"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Modal>

                {/* Suspension Modal */}
                <Modal
                    isOpen={suspensionModalOpen}
                    onClose={() => setSuspensionModalOpen(false)}
                    title="Jogadores Banidos"
                >
                    <div className="space-y-4">
                        {displaySuspended.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhum jogador banido no momento.</p>
                            </div>
                        ) : (
                            displaySuspended.map((player: any) => (
                                <div key={player.id} className="p-3 bg-muted/50 rounded border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {player.avatar ? (
                                                <Image src={player.avatar} alt={player.name} width={32} height={32} className="rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                                    {player.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{player.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {player.id}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase">
                                            Banido
                                        </span>
                                    </div>
                                    <div className="pl-11 grid grid-cols-2 gap-4">
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-bold uppercase tracking-wide">Motivo:</span> {player.reason || "Não especificado"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-bold uppercase tracking-wide">Duração:</span> {player.duration || "Indefinida"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Modal>

                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <p className="text-emerald-500 font-medium">{successMessage}</p>
                    </div>
                )}

                <div className="bg-card border border-border rounded p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                        <Gavel className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
                            Aplicar Punição
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Search Field */}
                        <div className="bg-muted/30 border border-border rounded p-4">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                🔍 Buscar Jogador (Nome ou ID do Discord)
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Digite o nome ou ID do jogador..."
                                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                            />
                            {searchQuery && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    {players.length} jogador(es) encontrado(s)
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Player Selection */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Selecionar Jogador
                                </label>
                                <select
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    required
                                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors"
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
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Novo Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors"
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
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Motivo da Punição
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                placeholder="Ex: Comportamento inadequado, uso de linguagem ofensiva..."
                                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Duration (only for suspensions) */}
                        {newStatus === "suspended" && (
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Duração da Suspensão
                                </label>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Duração da Suspensão
                                </label>
                                <div className="space-y-3">
                                    <select
                                        value={isCustomDuration ? "custom" : duration}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "custom") {
                                                setIsCustomDuration(true);
                                                setDuration("");
                                            } else {
                                                setIsCustomDuration(false);
                                                setDuration(val);
                                            }
                                        }}
                                        className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                                    >
                                        <option value="">Selecione a duração...</option>
                                        {durations.map((d: any) => (
                                            <option key={d.id} value={d.value}>{d.label}</option>
                                        ))}
                                        <option value="custom">Outro / Personalizado</option>
                                    </select>

                                    {isCustomDuration && (
                                        <input
                                            type="text"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            placeholder="Digite a duração (ex: 45 dias)..."
                                            className="w-full bg-input border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors animate-in fade-in slide-in-from-top-1"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Custom Message */}
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Mensagem Personalizada (Opcional)
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                rows={4}
                                placeholder="Adicione uma mensagem personalizada para o jogador..."
                                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none resize-none transition-colors"
                            />
                        </div>

                        {/* Notify Checkbox */}
                        <div className="flex items-center gap-3 bg-muted/30 border border-border rounded p-4">
                            <input
                                type="checkbox"
                                id="notifyPlayer"
                                checked={notifyPlayer}
                                onChange={(e) => setNotifyPlayer(e.target.checked)}
                                className="w-5 h-5 accent-primary cursor-pointer"
                            />
                            <label htmlFor="notifyPlayer" className="text-sm text-foreground flex items-center gap-2 cursor-pointer">
                                <Send className="w-4 h-4 text-primary" />
                                Notificar jogador via Discord
                            </label>
                        </div>

                        {/* Preview */}
                        {selectedPlayerData && newStatus && (
                            <div className="bg-secondary border border-border rounded p-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Prévia da Ação
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground">
                                        <span className="text-muted-foreground">Jogador:</span> <span className="text-foreground font-bold">{selectedPlayerData.name}</span>
                                    </p>
                                    <p className="text-muted-foreground">
                                        <span className="text-muted-foreground">Status Atual:</span> <span className="text-yellow-500 font-medium">{selectedPlayerData.status === "active" ? "Ativo" : selectedPlayerData.status === "warned" ? "Advertido" : "Suspenso"}</span>
                                    </p>
                                    <p className="text-muted-foreground">
                                        <span className="text-muted-foreground">Novo Status:</span> <span className="text-primary font-bold">{newStatus === "active" ? "Ativo" : newStatus === "warned" ? "Advertido" : "Suspenso"}</span>
                                    </p>
                                    {notifyPlayer && (
                                        <p className="text-emerald-500 text-xs flex items-center gap-2 mt-2">
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
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
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
                <div className="bg-card border border-border rounded p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                        <Send className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
                            Convocar para Call de Alinhamento
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
                            <p className="text-blue-500 dark:text-blue-400 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Esta opção envia uma notificação ao jogador informando que ele deve comparecer a uma call de alinhamento e que sua whitelist ficará retida.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Player Selection for Call */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Selecionar Jogador
                                </label>
                                <select
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:border-blue-500 focus:outline-none transition-colors"
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
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Horário da Call
                                </label>
                                <input
                                    type="text"
                                    value={callTime}
                                    onChange={(e) => setCallTime(e.target.value)}
                                    placeholder="Ex: Hoje às 20h, Amanhã 15h, Segunda 18h..."
                                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Preview for Call */}
                        {selectedPlayer && callTime && (
                            <div className="bg-secondary border border-border rounded p-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Prévia da Notificação
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground">
                                        <span className="text-muted-foreground">Jogador:</span>{" "}
                                        <span className="text-foreground font-bold">
                                            {players.find((p: any) => p.id === selectedPlayer)?.name}
                                        </span>
                                    </p>
                                    <p className="text-muted-foreground">
                                        <span className="text-muted-foreground">Horário:</span>{" "}
                                        <span className="text-blue-500 dark:text-blue-400 font-bold">{callTime}</span>
                                    </p>
                                    <p className="text-yellow-500 text-xs flex items-center gap-2 mt-2">
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
