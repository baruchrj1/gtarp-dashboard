'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Users, BarChart3, Settings, X } from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    category: string;
}

/**
 * Global Search Modal (Cmd+K)
 * Quick navigation to any page in the dashboard
 */
export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    // All searchable items
    const allItems: SearchResult[] = [
        // Navigation
        { id: 'dashboard', title: 'Dashboard', description: 'Visão geral e estatísticas', href: '/admin', icon: <BarChart3 className="w-4 h-4" />, category: 'Navegação' },
        { id: 'reports', title: 'Denúncias', description: 'Gerenciar denúncias', href: '/admin/reports', icon: <FileText className="w-4 h-4" />, category: 'Navegação' },
        { id: 'evaluators', title: 'Avaliadores', description: 'Gerenciar avaliadores', href: '/admin/evaluators', icon: <Users className="w-4 h-4" />, category: 'Navegação' },
        { id: 'settings', title: 'Configurações', description: 'Configurações do sistema', href: '/admin/settings', icon: <Settings className="w-4 h-4" />, category: 'Navegação' },

        // Actions
        { id: 'new-report', title: 'Nova Denúncia', description: 'Criar nova denúncia', href: '/player/new', icon: <FileText className="w-4 h-4" />, category: 'Ações' },
    ];

    // Filter items based on query
    const filteredItems = query
        ? allItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        )
        : allItems;

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSelect = useCallback((href: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(href);
    }, [router]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 p-4">
                <div className="gta-card overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b border-border">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar páginas, ações..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                            autoFocus
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Nenhum resultado encontrado
                            </div>
                        ) : (
                            <div className="p-2">
                                {Object.entries(
                                    filteredItems.reduce((acc, item) => {
                                        if (!acc[item.category]) acc[item.category] = [];
                                        acc[item.category].push(item);
                                        return acc;
                                    }, {} as Record<string, SearchResult[]>)
                                ).map(([category, items]) => (
                                    <div key={category} className="mb-4 last:mb-0">
                                        <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            {category}
                                        </div>
                                        {items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item.href)}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors text-left"
                                            >
                                                <div className="text-primary">{item.icon}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
                                Navegar
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">Enter</kbd>
                                Selecionar
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">Esc</kbd>
                            Fechar
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
