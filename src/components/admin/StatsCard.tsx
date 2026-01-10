interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    description?: string;
}

export default function StatsCard({ title, value, icon, trend, description }: StatsCardProps) {
    return (
        <div className="gta-card p-6 relative overflow-hidden group bg-card hover:bg-zinc-900/80 transition-all border-l-4 border-l-primary/50 hover:border-l-primary">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity scale-150 transform translate-x-2 -translate-y-2">
                {icon}
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-xs font-bold font-display uppercase tracking-widest text-zinc-500 mb-2">{title}</h3>
                    <div className="text-4xl font-bold text-white tracking-tight">{value}</div>
                    {description && (
                        <div className="flex items-center mt-2">
                            {trend && <span className="text-xs font-bold text-primary mr-2 uppercase">{trend}</span>}
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">{description}</p>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                    {icon}
                </div>
            </div>
        </div>
    );
}
