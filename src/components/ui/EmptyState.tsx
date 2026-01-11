"use client";

import { memo, ReactNode } from "react";
import { Search, FileX, Users, AlertCircle, Inbox } from "lucide-react";

type EmptyStateType = "search" | "data" | "users" | "error" | "inbox";

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

const defaultConfig: Record<EmptyStateType, { icon: ReactNode; title: string; description: string }> = {
    search: {
        icon: <Search className="w-12 h-12" />,
        title: "Nenhum resultado encontrado",
        description: "Tente ajustar seus filtros ou termo de busca",
    },
    data: {
        icon: <FileX className="w-12 h-12" />,
        title: "Sem dados",
        description: "Não há registros para exibir no momento",
    },
    users: {
        icon: <Users className="w-12 h-12" />,
        title: "Nenhum usuário encontrado",
        description: "Não há usuários que correspondam aos critérios",
    },
    error: {
        icon: <AlertCircle className="w-12 h-12" />,
        title: "Algo deu errado",
        description: "Não foi possível carregar os dados. Tente novamente.",
    },
    inbox: {
        icon: <Inbox className="w-12 h-12" />,
        title: "Caixa vazia",
        description: "Não há itens para mostrar aqui",
    },
};

function EmptyStateComponent({
    type = "data",
    title,
    description,
    icon,
    action,
    className = "",
}: EmptyStateProps) {
    const config = defaultConfig[type];

    return (
        <div
            className={`
                flex flex-col items-center justify-center py-12 px-4 text-center
                animate-in fade-in-50 duration-500
                ${className}
            `}
        >
            <div className="text-zinc-600 mb-4 opacity-50">
                {icon || config.icon}
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
                {title || config.title}
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm">
                {description || config.description}
            </p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}

export const EmptyState = memo(EmptyStateComponent);

// Shorthand exports for common cases
export function NoSearchResults({ searchTerm }: { searchTerm?: string }) {
    return (
        <EmptyState
            type="search"
            description={searchTerm ? `Nenhum resultado para "${searchTerm}"` : undefined}
        />
    );
}

export function NoData({ message }: { message?: string }) {
    return <EmptyState type="data" description={message} />;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
        <EmptyState
            type="error"
            action={
                onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                    >
                        Tentar novamente
                    </button>
                )
            }
        />
    );
}
