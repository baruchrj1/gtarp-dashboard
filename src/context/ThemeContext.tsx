"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = {
    name: string;
    value: string; // The hex value for --color-primary
    label: string;
};

// Predefined colors
export const THEME_COLORS: ThemeColor[] = [
    { name: "purple", value: "#8B5CF6", label: "Roxo (Padrão)" },
    { name: "blue", value: "#3B82F6", label: "Azul" },
    { name: "emerald", value: "#10B981", label: "Esmeralda" },
    { name: "red", value: "#EF4444", label: "Vermelho" },
    { name: "orange", value: "#F97316", label: "Laranja" },
    { name: "pink", value: "#EC4899", label: "Rosa" },
];

interface ThemeContextType {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    currentTheme: ThemeColor;
    themeMode: "dark" | "light";
    setThemeMode: (mode: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Default to purple
    const [primaryColor, setPrimaryColorState] = useState<string>(THEME_COLORS[0].value);
    const [themeMode, setThemeModeState] = useState<"dark" | "light">("dark");

    // Load from local storage on mount
    useEffect(() => {
        const savedColor = localStorage.getItem("gta-rp-primary-color-v1");
        const savedMode = localStorage.getItem("gta-rp-theme-mode-v1") as "dark" | "light" | null;

        if (savedColor) {
            setPrimaryColorState(savedColor);
            updateCssVariables(savedColor);
        }

        if (savedMode) {
            setThemeModeState(savedMode);
            updateThemeClass(savedMode);
        } else {
            // Default to dark if no preference
            updateThemeClass("dark");
        }
    }, []);

    const updateThemeClass = (mode: "dark" | "light") => {
        const root = document.documentElement;
        if (mode === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    };

    const setThemeMode = (mode: "dark" | "light") => {
        setThemeModeState(mode);
        localStorage.setItem("gta-rp-theme-mode-v1", mode);
        updateThemeClass(mode);
    };

    const updateCssVariables = (color: string) => {
        const root = document.documentElement;
        // Update both to be safe, but --primary is the source of truth now
        root.style.setProperty("--primary", color);
        root.style.setProperty("--color-primary", color);
    };

    const setPrimaryColor = (color: string) => {
        setPrimaryColorState(color);
        localStorage.setItem("gta-rp-primary-color-v1", color);
        updateCssVariables(color);
    };

    const currentTheme = THEME_COLORS.find(c => c.value === primaryColor) || THEME_COLORS[0];

    return (
        <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, currentTheme, themeMode, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
