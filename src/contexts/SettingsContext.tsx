"use client";

import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";

interface Settings {
    server_name: string;
    server_logo: string;
    theme_color: string;
}

interface SettingsContextType {
    settings: Settings;
    isLoading: boolean;
    refreshSettings: () => void;
}

const defaultSettings: Settings = {
    server_name: "SYSTEM REPORTS",
    server_logo: "",
    theme_color: "#8b5cf6",
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    refreshSettings: () => { },
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { data, mutate, isLoading } = useSWR("/api/settings", (url) => fetch(url).then(res => res.json()), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const settings = data?.settings || defaultSettings;

    // Apply theme color to CSS variable
    useEffect(() => {
        if (settings.theme_color) {
            document.documentElement.style.setProperty("--primary", settings.theme_color);
            document.documentElement.style.setProperty("--color-primary", settings.theme_color);
            document.documentElement.style.setProperty("--ring", settings.theme_color);
        }
    }, [settings.theme_color]);

    // Update document title
    useEffect(() => {
        if (settings.server_name) {
            document.title = settings.server_name;
        }
    }, [settings.server_name]);

    return (
        <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: mutate }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
