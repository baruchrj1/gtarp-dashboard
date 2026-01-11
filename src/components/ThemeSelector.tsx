"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check, Moon, Sun } from "lucide-react";
import { useTheme, THEME_COLORS } from "@/context/ThemeContext";

export default function ThemeSelector() {
    const { primaryColor, setPrimaryColor, themeMode, setThemeMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded transition-colors group ${isOpen ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                title="Personalizar Tema"
            >
                <Palette className="w-5 h-5 group-hover:scale-105 transition-transform" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="p-3 space-y-3">
                        {/* Mode Toggle */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setThemeMode("light")}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${themeMode === "light"
                                        ? "bg-white text-black shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                <Sun className="w-4 h-4" />
                                Light
                            </button>
                            <button
                                onClick={() => setThemeMode("dark")}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${themeMode === "dark"
                                        ? "bg-zinc-700 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                <Moon className="w-4 h-4" />
                                Dark
                            </button>
                        </div>

                        <div className="h-px bg-white/10" />

                        {/* Color Picker */}
                        <div className="space-y-1">
                            <div className="px-1 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Cor de Destaque
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {THEME_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => {
                                            setPrimaryColor(color.value);
                                            // Keep open to let them try colors, or close? User preference usually to see effect immediately. 
                                            // Let's keep it open or just close if they want to be done.
                                            // Usually one click is enough? Let's leave it open for exploration or close on selection?
                                            // I'll update it to NOT close on color selection so they can browse, but close on outside click.
                                        }}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-xs border ${primaryColor === color.value
                                                ? "bg-white/10 text-white border-primary/50"
                                                : "text-zinc-400 border-transparent hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shadow-sm"
                                            style={{ backgroundColor: color.value }}
                                        />
                                        <span className="flex-1 text-left truncate">{color.label.split(" ")[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
