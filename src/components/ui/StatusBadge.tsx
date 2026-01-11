"use client";

import { memo } from "react";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "INVESTIGATING" | string;

interface StatusBadgeProps {
    status: Status;
    size?: "sm" | "md" | "lg";
    showDot?: boolean;
    className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
    PENDING: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        border: "border-yellow-500/30",
        dot: "bg-yellow-500",
        label: "Pendente",
    },
    APPROVED: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/30",
        dot: "bg-emerald-500",
        label: "Aprovado",
    },
    REJECTED: {
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/30",
        dot: "bg-red-500",
        label: "Rejeitado",
    },
    INVESTIGATING: {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        border: "border-blue-500/30",
        dot: "bg-blue-500",
        label: "Investigando",
    },
};

const sizeConfig = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
};

function StatusBadgeComponent({ status, size = "md", showDot = true, className = "" }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.PENDING;
    const sizeClasses = sizeConfig[size];

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider
                transition-all duration-200 ease-out
                ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}
            `}
        >
            {showDot && (
                <span className="relative flex h-2 w-2">
                    <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
                    />
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
                </span>
            )}
            {config.label}
        </span>
    );
}

export const StatusBadge = memo(StatusBadgeComponent);

// Export utility function for getting status color
export function getStatusColor(status: Status): string {
    return statusConfig[status]?.text || statusConfig.PENDING.text;
}

export function getStatusLabel(status: Status): string {
    return statusConfig[status]?.label || status;
}
