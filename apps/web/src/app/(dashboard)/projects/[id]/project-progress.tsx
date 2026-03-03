"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api';

interface ProjectProgressProps {
    projectId: string;
}

export default function ProjectProgress({ projectId }: ProjectProgressProps) {
    const [progressData, setProgressData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApi(`/progress/project/${projectId}`)
            .then(data => {
                setProgressData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message || "Error al obtener progreso");
                setLoading(false);
            });
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">
                {error}
            </div>
        );
    }

    if (progressData.length === 0) {
        return (
            <div className="p-8 text-center text-neutral-600">
                Aún no hay datos de progreso de los miembros para este proyecto.
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Progreso Global del Coro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressData.map((item, idx) => {
                    const totalUsers = item.total_users || 1; // prevent div by zero
                    const widthNueva = (item.nueva / totalUsers) * 100;
                    const widthProgreso = (item.en_progreso / totalUsers) * 100;
                    const widthDominada = (item.dominada / totalUsers) * 100;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={item.work_id}
                            className="bg-primary-800 border border-white/10 rounded-2xl p-5"
                        >
                            <h4 className="font-medium text-slate-200 mb-3 truncate" title={item.work_title}>{item.work_title}</h4>

                            {/* Progreso en barra */}
                            <div className="w-full h-3 rounded-full overflow-hidden flex mb-2 bg-primary-700">
                                <div style={{ width: `${widthDominada}%` }} className="bg-emerald-500 h-full"></div>
                                <div style={{ width: `${widthProgreso}%` }} className="bg-primary-500 h-full"></div>
                                <div style={{ width: `${widthNueva}%` }} className="bg-slate-500 h-full"></div>
                            </div>

                            {/* Leyenda */}
                            <div className="flex justify-between text-xs text-neutral-300 mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span>{item.dominada} dominada(s)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                    <span>{item.en_progreso} en progreso</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                    <span>{item.nueva} sin iniciar</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
