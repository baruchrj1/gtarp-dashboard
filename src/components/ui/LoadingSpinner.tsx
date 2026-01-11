"use client";

import { memo } from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const sizeConfig = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
};

function LoadingSpinnerComponent({ size = "lg", className = "", text, fullScreen = false }: LoadingSpinnerProps) {
    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`
                    animate-spin rounded-full border-primary/30 border-t-primary
                    ${sizeConfig[size]}
                `}
            />
            {text && (
                <p className="text-sm text-zinc-400 animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
}

export const LoadingSpinner = memo(LoadingSpinnerComponent);

// Page loading component
export function PageLoading({ text = "Carregando..." }: { text?: string }) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

// Inline loading for buttons
export function ButtonSpinner() {
    return <LoadingSpinner size="sm" className="mr-2" />;
}
