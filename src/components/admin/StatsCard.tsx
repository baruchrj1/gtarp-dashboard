"use client";

import { memo } from "react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    description?: string;
    isText?: boolean;
    loading?: boolean;
    onClick?: () => void;
}

function StatsCardComponent({ title, value, icon, trend, description, isText, loading, onClick }: StatsCardProps) {
    if (loading) {
        return (
            <div className="gta-card p-6 relative overflow-hidden bg-card border-l-4 border-l-primary/30 animate-pulse">
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="h-3 w-20 bg-zinc-800 rounded" />
                        <div className="h-10 w-16 bg-zinc-800 rounded" />
                        <div className="h-3 w-32 bg-zinc-800 rounded" />
                    </div>
                    <div className="w-12 h-12 bg-zinc-800 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`gta-card p-6 relative overflow-hidden group bg-card transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary hover-lift ${onClick ? 'cursor-pointer hover:bg-accent dark:hover:bg-zinc-900/80' : ''}`}
        >
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 scale-150 transform translate-x-2 -translate-y-2">
                {icon}
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-xs font-bold font-display uppercase tracking-widest text-zinc-700 dark:text-zinc-400 mb-2">
                        {title}
                    </h3>
                    <div
                        className={`${isText ? "text-2xl" : "text-4xl"
                            } font-bold text-foreground dark:text-white tracking-tight transition-all duration-300 group-hover:text-primary`}
                    >
                        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
                    </div>
                    {description && (
                        <div className="flex items-center mt-2">
                            {trend && (
                                <span
                                    className={`text-xs font-bold mr-2 uppercase ${trend.startsWith("+") ? "text-emerald-500" : trend.startsWith("-") ? "text-red-500" : "text-primary"
                                        }`}
                                >
                                    {trend}
                                </span>
                            )}
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">{description}</p>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300 group-hover:scale-110">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default memo(StatsCardComponent);
