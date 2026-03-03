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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-neutral-300 mt-1">Gestiona los próximos conciertos y repertorios.</p>
                </div>
                <Link href="/projects/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-500 text-white rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <Plus size={18} />
                        Nuevo Proyecto
                    </button>
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, i) => (
                    <Link href={`/projects/${project.id}`} key={project.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group bg-primary-800 border border-white/10 rounded-2xl p-6 hover:border-primary-500/50 hover:bg-[#0f0f24] transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-2 leading-tight">
                                    {project.name}
                                </h3>
                                {project.is_published ? (
                                    <Eye size={18} className="text-emerald-400 shrink-0" />
                                ) : (
                                    <EyeOff size={18} className="text-neutral-600 shrink-0" />
                                )}
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="flex items-center gap-3 text-neutral-300">
                                    <Calendar size={16} className="text-neutral-600" />
                                    <span className="text-sm">
                                        {project.date
                                            ? new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : 'Fecha sin confirmar'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-300">
                                    <Music4 size={16} className="text-neutral-600" />
                                    <span className="text-sm">{(project.repertoire || []).length} obras asignadas</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center text-sm font-medium text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Ver detalles
                                <ChevronRight size={16} className="ml-1" />
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
