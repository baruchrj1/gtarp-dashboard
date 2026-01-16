"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useSession } from "next-auth/react";

export function ThemeSwitcher() {
    const { settings, refreshSettings } = useSettings();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!session) return null;

    const PREDEFINED_COLORS = [
        { name: "Roxo", value: "#8B5CF6", class: "bg-[#8B5CF6]" },
        { name: "Azul", value: "#3B82F6", class: "bg-[#3B82F6]" },
        { name: "Verde", value: "#22C55E", class: "bg-[#22C55E]" },
        { name: "Vermelho", value: "#EF4444", class: "bg-[#EF4444]" },
        { name: "Laranja", value: "#F97316", class: "bg-[#F97316]" },
        { name: "Rosa", value: "#EC4899", class: "bg-[#EC4899]" },
    ];

    async function handleColorChange(color: string) {
        setIsSaving(true);
        try {
            // Optimistic update
            document.documentElement.style.setProperty("--primary", color);
            document.documentElement.style.setProperty("--color-primary", color);
            document.documentElement.style.setProperty("--ring", color);

            const res = await fetch("/api/user/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme_color: color }),
            });

            if (res.ok) {
                await refreshSettings();
            }
        } catch (error) {
            console.error("Failed to save theme preference", error);
        } finally {
            setIsSaving(false);
            setIsOpen(false);
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
                title="Personalizar Tema"
            >
                <Palette className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-50 w-64 bg-card border border-border rounded-lg shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                            Tema Pessoal
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {PREDEFINED_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleColorChange(color.value)}
                                    disabled={isSaving}
                                    className={`
                                        group relative flex items-center justify-center h-10 rounded-md border transition-all
                                        ${settings.theme_color === color.value
                                            ? "border-primary ring-1 ring-primary"
                                            : "border-border hover:border-primary/50"
                                        }
                                    `}
                                    style={{ backgroundColor: `${color.value}20` }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: color.value }}
                                    />
                                    {settings.theme_color === color.value && (
                                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                            <Check className="w-2 h-2" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 leading-tight">
                            Esta cor será visível apenas para você neste dispositivo.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
