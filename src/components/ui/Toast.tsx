"use client";

import { createContext, useContext, useState, useCallback, ReactNode, memo } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastConfig: Record<ToastType, { icon: ReactNode; bg: string; border: string; text: string }> = {
    success: {
        icon: <CheckCircle className="w-5 h-5" />,
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-500",
    },
    error: {
        icon: <AlertCircle className="w-5 h-5" />,
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-500",
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5" />,
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-500",
    },
    info: {
        icon: <Info className="w-5 h-5" />,
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-500",
    },
};

const ToastItem = memo(function ToastItem({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) {
    const config = toastConfig[toast.type];

    return (
        <div
            className={`
                relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
                shadow-lg shadow-black/20
                animate-in slide-in-from-right-full duration-300
                ${config.bg} ${config.border}
            `}
        >
            <div className={config.text}>{config.icon}</div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-zinc-400 mt-1">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-zinc-500 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
});

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        const duration = toast.duration ?? 5000;

        setToasts((prev) => [...prev, { ...toast, id }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        addToast({ type: "success", title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: "error", title, message });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: "warning", title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: "info", title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
