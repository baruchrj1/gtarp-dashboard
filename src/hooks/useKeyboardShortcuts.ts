import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts() {
    const router = useRouter();

    const shortcuts: KeyboardShortcut[] = [
        {
            key: 'k',
            ctrlKey: true,
            description: 'Busca rápida',
            action: () => {
                // TODO: Open global search modal
                console.log('Open search modal');
            },
        },
        {
            key: 'n',
            ctrlKey: true,
            description: 'Nova denúncia',
            action: () => {
                router.push('/player/new');
            },
        },
        {
            key: 'd',
            ctrlKey: true,
            description: 'Dashboard',
            action: () => {
                router.push('/admin');
            },
        },
        {
            key: 'r',
            ctrlKey: true,
            description: 'Denúncias',
            action: () => {
                router.push('/admin/reports');
            },
        },
        {
            key: '/',
            description: 'Mostrar atalhos',
            action: () => {
                // TODO: Show shortcuts modal
                console.log('Show shortcuts');
            },
        },
    ];

    const handleKeyPress = useCallback(
        (e: KeyboardEvent) => {
            const matchingShortcut = shortcuts.find((shortcut) => {
                const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatches = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : true;
                const shiftMatches = shortcut.shiftKey ? e.shiftKey : true;

                return keyMatches && ctrlMatches && shiftMatches;
            });

            if (matchingShortcut) {
                e.preventDefault();
                matchingShortcut.action();
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return { shortcuts };
}
