"use client";

import { ReactNode, memo } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

function PageTransitionComponent({ children, className = "" }: PageTransitionProps) {
    return (
        <div
            className={`
                animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out
                ${className}
            `}
        >
            {children}
        </div>
    );
}

export const PageTransition = memo(PageTransitionComponent);

// Staggered animation for lists
export function StaggeredList({
    children,
    className = "",
    staggerDelay = 50
}: {
    children: ReactNode[];
    className?: string;
    staggerDelay?: number;
}) {
    return (
        <div className={className}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className="animate-in fade-in-0 slide-in-from-bottom-2"
                    style={{
                        animationDelay: `${index * staggerDelay}ms`,
                        animationFillMode: "both",
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}

// Fade in animation wrapper
export function FadeIn({
    children,
    delay = 0,
    duration = 500,
    className = ""
}: {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}) {
    return (
        <div
            className={`animate-in fade-in-0 ${className}`}
            style={{
                animationDelay: `${delay}ms`,
                animationDuration: `${duration}ms`,
                animationFillMode: "both",
            }}
        >
            {children}
        </div>
    );
}

// Scale in animation
export function ScaleIn({
    children,
    className = ""
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`animate-in zoom-in-95 fade-in-0 duration-300 ${className}`}>
            {children}
        </div>
    );
}
