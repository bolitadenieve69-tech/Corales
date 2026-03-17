'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Calendar, ChevronRight, PlayCircle, Loader2, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function RepertoirePage() {
    const [seasons, setSeasons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRepertoire() {
            try {
                const data = await fetchApi('/management/choir/my-repertoire');
                setSeasons(data || []);
            } catch (err) {
                console.error("Error loading repertoire", err);
            } finally {
                setLoading(false);
            }
        }
        loadRepertoire();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-accent-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <header className="space-y-4">
                <div className="flex items-center gap-3 text-accent-500 font-bold uppercase tracking-widest text-xs">
                    <Music size={14} />
                    Mi Repertorio Musical
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">¿Qué ensayamos hoy?</h1>
                <p className="text-primary-100/60 max-w-2xl text-lg">
                    Accede a las obras programadas para tus temporadas actuales y prepárate para el próximo ensayo.
                </p>
            </header>

            {seasons.length === 0 ? (
                <div className="bg-primary-800/30 border border-dashed border-white/10 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-primary-300">
                        <Calendar size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">No hay temporadas activas</h3>
                        <p className="text-neutral-500 max-w-sm mx-auto">Tu director aún no ha publicado el repertorio para esta temporada. ¡Vuelve pronto!</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {seasons.map((season) => (
                        <section key={season.id} className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-display font-bold text-white">{season.name}</h2>
                                    <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20">
                                        Temporada Actual
                                    </span>
                                </div>
                                <div className="text-sm text-neutral-400 font-medium">
                                    {season.start_date || 'N/A'} — {season.end_date || 'Presente'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {season.projects.map((project: any) => (
                                    <div key={project.id} className="bg-primary-800/40 border border-white/10 rounded-[2rem] overflow-hidden hover:border-accent-500/30 transition-all group">
                                        <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white group-hover:text-accent-300 transition-colors uppercase tracking-tight">
                                                {project.name}
                                            </h3>
                                            <Sparkles className="text-accent-500/40 group-hover:text-accent-500 transition-colors" size={20} />
                                        </div>
                                        <div className="p-2">
                                            {project.repertoire.length === 0 ? (
                                                <p className="p-6 text-neutral-500 italic text-sm text-center">Sin obras asignadas todavía.</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {project.repertoire.map((item: any, idx: number) => (
                                                        <Link
                                                            key={item.id}
                                                            href={`/library/${item.work_id}`}
                                                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent-500/10 transition-all border border-transparent hover:border-accent-500/20 group/item"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-primary-900 border border-white/10 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-white font-bold truncate group-hover/item:text-accent-300">
                                                                    {item.work_title}
                                                                </h4>
                                                                <p className="text-xs text-neutral-500 uppercase font-black tracking-widest">
                                                                    Estudiar Obra
                                                                </p>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-xl bg-accent-500 text-primary-900 flex items-center justify-center shadow-lg transform group-hover/item:scale-110 transition-all">
                                                                <PlayCircle size={24} />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
