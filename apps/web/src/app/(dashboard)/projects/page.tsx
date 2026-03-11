'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Calendar, Music4, Eye, EyeOff } from 'lucide-react';

import { fetchApi } from '@/lib/api';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi('/projects/?skip=0&limit=100')
            .then(data => {
                if (data) {
                    setProjects(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching projects", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-12 text-center text-neutral-600">Cargando proyectos...</div>;
    }

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-none">Proyectos</h1>
                    <p className="text-neutral-600 mt-3 font-medium text-lg">Gestiona los próximos conciertos y repertorios magistrales.</p>
                </div>
                <Link href="/projects/new">
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-800 text-white rounded-full font-bold transition-all shadow-lg shadow-glow-primary active:scale-95">
                        <Plus size={20} />
                        Nuevo Proyecto
                    </button>
                </Link>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-neutral-300" />

            {/* Grid */}
            {projects.length === 0 ? (
                 <div className="py-24 text-center bg-white rounded-3xl border border-neutral-200 shadow-sm">
                    <Music4 className="mx-auto text-neutral-300 mb-4" size={48} />
                    <h3 className="text-xl font-display font-bold text-foreground">No hay proyectos activos</h3>
                    <p className="text-neutral-500 mt-2">Comienza creando tu primer concierto o programa de estudio.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, i) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white border border-neutral-200 rounded-[2rem] p-8 hover:border-primary-500/30 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary-500 transition-colors line-clamp-2 leading-tight">
                                        {project.name}
                                    </h3>
                                    <div className="bg-neutral-100 p-2 rounded-xl">
                                        {project.is_published ? (
                                            <Eye size={18} className="text-emerald-500 shrink-0" aria-label="Publicado" />
                                        ) : (
                                            <EyeOff size={18} className="text-neutral-400 shrink-0" aria-label="Borrador" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                                            <Calendar size={16} />
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {project.date
                                                ? new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                                : 'Fecha sin confirmar'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                                            <Music4 size={16} />
                                        </div>
                                        <span className="text-sm font-semibold">{(project.repertoire || []).length} obras asignadas</span>
                                    </div>
                                </div>

                                <div className="mt-10 flex items-center justify-between">
                                    <div className="flex items-center text-sm font-black uppercase tracking-widest text-primary-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                        Ver detalles
                                        <ChevronRight size={16} className="ml-1" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
