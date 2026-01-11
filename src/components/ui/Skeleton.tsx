"use client";

import { memo } from "react";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "rounded";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "wave" | "none";
}

function SkeletonComponent({
    className = "",
    variant = "text",
    width,
    height,
    animation = "pulse",
}: SkeletonProps) {
    const variantClasses = {
        text: "h-4 rounded",
        circular: "rounded-full",
        rectangular: "rounded-none",
        rounded: "rounded-lg",
    };

    const animationClasses = {
        pulse: "animate-pulse",
        wave: "skeleton-wave",
        none: "",
    };

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    return (
        <div
            className={`
                bg-zinc-800/50
                ${variantClasses[variant]}
                ${animationClasses[animation]}
                ${className}
            `}
            style={style}
        />
    );
}

export const Skeleton = memo(SkeletonComponent);

// Pre-built skeleton patterns
export function SkeletonCard() {
    return (
        <div className="gta-card p-4 space-y-3">
            <Skeleton variant="text" className="h-4 w-1/3" />
            <Skeleton variant="text" className="h-8 w-2/3" />
            <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
    );
}

export function SkeletonTableRow() {
    return (
        <tr className="border-b border-zinc-800/50">
            <td className="p-4"><Skeleton variant="circular" width={32} height={32} /></td>
            <td className="p-4"><Skeleton variant="text" className="h-4 w-24" /></td>
            <td className="p-4"><Skeleton variant="text" className="h-4 w-32" /></td>
            <td className="p-4"><Skeleton variant="rounded" className="h-6 w-20" /></td>
            <td className="p-4"><Skeleton variant="text" className="h-4 w-20" /></td>
        </tr>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full">
                <thead className="bg-zinc-900/50">
                    <tr>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <th key={i} className="p-4">
                                <Skeleton variant="text" className="h-4 w-16" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return <Skeleton variant="circular" width={size} height={size} />;
}
