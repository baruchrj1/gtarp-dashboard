"use client";

import { useState } from "react";
import { Palette, Check, Sun, Moon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useSettings } from "@/contexts/SettingsContext";
import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeSwitcher() {
    const { settings, refreshSettings } = useSettings();
    const { themeMode, setThemeMode } = useTheme();
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

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Personalização de Aparência"
            >
                <div>
                    {/* Appearance Mode */}
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Modo de Aparência
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => setThemeMode("light")}
                            className={`flex flex-col items-center justify-center gap-3 h-24 rounded-xl border transition-all ${themeMode === "light"
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Sun className="w-8 h-8" />
                            <span className="text-sm font-bold uppercase">Modo Claro</span>
                        </button>
                        <button
                            onClick={() => setThemeMode("dark")}
                            className={`flex flex-col items-center justify-center gap-3 h-24 rounded-xl border transition-all ${themeMode === "dark"
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Moon className="w-8 h-8" />
                            <span className="text-sm font-bold uppercase">Modo Escuro</span>
                        </button>
                    </div>

                    <div className="h-px bg-border my-6" />

                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Cor de Destaque
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {PREDEFINED_COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => handleColorChange(color.value)}
                                disabled={isSaving}
                                className={`
                                    group relative flex items-center justify-center h-12 rounded-lg border transition-all
                                    ${settings.theme_color === color.value
                                        ? "border-primary ring-2 ring-primary/30"
                                        : "border-border hover:border-primary/50"
                                    }
                                `}
                                style={{ backgroundColor: `${color.value}10` }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: color.value }}
                                />
                                {settings.theme_color === color.value && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-6 text-center">
                        Suas preferências são salvas automaticamente neste dispositivo.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
