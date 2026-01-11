"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ModeToggle() {
    const { themeMode, setThemeMode } = useTheme();

    return (
        <button
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            title={themeMode === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
        >
            {themeMode === "dark" ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
}
