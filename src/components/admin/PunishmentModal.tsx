'use client';

import { useState } from 'react';
import { X, Hammer, Clock, AlertTriangle } from 'lucide-react';
import { LoadingButton } from '@/components/ui/LoadingButton';

interface PunishmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    accusedId: string;
    accusedName?: string;
    reportId: number;
    reportReason: string;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/punishments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: accusedId,
                    type,
                    duration: type === 'TEMP_BAN' ? parseInt(duration) : undefined,
                    reason,
                    reportId,
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
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4">
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
                                    <p className="text-sm text-muted-foreground">
                                        Denunciado: <span className="font-mono text-foreground">{accusedId}</span>
                                        {accusedName && <span className="ml-2">({accusedName})</span>}
                                    </p>
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
                                Motivo
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none h-32"
                                placeholder="Descreva o motivo da punição..."
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
                                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
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
