'use client';

import { useState, useEffect } from 'react';
import { X, Hammer, Clock, AlertTriangle, Search, User, Users } from 'lucide-react';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useDebounce } from '@/hooks/useDebounce';
import useSWR from 'swr';

interface PunishmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    accusedId?: string;
    accusedName?: string;
    reportId?: number;
    reportReason?: string;
}

type PunishmentType = 'WARNING' | 'KICK' | 'TEMP_BAN' | 'PERM_BAN';

export function PunishmentModal({
    isOpen,
    onClose,
    accusedId,
    accusedName,
    reportId,
    reportReason,
}: PunishmentModalProps) {
    const [type, setType] = useState<PunishmentType>('WARNING');
    const [duration, setDuration] = useState('24');
    const [reason, setReason] = useState(reportReason || '');
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(
        accusedId ? { id: accusedId, name: accusedName || accusedId } : null
    );
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [organization, setOrganization] = useState('');

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Fetch organizations
    const { data: orgsData } = useSWR('/api/admin/config/organizations');
    const organizations = orgsData?.organizations || [];

    // Search for players
    useEffect(() => {
        if (!debouncedSearch || debouncedSearch.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const searchPlayers = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(debouncedSearch)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.users || []);
                    setShowResults(true);
                }
            } catch (error) {
                console.error('Error searching players:', error);
            } finally {
                setIsSearching(false);
            }
        };

        searchPlayers();
    }, [debouncedSearch]);

    const handleSelectPlayer = (player: any) => {
        setSelectedPlayer({ id: player.id, name: player.username || player.name });
        setSearchQuery('');
        setShowResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPlayer) {
            alert('Por favor, selecione um jogador');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/punishments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedPlayer.id,
                    type,
                    duration: type === 'TEMP_BAN' ? parseInt(duration) : undefined,
                    reason,
                    reportId,
                    organization: organization || undefined,
                }),
            });

            if (!response.ok) throw new Error('Erro ao aplicar punição');

            alert('Punição aplicada com sucesso!');
            onClose();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao aplicar punição. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const punishmentTypes = [
        { value: 'WARNING', label: 'Advertência', color: 'yellow', icon: AlertTriangle },
        { value: 'KICK', label: 'Kick', color: 'orange', icon: Hammer },
        { value: 'TEMP_BAN', label: 'Ban Temporário', color: 'red', icon: Clock },
        { value: 'PERM_BAN', label: 'Ban Permanente', color: 'red', icon: X },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4 max-h-[90vh] overflow-y-auto">
                <div className="gta-card overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-gradient-to-r from-orange-500/10 to-red-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Hammer className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">
                                        Aplicar Punição
                                    </h2>
                                    {selectedPlayer ? (
                                        <p className="text-sm text-muted-foreground">
                                            Denunciado: <span className="font-mono text-foreground">{selectedPlayer.id}</span>
                                            {selectedPlayer.name && <span className="ml-2">({selectedPlayer.name})</span>}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Busque o jogador para punir
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Player Search */}
                        {!accusedId && (
                            <div className="relative">
                                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Buscar Jogador
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Digite o ID ou nome do jogador..."
                                        className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Search Results */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map((player) => (
                                            <button
                                                key={player.id}
                                                type="button"
                                                onClick={() => handleSelectPlayer(player)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{player.username || player.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {player.id}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {showResults && searchResults.length === 0 && !isSearching && (
                                    <div className="absolute z-10 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                                        Nenhum jogador encontrado
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected Player Display */}
                        {selectedPlayer && !accusedId && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{selectedPlayer.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {selectedPlayer.id}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPlayer(null)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Punishment Type */}
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                Tipo de Punição
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {punishmentTypes.map((pt) => {
                                    const Icon = pt.icon;
                                    return (
                                        <button
                                            key={pt.value}
                                            type="button"
                                            onClick={() => setType(pt.value as PunishmentType)}
                                            className={`p-4 rounded-lg border-2 transition-all ${type === pt.value
                                                ? `border-${pt.color}-500 bg-${pt.color}-500/10`
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${type === pt.value ? `text-${pt.color}-500` : 'text-muted-foreground'}`} />
                                                <span className={`font-bold text-sm ${type === pt.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {pt.label}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Duration (only for TEMP_BAN) */}
                        {type === 'TEMP_BAN' && (
                            <div>
                                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    Duração (horas)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="720"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                    placeholder="24"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Máximo: 720 horas (30 dias)
                                </p>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Motivo da Punição
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="Ex: Comportamento inadequado, uso de linguagem ofensiva..."
                            />
                        </div>

                        {/* Organization Selector */}
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                <Users className="w-4 h-4 inline mr-2" />
                                Organização do Jogador
                            </label>
                            <select
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="">Selecione uma organização (opcional)...</option>
                                {organizations.map((org: any) => (
                                    <option key={org.id || org.name} value={org.name}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Essa informação será usada nas estatísticas
                            </p>
                        </div>

                        {/* Custom Message (Optional) */}
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Mensagem Personalizada (Opcional)
                            </label>
                            <textarea
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none h-24"
                                placeholder="Adicione uma mensagem personalizada para o jogador..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-bold uppercase tracking-wider text-sm"
                            >
                                Cancelar
                            </button>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                loadingText="Aplicando..."
                                disabled={!selectedPlayer}
                                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Hammer className="w-4 h-4 mr-2" />
                                Aplicar Punição
                            </LoadingButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
