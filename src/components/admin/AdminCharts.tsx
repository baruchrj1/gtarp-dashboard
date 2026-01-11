'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

// Lazy load charts - they're heavy and not needed immediately
export const AdminCharts = dynamic(() => import('./AdminChartsContent'), {
    loading: () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Skeleton 1 */}
            <div className="lg:col-span-2 gta-card p-6">
                <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
                <div className="h-[300px] bg-muted/50 animate-pulse rounded" />
            </div>

            {/* Chart Skeleton 2 */}
            <div className="gta-card p-6">
                <div className="h-6 w-40 bg-muted animate-pulse rounded mb-6" />
                <div className="h-[300px] bg-muted/50 animate-pulse rounded" />
            </div>
        </div>
    ),
    ssr: false, // Charts don't need server-side rendering
});
