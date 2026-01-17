"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { useTheme } from "@/context/ThemeContext";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface AdminChartsProps {
    dailyStats: any[];
    timeRange: "7d" | "30d" | "month";
    categoryStats: any[];
    overview: any;
    topReasons: any[];
    topGroups: any[];
}

export default function AdminChartsContent({
    dailyStats,
    timeRange,
    categoryStats,
    overview,
    topReasons,
    topGroups
}: AdminChartsProps) {
    const { themeMode } = useTheme();
    const axisColor = themeMode === "dark" ? "#fff" : "#666";
    const gridColor = themeMode === "dark" ? "#333" : "#e5e5e5";

    return (
        <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Activity Chart */}
                <div className="lg:col-span-2 gta-card p-6">
                    <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Bar className="w-5 h-5 text-primary" />
                        Atividade {timeRange === "7d" && " (7 Dias)"}{timeRange === "30d" && " (30 Dias)"}{timeRange === "month" && " Mensal"}
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} />
                                <YAxis stroke={axisColor} fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Reasons Pie Chart */}
                <div className="bg-card dark:bg-black/40 border border-border dark:border-white/5 rounded p-6">
                    <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        Principais Motivos
                    </h3>
                    <div className="w-full">
                        <div className="flex flex-col">
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={topReasons}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {topReasons.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 space-y-3">
                                {topReasons.map((reason, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border dark:border-white/5 last:border-0 hover:bg-muted dark:hover:bg-white/5 px-2 rounded transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                                style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}40` }}
                                            />
                                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{reason.name}</span>
                                        </div>
                                        <span className="font-bold text-white dark:text-white font-mono bg-zinc-900/50 dark:bg-white/10 px-2 py-0.5 rounded text-xs text-foreground dark:text-white">{reason.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Groups, Players */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Punished Groups */}
                <div className="gta-card p-6">
                    <h3 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Bar className="w-5 h-5 text-red-500" />
                        Grupos Mais Punidos
                    </h3>
                    <div className="h-[300px] w-full">
                        {topGroups && topGroups.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={topGroups} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                    <XAxis type="number" stroke={axisColor} fontSize={12} tickLine={false} />
                                    <YAxis dataKey="name" type="category" stroke={axisColor} fontSize={12} tickLine={false} width={100} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-zinc-500 py-8 h-full flex items-center justify-center">Nenhum dado disponível.</p>
                        )}
                    </div>
                </div>

                {/* Categories Chart */}
                <div className="gta-card p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Bar className="w-5 h-5 text-primary" />
                        Por Categoria
                    </h3>
                    <div className="h-[300px] w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                                <XAxis type="number" stroke={axisColor} />
                                <YAxis dataKey="category" type="category" width={100} stroke={axisColor} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: themeMode === 'dark' ? '#18181b' : '#fff', borderRadius: '8px', border: '1px solid #3f3f46' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
