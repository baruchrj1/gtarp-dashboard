'use client';

// Placeholder component for charts - charts functionality was removed
export default function AdminChartsContent() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Placeholder 1 */}
            <div className="lg:col-span-2 gta-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Estatísticas</h3>
                <div className="h-[300px] bg-muted/30 rounded flex items-center justify-center text-muted-foreground">
                    Gráficos em desenvolvimento
                </div>
            </div>

            {/* Chart Placeholder 2 */}
            <div className="gta-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Resumo</h3>
                <div className="h-[300px] bg-muted/30 rounded flex items-center justify-center text-muted-foreground">
                    Em breve
                </div>
            </div>
        </div>
    );
}
