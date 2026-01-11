/**
 * Compact Mode Hook
 * Allows users to toggle between comfortable and compact table views
 */

import { useState, useEffect } from 'react';

export type ViewMode = 'comfortable' | 'compact';

export function useCompactMode(storageKey: string = 'viewMode') {
    const [viewMode, setViewMode] = useState<ViewMode>('comfortable');

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem(storageKey) as ViewMode;
        if (saved === 'comfortable' || saved === 'compact') {
            setViewMode(saved);
        }
    }, [storageKey]);

    const toggleViewMode = () => {
        const newMode: ViewMode = viewMode === 'comfortable' ? 'compact' : 'comfortable';
        setViewMode(newMode);
        localStorage.setItem(storageKey, newMode);
    };

    const setMode = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem(storageKey, mode);
    };

    return {
        viewMode,
        isCompact: viewMode === 'compact',
        toggleViewMode,
        setMode,
    };
}
