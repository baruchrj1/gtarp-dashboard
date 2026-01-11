import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * Hook for managing persistent filters via URL query parameters
 * Filters are preserved in the URL and can be shared via links
 * 
 * @example
 * const { filters, setFilter, clearFilters } = usePersistedFilters();
 * 
 * // Set a filter
 * setFilter('status', 'PENDING');
 * 
 * // Get a filter value
 * const status = filters.status;
 * 
 * // Clear all filters
 * clearFilters();
 */
export function usePersistedFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    // Convert searchParams to object
    const filters = Object.fromEntries(searchParams.entries());

    /**
     * Set a filter value
     */
    const setFilter = (key: string, value: string | null) => {
        if (!isReady) return;

        const params = new URLSearchParams(searchParams);

        if (value === null || value === '' || value === 'ALL') {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        // Update URL without page reload
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl, { scroll: false });
    };

    /**
     * Set multiple filters at once
     */
    const setFilters = (newFilters: Record<string, string | null>) => {
        if (!isReady) return;

        const params = new URLSearchParams(searchParams);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === null || value === '' || value === 'ALL') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl, { scroll: false });
    };

    /**
     * Clear all filters
     */
    const clearFilters = () => {
        if (!isReady) return;
        router.push(pathname, { scroll: false });
    };

    /**
     * Get a specific filter value
     */
    const getFilter = (key: string, defaultValue: string = ''): string => {
        return filters[key] || defaultValue;
    };

    return {
        filters,
        setFilter,
        setFilters,
        clearFilters,
        getFilter,
        isReady,
    };
}
